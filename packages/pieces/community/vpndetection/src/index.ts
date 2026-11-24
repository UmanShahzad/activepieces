import { createPiece, PieceCategory } from '@activepieces/pieces-framework';
import { vpndetectionAuth } from './lib/auth';
import { lookupIpAction } from './lib/actions/lookup-ip';
import { lookupIpsAction } from './lib/actions/lookup-ips';

export const vpndetection = createPiece({
  displayName: 'VPNDetection',
  description: 'Detect VPN, Tor, relay, proxy, hosting and bot IP addresses, with location and ASN.',
  auth: vpndetectionAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/vpndetection.png',
  categories: [PieceCategory.DEVELOPER_TOOLS],
  authors: ['UmanShahzad'],
  actions: [lookupIpAction, lookupIpsAction],
  triggers: [],
});
