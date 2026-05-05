import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/core/api/base';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const response = await apiService.get<any>('/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    
    const actualData = response.data.data?.[0] || {};

    return NextResponse.json({ user: actualData.user || null }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { user: null, error: error.message }, 
      { status: error.status || 500 }
    );
  }
}
