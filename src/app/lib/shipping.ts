import { getDistance } from 'geolib';

export const FIX_ADDRESS = 'Üllői út 95., Budapest';
export const ROUTE_CORRECTION_FACTOR = 1.25;
export const COST_PER_FLOOR = 1000;
export const EXTREME_CASE_COST = 5000;
export const TRANSFER_COST = 15000;
export const OLD_MATTRESS_REMOVAL_COST = 15000;

export type ServiceType = 'basic' | 'furniture' | 'furniture_assembly';

export const COST_TABLE_BASIC = [15000, 20000, 34000, 48000, 62000, 76000, 90000] as const;
export const COST_TABLE_FURNITURE = [19000, 24000, 38000, 52000, 66000, 80000, 94000] as const;
export const COST_TABLE_FURNITURE_ASSEMBLY = [22500, 27500, 41500, 55500, 69500, 83500, 97500] as const;

const COST_TABLE: Record<ServiceType, readonly number[]> = {
  basic: COST_TABLE_BASIC,
  furniture: COST_TABLE_FURNITURE,
  furniture_assembly: COST_TABLE_FURNITURE_ASSEMBLY,
};


export interface ShippingBreakdown {
  shipCost: number;
  floorCost: number;
  extremeCost: number;
  transferCost: number;
  oldCost: number;
  total: number;
}

export interface ShippingResult {
  km: number;
  breakdown: ShippingBreakdown;
}

export async function calculateShipping(params: {
  address: string;
  floors?: number;
  extreme?: boolean;
  transfer?: boolean;
  oldRemoval?: boolean;
  tier: ServiceType;
}): Promise<ShippingResult> {
  const {
    address,
    floors = 0,
    extreme = false,
    transfer = false,
    oldRemoval = false,
    tier,
  } = params;

  const [origCoords, destCoords] = await Promise.all([
    geocode(FIX_ADDRESS),
    geocode(address),
  ]);

  const km =
    (getDistance(origCoords, destCoords) / 1000) * ROUTE_CORRECTION_FACTOR;

  const shipCost = tierCost(km, COST_TABLE[tier]);
  const floorCost = floors * COST_PER_FLOOR;
  const extremeCost = extreme ? EXTREME_CASE_COST : 0;
  const transferCost = transfer ? TRANSFER_COST : 0;
  const oldCost = oldRemoval ? OLD_MATTRESS_REMOVAL_COST : 0;

  const total =
    shipCost + floorCost + extremeCost + transferCost + oldCost;

  return {
    km: Number(km.toFixed(1)),
    breakdown: {
      shipCost,
      floorCost,
      extremeCost,
      transferCost,
      oldCost,
      total,
    },
  };
}

async function geocode(address: string) {
  const params = new URLSearchParams({ q: address, format: 'json', limit: '1' });
  let lastErr: Error | null = null;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': process.env.NOMINATIM_EMAIL
              ? `shipping-calculator (${process.env.NOMINATIM_EMAIL})`
              : 'shipping-calculator',
          },
        },
      );
      if (!res.ok) throw new Error('Geokódolási hiba.');
      const [geo] = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!geo) throw new Error('Cím nem geokódolható.');
      return { latitude: parseFloat(geo.lat), longitude: parseFloat(geo.lon) };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error('Ismeretlen hiba');
    }
  }
  throw lastErr ?? new Error('Geokódolási hiba.');
}

function tierCost(km: number, tiers: readonly number[]) {
  const limits = [15, 50, 100, 150, 200, 250];
  for (let i = 0; i < limits.length; i++) {
    if (km <= limits[i]) return tiers[i];
  }
  return tiers[tiers.length - 1];
}