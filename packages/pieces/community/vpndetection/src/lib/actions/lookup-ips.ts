import { createAction, Property } from '@activepieces/pieces-framework';
import { vpndetectionAuth } from '../auth';
import { lookupIps, MAX_BATCH, parseIps, readKey, withPartial } from '../common';
import { lookupIpsOutput } from '../output';

export const lookupIpsAction = createAction({
  auth: vpndetectionAuth,
  name: 'lookup_ips',
  displayName: 'Lookup IPs',
  description: `Checks up to ${MAX_BATCH} IP addresses in one call. Needs a key on a paid plan.`,
  classification: 'READ',
  audience: 'both',
  aiMetadata: {
    description:
      `Look up to ${MAX_BATCH} IPv4 or IPv6 addresses in one VPNDetection call; each answer has exactly the fields Lookup IP would give for it. ` +
      'Answers come back in `results` in the order given, each with the string sent as `input`; an entry that could not be answered (not an address) is in `errors` with its status and message and never fails the others. ' +
      'Needs an API key on a paid plan; on the free plan it answers a single address only. Read-only and safe to repeat.',
    idempotent: true,
  },
  props: {
    ips: Property.Array({
      displayName: 'IP Addresses',
      description: `The addresses to check, at most ${MAX_BATCH}. Duplicates are looked up once.`,
      required: true,
    }),
  },
  outputSchema: lookupIpsOutput,
  async run(context) {
    const ips = parseIps(context.propsValue.ips);
    const answer = await lookupIps(readKey(context.auth), ips);
    return {
      results: ips.filter((ip) => ip in answer.results).map((ip) => ({ input: ip, ...withPartial(answer.results[ip]) })),
      errors: ips.filter((ip) => ip in answer.errors).map((ip) => ({ input: ip, ...answer.errors[ip] })),
    };
  },
});
