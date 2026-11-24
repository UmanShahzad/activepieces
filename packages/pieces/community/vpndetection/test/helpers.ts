import { vi } from 'vitest';

export const API_KEY = 'test-key';

export type SeenRequest = { url: string; method: string; path: string; headers: Headers; body: unknown };
export type FakeReply = { status?: number; body?: unknown };

export function stubFetch(respond: (request: SeenRequest) => FakeReply): SeenRequest[] {
  const seen: SeenRequest[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = input instanceof Request ? input.url : String(input);
      const rawBody = typeof init?.body === 'string' ? init.body : null;
      const request: SeenRequest = {
        url,
        method: (init?.method ?? 'GET').toUpperCase(),
        path: new URL(url).pathname,
        headers: new Headers(init?.headers),
        body: rawBody ? JSON.parse(rawBody) : null,
      };
      seen.push(request);
      const reply = respond(request);
      return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status ?? 200, headers: { 'content-type': 'application/json' } });
    }),
  );
  return seen;
}
