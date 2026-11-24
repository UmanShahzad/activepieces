import { OutputSchema } from '@activepieces/pieces-framework';

const answerFields: OutputSchema['fields'] = [
  { key: 'ip', label: 'IP Address' },
  { key: 'is_vpn', label: 'VPN', format: 'boolean' },
  { key: 'is_tor', label: 'Tor', format: 'boolean' },
  { key: 'is_relay', label: 'Relay', format: 'boolean' },
  { key: 'is_hosting', label: 'Hosting', format: 'boolean' },
  { key: 'is_resproxy', label: 'Residential Proxy', format: 'boolean' },
  { key: 'is_dcproxy', label: 'Datacenter Proxy', format: 'boolean' },
  { key: 'is_mobproxy', label: 'Mobile Proxy', format: 'boolean' },
  { key: 'is_pubproxy', label: 'Public Proxy', format: 'boolean' },
  { key: 'is_cdn', label: 'CDN', format: 'boolean' },
  { key: 'is_bot', label: 'Bot', format: 'boolean' },
  { key: 'is_bogon', label: 'Bogon', format: 'boolean' },
  { key: 'partial', label: 'Partial Answer', format: 'boolean' },
  { key: 'vpn', label: 'VPN Detail', children: [{ key: 'provider_name', label: 'Provider' }, { key: 'confidence', label: 'Confidence' }] },
  {
    key: 'location',
    label: 'Location',
    children: [
      { key: 'country', label: 'Country Code' },
      { key: 'country_name', label: 'Country' },
      { key: 'city', label: 'City' },
    ],
  },
  {
    key: 'asn',
    label: 'ASN',
    children: [
      { key: 'asn', label: 'Number', format: 'number' },
      { key: 'name', label: 'Name' },
      { key: 'domain', label: 'Domain' },
    ],
  },
];

export const lookupIpOutput: OutputSchema = { fields: answerFields };

export const lookupIpsOutput: OutputSchema = {
  fields: [
    { key: 'results', label: 'Results', listItems: [{ key: 'input', label: 'Input' }, ...answerFields] },
    {
      key: 'errors',
      label: 'Errors',
      listItems: [
        { key: 'input', label: 'Input' },
        { key: 'status', label: 'Status', format: 'number' },
        { key: 'error', label: 'Error' },
      ],
    },
  ],
};
