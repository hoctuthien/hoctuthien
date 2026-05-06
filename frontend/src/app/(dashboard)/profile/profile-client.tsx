'use client';

import { authGateway } from '@/core/gateway/authGateway';
import { useRouter } from 'next/navigation';

import { signOut } from 'next-auth/react';

export function ProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await authGateway.logout();
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout failed:', error);
      await signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Thông tin cá nhân</h1>
      
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm text-gray-500">Vai trò</label>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">ID người dùng</label>
            <p className="font-medium text-xs">{user.id}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-3 px-6 rounded-lg transition-colors border border-red-200"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
