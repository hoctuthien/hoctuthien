import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/core/api/base';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const { data: wrappedData, headers } = await apiService.post<any>('/auths/login', { email, password });
    
    // Dữ liệu thật nằm trong mảng data[0] do Interceptor của NestJS bọc lại
    const actualData = wrappedData.data?.[0] || {};
    
    const setCookieHeader = headers.get('set-cookie');
    let access_token = '';
    let refresh_token = '';

    if (setCookieHeader) {
      const atMatch = setCookieHeader.match(/access_token=([^;]+)/);
      const rtMatch = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (atMatch) access_token = atMatch[1];
      if (rtMatch) refresh_token = rtMatch[1];
    }

    if (!access_token) {
      throw new Error('Authentication failed: No token received from backend');
    }

    const res = NextResponse.json({ user: actualData.user }, { status: 200 });
    const isProd = process.env.NODE_ENV === 'production';

    res.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    res.cookies.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error: any) {
    console.error('BFF /api/auth/login - Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' }, 
      { status: error.status || 500 }
    );
  }
}
