import { afterEach, describe, expect, test, vi } from 'vitest';
import { lookupIp, lookupIps, parseIps, withPartial } from '../src/lib/common';
import { API_KEY, stubFetch } from './helpers';

afterEach(() => vi.unstubAllGlobals());

const KEYLESS = { ip: '185.220.101.1', is_bogon: false, is_vpn: false, is_relay: false, is_tor: true, is_bot: false };
const FULL = { ...KEYLESS, is_hosting: true, is_cdn: false, is_resproxy: false, is_dcproxy: false, is_mobproxy: false, is_pubproxy: false };

describe('lookup ip', () => {
  test('sends the key as a Bearer header to GET /{ip}', async () => {
    const seen = stubFetch(() => ({ body: FULL }));
    const answer = await lookupIp(API_KEY, ' 185.220.101.1 ');
    expect(seen.map((r) => `${r.method} ${r.url}`)).toEqual(['GET https://api.vpndetection.io/185.220.101.1']);
    expect(seen[0].headers.get('authorization')).toBe(`Bearer ${API_KEY}`);
    expect(withPartial(answer).partial).toBe(false);
  });

  test('an answer missing a keyed flag is partial, a bogon never', () => {
    expect(withPartial(KEYLESS).partial).toBe(true);
    expect(withPartial({ ...KEYLESS, ip: '192.168.1.1', is_bogon: true, is_tor: false }).partial).toBe(false);
  });

  test('an IPv6 address is sent escaped', async () => {
    const seen = stubFetch(() => ({ body: FULL }));
    await lookupIp(API_KEY, '2606:4700:4700::1111');
    expect(seen[0].url).toBe('https://api.vpndetection.io/2606%3A4700%3A4700%3A%3A1111');
  });

  test("an error carries the API's message", async () => {
    stubFetch(() => ({ status: 400, body: { error: 'not a valid IP address' } }));
    await expect(lookupIp(API_KEY, 'nope')).rejects.toThrow('VPNDetection answered 400: not a valid IP address');
  });
});

describe('lookup ips', () => {
  test('posts the distinct addresses to /batch', async () => {
    const seen = stubFetch(() => ({ body: { results: { '1.1.1.1': FULL }, errors: { nope: { status: 400, error: 'not a valid IP address' } } } }));
    const answer = await lookupIps(API_KEY, parseIps(['1.1.1.1', ' 1.1.1.1', 'nope']));
    expect(seen[0].method).toBe('POST');
    expect(seen[0].path).toBe('/batch');
    expect(seen[0].body).toEqual({ ips: ['1.1.1.1', 'nope'] });
    expect(answer.errors['nope'].status).toBe(400);
  });

  test('takes a comma or newline separated string too, and refuses none or too many', () => {
    expect(parseIps('1.1.1.1, 8.8.8.8\n9.9.9.9')).toEqual(['1.1.1.1', '8.8.8.8', '9.9.9.9']);
    expect(() => parseIps([])).toThrow('at least one');
    expect(() => parseIps(Array.from({ length: 1001 }, (_, i) => `10.0.${i >> 8}.${i & 255}`))).toThrow('at most 1000');
  });
});
