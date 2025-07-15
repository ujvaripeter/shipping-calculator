import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/calculate-shipping/route';
import { NextRequest } from 'next/server';
import { FIX_ADDRESS } from '../src/app/lib/shipping';

describe('/api/calculate-shipping', () => {
  const coords: Record<string, { lat: string; lon: string }> = {
    [FIX_ADDRESS]: { lat: '47.4769', lon: '19.1071' },
    '1076 Budapest, Garay tér 13': { lat: '47.5015', lon: '19.0822' },
  };

  beforeEach(() => {
    global.fetch = vi.fn(async (input: RequestInfo) => {
      const url = input.toString();
      const query = new URL(url).searchParams.get('q') || '';
      const c = coords[query];
      return {
        ok: true,
        async json() {
          return c ? [{ lat: c.lat, lon: c.lon }] : [];
        },
      } as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns expected json', async () => {
    const body = {
      address: '1076 Budapest, Garay tér 13',
      floors: 2,
      extreme: true,
      transfer: false,
      oldRemoval: true,
      tier: 'furniture_assembly',
    };
    const req = new NextRequest('http://localhost/api/calculate-shipping', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      km: 4.1,
      breakdown: {
        shipCost: 22500,
        floorCost: 2000,
        extremeCost: 5000,
        transferCost: 0,
        oldCost: 15000,
        total: 44500,
      },
    });
  });
});
