import { NextResponse } from 'next/server';
import { donationGateway } from '@/core/gateway';

/**
 * Layer 2 - API Route Handler (BFF Core)
 * Handles requests from the Client (Layer 1) and calls the Gateway (Layer 3).
 */

export async function GET() {
  try {
    const donations = await donationGateway.getDonations();
    return NextResponse.json(donations);
  } catch (error) {
    console.error('[API_ROUTE_ERROR]:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
