import { HttpError, HttpMethod, httpClient } from '@activepieces/pieces-common';

export const VPNDETECTION_API_URL = 'https://api.vpndetection.io';

// The most addresses POST /batch takes in one call.
export const MAX_BATCH = 1000;

// Flags only a key on a paid plan, or a new account's trial, carries. An answer missing any is partial, so a
// missing flag never reads as false. A bogon (a private or reserved address) is never partial: nothing to check.
const KEYED_FLAGS = ['is_hosting', 'is_cdn', 'is_resproxy', 'is_dcproxy', 'is_mobproxy', 'is_pubproxy'];

export type LookupResult = Record<string, unknown> & { ip: string };

export function withPartial(result: LookupResult): LookupResult & { partial: boolean } {
  return { ...result, partial: result['is_bogon'] !== true && KEYED_FLAGS.some((flag) => result[flag] === undefined) };
}

export function readKey(auth: { secret_text: string }): string {
  return auth.secret_text.trim();
}

async function call<T>(params: { method: HttpMethod; path: string; apiKey: string; body?: unknown }): Promise<T> {
  try {
    const response = await httpClient.sendRequest<T>({
      method: params.method,
      url: `${VPNDETECTION_API_URL}${params.path}`,
      headers: { Authorization: `Bearer ${params.apiKey}` },
      body: params.body,
    });
    return response.body;
  } catch (error) {
    if (error instanceof HttpError) {
      const { status, body } = error.errorMessage().response;
      const message = (body as { error?: unknown } | undefined)?.error;
      throw new Error(`VPNDetection answered ${status}: ${typeof message === 'string' ? message : JSON.stringify(body)}`);
    }
    throw error;
  }
}

export async function lookupIp(apiKey: string, ip: string): Promise<LookupResult> {
  return call<LookupResult>({ method: HttpMethod.GET, path: `/${encodeURIComponent(ip.trim())}`, apiKey });
}

export type BatchAnswer = {
  results: Record<string, LookupResult>;
  errors: Record<string, { status: number; error: string }>;
};

export async function lookupIps(apiKey: string, ips: string[]): Promise<BatchAnswer> {
  return call<BatchAnswer>({ method: HttpMethod.POST, path: '/batch', apiKey, body: { ips } });
}

export function parseIps(input: unknown): string[] {
  const values = Array.isArray(input) ? input : typeof input === 'string' ? input.split(/[\s,]+/) : [];
  const ips = [...new Set(values.map((value) => String(value).trim()).filter((value) => value !== ''))];
  if (ips.length === 0) {
    throw new Error('Give at least one IP address.');
  }
  if (ips.length > MAX_BATCH) {
    throw new Error(`Lookup IPs takes at most ${MAX_BATCH} addresses in one call; ${ips.length} were given.`);
  }
  return ips;
}
