import { getDistance } from 'geolib';

const FIX_ADDRESS = 'Üllői út 95., Budapest';
const ROUTE_CORRECTION_FACTOR = 1.25;
const COST_PER_FLOOR = 1000;
const EXTREME_CASE_COST = 5000;
const TRANSFER_TO_ANOTHER_ADDRESS_COST = 15000;
const OLD_MATTRESS_REMOVAL_COST = 15000;

type ServiceType = 'basic' | 'furniture' | 'furniture_assembly';

const COST_TABLE: Record<ServiceType, number[]> = {
  basic:             [15000, 20000, 34000, 48000, 62000, 76000, 90000],
  furniture:         [19000, 24000, 38000, 52000, 66000, 80000, 94000],
  furniture_assembly:[22500, 27500, 41500, 55500, 69500, 83500, 97500],
};


export async function calculateShipping(params: {
  destination: string;
  floors?: number;
  extreme?: boolean;
  transfer?: boolean;
  removeOld?: boolean;
  service: ServiceType;
}) {
  const {
    destination,
    floors = 0,
    extreme = false,
    transfer = false,
    removeOld = false,
    service,
  } = params;

  const [origCoords, destCoords] = await Promise.all([
    geocode(FIX_ADDRESS),
    geocode(destination),
  ]);

  const km =
    (getDistance(origCoords, destCoords) / 1000) * ROUTE_CORRECTION_FACTOR;

  const shipCost = tierCost(km, COST_TABLE[service]);
  const floorCost = floors * COST_PER_FLOOR;
  const extremeCost = extreme ? EXTREME_CASE_COST : 0;
  const transferCost = transfer ? TRANSFER_TO_ANOTHER_ADDRESS_COST : 0;
  const oldCost = removeOld ? OLD_MATTRESS_REMOVAL_COST : 0;

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
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: { 'User-Agent': 'shipping-calculator' } },
  );
  if (!res.ok) throw new Error('Geokódolási hiba.');
  const [geo] = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!geo) throw new Error('Cím nem geokódolható.');
  return { latitude: parseFloat(geo.lat), longitude: parseFloat(geo.lon) };
}

function tierCost(km: number, tiers: number[]) {
  const limits = [15, 50, 100, 150, 200, 250];
  for (let i = 0; i < limits.length; i++) {
    if (km <= limits[i]) return tiers[i];
  }
  return tiers[tiers.length - 1];
}