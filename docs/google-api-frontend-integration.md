# Hướng dẫn Tích hợp Google API cho Frontend

Tài liệu này cung cấp hướng dẫn chi tiết cho đội ngũ Frontend về cách thiết lập và sử dụng Google API (tập trung vào tính năng Đăng nhập với Google - Google OAuth 2.0) trong dự án.

## 1. Chuẩn bị (Prerequisites)

Để Frontend có thể sử dụng Google API, Backend hoặc quản trị viên dự án cần cung cấp:
- **Google Client ID**: Một chuỗi ký tự định danh ứng dụng trên Google Cloud Console (VD: `1234567890-abcdefg.apps.googleusercontent.com`).

> **Lưu ý:** Client ID này cần được đưa vào file `.env` của Frontend.
> ```env
> VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
> ```

## 2. Cài đặt thư viện

Sử dụng thư viện `@react-oauth/google` để đơn giản hóa quá trình tích hợp Google Login trong React (nếu dự án dùng React).

```bash
npm install @react-oauth/google
# hoặc
yarn add @react-oauth/google
# hoặc
pnpm add @react-oauth/google
```

## 3. Cấu hình Provider ở cấp cao nhất (Root)

Bao bọc ứng dụng của bạn bằng `GoogleOAuthProvider` để toàn bộ ứng dụng có thể truy cập được Google API context.

Thường đặt ở file `main.tsx` hoặc `App.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
```

## 4. Triển khai Nút Đăng nhập (Google Login Button)

Bạn có hai cách để thiết kế nút đăng nhập:

### Cách 1: Sử dụng nút mặc định của Google (Nhanh và Chuẩn)

Sử dụng component `GoogleLogin` để hiển thị nút đăng nhập theo tiêu chuẩn của Google.

```tsx
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Login = () => {
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Login Success:', credentialResponse);
    
    // JWT Token trả về từ Google
    const googleToken = credentialResponse.credential;
    
    // GỬI TOKEN NÀY XUỐNG BACKEND ĐỂ XÁC THỰC
    // api.post('/auth/google', { token: googleToken })
    //  .then(res => console.log('Backend response:', res.data));
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-8 border rounded-lg shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h2>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap // Bật tính năng One Tap login (tùy chọn)
        />
      </div>
    </div>
  );
};

export default Login;
```

### Cách 2: Tự custom nút đăng nhập (Custom Button)

Nếu bạn muốn nút đăng nhập có giao diện riêng phù hợp với thiết kế dự án, hãy sử dụng hook `useGoogleLogin`.

> **Lưu ý quan trọng**: Hook này thường trả về `access_token` (hoặc `code` nếu cấu hình `flow: 'auth-code'`), khác với JWT token (`credential`) ở Cách 1. Bạn cần thống nhất với Backend xem Backend cần loại token nào. Thường thì dùng `flow: 'auth-code'` là bảo mật nhất.

```tsx
import { useGoogleLogin } from '@react-oauth/google';

const CustomLoginButton = () => {
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Login Success:', codeResponse);
      // codeResponse.code sẽ được gửi xuống Backend để đổi lấy access/refresh token
      
      // api.post('/auth/google/callback', { code: codeResponse.code })
      //  .then(...)
    },
    onError: (error) => console.log('Login Failed:', error),
    flow: 'auth-code', // Yêu cầu Backend xử lý code
  });

  return (
    <button 
      onClick={() => login()}
      className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition"
    >
      <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
      <span>Đăng nhập với Google</span>
    </button>
  );
};
```

## 5. Quy trình làm việc với Backend (Luồng Xác Thực)

Để đảm bảo bảo mật, Frontend **KHÔNG** nên tự mình xử lý logic lưu trữ user sau khi nhận phản hồi từ Google. Quy trình chuẩn như sau:

1. **Frontend**: Người dùng click đăng nhập Google.
2. **Frontend**: Nhận được `credential` (JWT) hoặc `code` (Auth Code) từ Google.
3. **Frontend**: Gửi dữ liệu này (qua API POST) cho Backend của dự án.
4. **Backend**: Gọi lên server Google để xác minh (verify) token/code đó xem có hợp lệ không.
5. **Backend**: Nếu hợp lệ, Backend tự động tìm user trong Database hoặc tạo mới user. Sau đó trả về cho Frontend cặp `access_token` và `refresh_token` (của hệ thống backend, không phải của Google).
6. **Frontend**: Nhận `access_token` từ Backend, lưu vào LocalStorage/Cookies hoặc Zustand/Redux và coi như đã đăng nhập thành công.

## 6. Xử lý lỗi thường gặp

- **`idpiframe_initialization_failed`**: Lỗi này xảy ra khi bạn test ở `localhost` hoặc http mà trình duyệt chặn cookie bên thứ 3. **Giải pháp**: Xóa cache trình duyệt, mở ẩn danh.
- **Lỗi Origin Mismatch**: Domain của Frontend (ví dụ `http://localhost:5173`) chưa được thêm vào mục **Authorized JavaScript origins** trong Google Cloud Console. Bạn cần nhờ người giữ tài khoản Google Cloud thêm vào.
