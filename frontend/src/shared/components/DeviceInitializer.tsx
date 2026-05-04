"use client";

import { useEffect } from "react";

/**
 * Component này chịu trách nhiệm khởi tạo và lưu trữ device_id vào Cookie
 * ngay khi người dùng truy cập trang web lần đầu tiên.
 */
export function DeviceInitializer() {
  useEffect(() => {
    // Hàm tiện ích để đọc cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const deviceId = getCookie("device_id");

    // Nếu chưa có device_id, tiến hành tạo mới
    if (!deviceId) {
      const newId = crypto.randomUUID();
      
      // Lưu vào Cookie:
      // - path=/: Áp dụng cho toàn bộ trang web
      // - max-age=31536000: Thời hạn 1 năm (tính bằng giây)
      // - SameSite=Lax: Bảo mật cơ bản cho cookie
      document.cookie = `device_id=${newId}; path=/; max-age=31536000; SameSite=Lax`;
      
      console.log("Device ID initialized:", newId);
    }
  }, []);

  // Component này chỉ thực hiện logic, không render giao diện
  return null;
}
