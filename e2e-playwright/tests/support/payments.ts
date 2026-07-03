import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL không được set. Test thanh toán cần biến này để mô phỏng xác nhận giao dịch ngân hàng ' +
          '(không có cách nào tạo một giao dịch VietQR thật trong môi trường test).',
      );
    }
    pool = new Pool({ connectionString, max: 3 });
  }
  return pool;
}

/**
 * Mô phỏng CHÍNH XÁC 2 side-effect mà hệ thống thật thực hiện khi TN App tìm thấy
 * giao dịch chuyển khoản khớp (xem payment.service.ts#verifyPayment và
 * CourseBookingPaymentStrategy#onSuccess):
 *   1. payments.status -> 'success'
 *   2. course_bookings.status -> 'confirmed' (chỉ nếu payment gắn với 1 booking)
 *
 * Không có cách nào kích hoạt một giao dịch VietQR ngân hàng thật trong môi trường
 * E2E (cần chuyển khoản thật), nên bước "TN App tìm thấy giao dịch khớp" buộc phải
 * giả lập trực tiếp ở DB. Mọi bước còn lại (tạo QR, phân quyền, response shape,
 * trạng thái booking trước/sau) đều được verify qua HTTP thật.
 */
export async function simulateBankTransferConfirmed(paymentId: string): Promise<void> {
  const client = getPool();
  await client.query(
    `UPDATE payments SET status = 'success', transaction_id = $2, paid_at = now() WHERE id = $1`,
    [paymentId, `E2E-SIMULATED-TX-${Date.now()}`],
  );
  await client.query(`UPDATE course_bookings SET status = 'confirmed' WHERE payment_id = $1`, [paymentId]);
}

export async function closePaymentsDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
