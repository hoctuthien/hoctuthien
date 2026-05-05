'use client';

import { useQuery } from '@tanstack/react-query';
import { authGateway } from '@/core/gateway/authGateway';
import { useUserStore } from '@/core/lib/store/userStore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const res = await authGateway.getMe();
        
        const user = res?.user || null;
        if (user) {
          setUser(user);
        }
        return user;
      } catch (err) {
        console.error('ProfilePage - Fetch Error:', err);
        throw err;
      }
    },
  });

  const handleLogout = async () => {
    try {
      await authGateway.logout();
      clearUser(); // Xóa user trong store
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) return <div className="p-10">Đang tải thông tin...</div>;
  
  if (error || !data) {
    return (
      <div className="p-10">
        <p className="text-red-500 mb-4">Không thể tải thông tin profile.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Thông tin cá nhân</h1>
      
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold">
            {data.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{data.name}</h2>
            <p className="text-gray-500">{data.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm text-gray-500">Vai trò</label>
            <p className="font-medium capitalize">{data.role}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">ID người dùng</label>
            <p className="font-medium text-xs">{data.id}</p>
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
