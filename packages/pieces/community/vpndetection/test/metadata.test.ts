import { describe, expect, test } from 'vitest';
import { vpndetection } from '../src/index';

describe('piece metadata', () => {
  const actions = Object.values(vpndetection.actions());

  test('two read-only actions, each with an outputSchema and aiMetadata', () => {
    expect(actions.map((a) => a.name).sort()).toEqual(['lookup_ip', 'lookup_ips']);
    for (const action of actions) {
      expect(action.outputSchema, action.name).toBeDefined();
      expect(action.aiMetadata?.description, action.name).toBeTruthy();
      expect(action.aiMetadata?.idempotent, action.name).toBe(true);
      expect(action.classification, action.name).toBe('READ');
    }
  });
});
