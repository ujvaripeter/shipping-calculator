import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateShipping, FIX_ADDRESS } from '../src/app/lib/shipping';

describe('calculateShipping', () => {
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

  it('returns correct calculation', async () => {
    const result = await calculateShipping({
      address: '1076 Budapest, Garay tér 13',
      floors: 2,
      extreme: true,
      transfer: false,
      oldRemoval: true,
      tier: 'furniture_assembly',
    });

    expect(result).toEqual({
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
