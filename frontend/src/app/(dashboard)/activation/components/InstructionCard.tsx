import React from 'react';
import { LuInfo } from 'react-icons/lu';

interface InstructionCardProps {
  amount: number;
  transactionCode: string;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({ amount, transactionCode }) => {
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] p-6 flex flex-col gap-3">
      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider font-[Montserrat] flex items-center gap-1.5">
        <LuInfo size={16} className="text-blue-600" />
        <span>Hướng dẫn quy trình kích hoạt</span>
      </h4>
      <ol className="text-[11px] text-slate-500 font-medium space-y-2 pl-4 list-decimal leading-relaxed">
        <li>
          Mở app ngân hàng (Vietcombank, Techcombank, MB, Momo, etc.) trên điện thoại và chọn chức năng quét mã **QR Pay**.
        </li>
        <li>
          Quét mã QR hiển thị ở màn hình bên trái để tự động điền đầy đủ thông tin số tiền và nội dung chuyển khoản.
        </li>
        <li>
          Nếu bạn chuyển khoản thủ công, hãy nhập đúng số tiền **{formatVND(amount)}** và nội dung **{transactionCode}**.
        </li>
        <li>
          Sau khi hoàn tất chuyển khoản thành công trên app ngân hàng của bạn, nhấn nút **"Tôi đã chuyển khoản"** để hệ thống xác minh và tự động kích hoạt tài khoản của bạn ngay lập tức.
        </li>
      </ol>
    </div>
  );
};
