import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/core/api/base';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'No refresh token provided' }, { status: 401 });
    }

    // Call backend refresh
    const { data: wrappedData, headers } = await apiService.post<any>('/auths/refresh', {}, {
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const actualData = wrappedData.data?.[0] || {};
    const setCookieHeader = headers.get('set-cookie');

    let access_token = '';
    let new_refresh_token = '';

    if (setCookieHeader) {
      // Vì fetch trả về set-cookie gộp chung, ta cần xử lý chuỗi
      const atMatch = setCookieHeader.match(/access_token=([^;]+)/);
      const rtMatch = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (atMatch) access_token = atMatch[1];
      if (rtMatch) new_refresh_token = rtMatch[1];
    }

    if (!access_token) {
      throw new Error('Refresh failed: No access token received from backend');
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

    if (new_refresh_token) {
      res.cookies.set('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return res;
  } catch (error: any) {
    console.error('BFF /api/auth/refresh - Error:', error);
    return NextResponse.json(
      { message: error.message || 'Refresh token failed' },
      { status: error.status || 401 }
    );
  }
}
