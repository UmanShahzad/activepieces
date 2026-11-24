import { createAction, Property } from '@activepieces/pieces-framework';
import { vpndetectionAuth } from '../auth';
import { lookupIp, readKey, withPartial } from '../common';
import { lookupIpOutput } from '../output';

export const lookupIpAction = createAction({
  auth: vpndetectionAuth,
  name: 'lookup_ip',
  displayName: 'Lookup IP',
  description: 'Checks whether an IP address is a VPN, Tor, relay, proxy, hosting or bot address, with its location and ASN.',
  classification: 'READ',
  audience: 'both',
  aiMetadata: {
    description:
      'Look up one IPv4 or IPv6 address in VPNDetection: is_vpn, is_tor and is_relay, plus is_hosting, is_cdn, is_bot and the four proxy flags (residential, datacenter, mobile, public) on a paid plan, each with its provider and confidence, and the location and ASN. ' +
      'A flag missing from the answer was not checked on this plan, and `partial` is true then: never read a missing flag as false. ' +
      'A private or reserved address answers is_bogon true. Read-only and safe to repeat. Use Lookup IPs for many addresses at once.',
    idempotent: true,
  },
  props: {
    ip: Property.ShortText({
      displayName: 'IP Address',
      description: 'The IPv4 or IPv6 address to check.',
      required: true,
    }),
  },
  outputSchema: lookupIpOutput,
  async run(context) {
    const answer = await lookupIp(readKey(context.auth), context.propsValue.ip);
    return withPartial(answer);
  },
});
