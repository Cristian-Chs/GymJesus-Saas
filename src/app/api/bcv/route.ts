import { NextResponse } from 'next/server';
import { getBcvRate } from '@/lib/bcv';

export async function GET() {
  const rate = await getBcvRate();
  
  if (!rate) {
    return NextResponse.json({ error: 'Failed to fetch rate' }, { status: 500 });
  }

  return NextResponse.json({ rate });
}
