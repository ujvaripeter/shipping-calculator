import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/app/lib/shipping';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await calculateShipping({
      address: body.address,
      floors: body.floors,
      extreme: body.extreme,
      transfer: body.transfer,
      oldRemoval: body.oldRemoval,
      tier: body.tier,
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ismeretlen hiba történt.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}