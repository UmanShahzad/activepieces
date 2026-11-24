import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { PieceAuth } from '@activepieces/pieces-framework';
import { VPNDETECTION_API_URL } from './common';

export const vpndetectionAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  description: `Create a free account at https://app.vpndetection.io and copy an API key from it.

Every key answers the VPN, Tor and relay flags, location and ASN. A paid plan, or a new account's trial, adds hosting, proxy, CDN and bot detection with the detail behind each.`,
  required: true,
  validate: async ({ auth }) => {
    try {
      await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${VPNDETECTION_API_URL}/api/v1/entitlement`,
        headers: { Authorization: `Bearer ${auth}` },
      });
      return { valid: true };
    } catch {
      return { valid: false, error: 'VPNDetection did not accept this API key.' };
    }
  },
});
