import { test, expect } from '@playwright/test';
import {
  createActiveCourse,
  jsonOf,
  loginAsAdmin,
  nextWeekdayAt,
  onboardMentor,
  pastWeekdayAt,
  registerAndLogin,
  unwrap,
} from './support/api';
import { closePaymentsDbPool, simulateBankTransferConfirmed } from './support/payments';

test.afterAll(async () => {
  await closePaymentsDbPool();
});

test.describe('Paid course booking -> VietQR payment -> confirmed -> completed -> review', () => {
  test('full paid booking lifecycle: pending -> generate QR -> bank transfer confirmed -> confirmed -> completed -> review', async ({
    request,
  }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'paid_mentor' });
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'paid_mentee' });

    const course = await createActiveCourse(mentorClient, {
      price: 150_000,
      time: { wednesday: ['15:00-16:00'] },
      title: `E2E Paid Course ${Date.now()}`,
    });

    // 1. Đặt lịch một khóa học có phí -> phải ở trạng thái pending (chưa auto-confirm)
    const meetingTime = pastWeekdayAt('wednesday', 15, 0, 3);
    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
      notesForMentor: 'Paid booking E2E test',
    });
    expect(bookingRes.status()).toBe(201);
    const booking = unwrap<any>(await jsonOf(bookingRes));
    expect(booking.status).toBe('pending');

    // 2. Tạo QR thanh toán chung cho nghiệp vụ course_booking
    const qrRes = await menteeClient.post('payments/generate-qr', {
      paymentType: 'course_booking',
      referenceId: booking.id,
    });
    expect(qrRes.status()).toBe(201);
    const qr = unwrap<any>(await jsonOf(qrRes));
    expect(qr.paymentId).toBeTruthy();
    expect(qr.amount).toBe(150_000);
    expect(qr.qrUrl).toContain('vietqr.io');

    // Gọi lại generate-qr lần 2 trong lúc QR cũ còn hạn phải trả về CÙNG payment (idempotent)
    const qrAgainRes = await menteeClient.post('payments/generate-qr', {
      paymentType: 'course_booking',
      referenceId: booking.id,
    });
    const qrAgain = unwrap<any>(await jsonOf(qrAgainRes));
    expect(qrAgain.paymentId).toBe(qr.paymentId);

    // 3. Xác minh khi CHƯA có giao dịch chuyển khoản thật -> activated=false, không tìm thấy giao dịch
    const verifyBeforeRes = await menteeClient.post('payments/verify', { paymentId: qr.paymentId });
    expect(verifyBeforeRes.status()).toBe(201);
    const verifyBefore = unwrap<any>(await jsonOf(verifyBeforeRes));
    expect(verifyBefore.activated).toBe(false);

    // Booking vẫn phải là pending — verify thất bại không được làm thay đổi trạng thái
    const stillPendingRes = await menteeClient.get(`course-bookings/${booking.id}`);
    expect(unwrap<any>(await jsonOf(stillPendingRes)).status).toBe('pending');

    // 4. Người khác không được verify payment không thuộc về họ
    const { client: strangerClient } = await registerAndLogin(request, { prefix: 'paid_stranger' });
    const strangerVerifyRes = await strangerClient.post('payments/verify', { paymentId: qr.paymentId });
    expect(strangerVerifyRes.status()).toBe(403);

    // 5. Mô phỏng ngân hàng xác nhận giao dịch chuyển khoản khớp (không có cách nào kích
    //    hoạt giao dịch VietQR thật trong môi trường E2E — xem support/payments.ts).
    await simulateBankTransferConfirmed(qr.paymentId);

    // 6. Poll lại payment status thông qua endpoint thật -> phải phản ánh SUCCESS
    const paymentDetailRes = await menteeClient.get(`payments/${qr.paymentId}`);
    expect(paymentDetailRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(paymentDetailRes)).status).toBe('success');

    // 7. Verify lại sau khi đã "thanh toán" -> phải activated=true ngay từ nhánh short-circuit
    //    (payment.status === SUCCESS) mà không cần gọi TN App lần nữa
    const verifyAfterRes = await menteeClient.post('payments/verify', { paymentId: qr.paymentId });
    expect(verifyAfterRes.status()).toBe(201);
    expect(unwrap<any>(await jsonOf(verifyAfterRes)).activated).toBe(true);

    // 8. Booking phải chuyển sang confirmed
    const confirmedRes = await menteeClient.get(`course-bookings/${booking.id}`);
    const confirmedBooking = unwrap<any>(await jsonOf(confirmedRes));
    expect(confirmedBooking.status).toBe('confirmed');
    expect(confirmedBooking.paymentId).toBe(qr.paymentId);

    // 9. Mentor đánh dấu buổi học đã hoàn thành (đủ điều kiện vì đã CONFIRMED và meetingTime đã qua)
    const completeRes = await mentorClient.patch(`course-bookings/${booking.id}`, { status: 'completed' });
    expect(completeRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(completeRes)).status).toBe('completed');

    // 10. Mentee được phép đánh giá buổi học đã hoàn thành
    const reviewRes = await menteeClient.post('course-reviews', {
      courseBookingId: booking.id,
      courseId: course.id,
      rating: 5,
      comment: 'Great mentor, very helpful!',
    });
    expect(reviewRes.status()).toBe(201);
    const review = unwrap<any>(await jsonOf(reviewRes));
    expect(review.rating).toBe(5);

    // Đánh giá lần 2 cho cùng booking phải bị từ chối
    const dupReviewRes = await menteeClient.post('course-reviews', {
      courseBookingId: booking.id,
      courseId: course.id,
      rating: 4,
    });
    expect(dupReviewRes.status()).toBe(400);

    // Mentor profile phải được cập nhật rating trung bình sau review.
    // updateMentorRatingStats() ở backend là fire-and-forget (void ...catch(...)),
    // nên cần poll một chút thay vì check ngay lập tức (course-review.service.ts).
    await expect
      .poll(
        async () => {
          const res = await adminClient.get(`mentor-profiles/user/${course.mentorId}`);
          return Number(unwrap<any>(await jsonOf(res)).averageRating);
        },
        { timeout: 5_000, message: 'mentor averageRating was not updated after review' },
      )
      .toBe(5);
  });

  test('cannot review a booking that is not yet completed', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'paid_incomplete_mentor' });
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'paid_incomplete_mentee' });

    const course = await createActiveCourse(mentorClient, {
      price: 0,
      time: { monday: ['09:00-10:00'] },
    });
    const meetingTime = nextWeekdayAt('monday', 9, 0, 3);
    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    const booking = unwrap<any>(await jsonOf(bookingRes));
    expect(booking.status).toBe('confirmed'); // free course auto-confirms

    const reviewRes = await menteeClient.post('course-reviews', {
      courseBookingId: booking.id,
      courseId: course.id,
      rating: 5,
    });
    expect(reviewRes.status()).toBe(400);
  });

  test('mentor cannot mark a booking COMPLETED before the meeting time has passed', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'future_mentor' });
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'future_mentee' });

    const course = await createActiveCourse(mentorClient, {
      price: 0,
      time: { monday: ['09:00-10:00'] },
    });
    const meetingTime = nextWeekdayAt('monday', 9, 0, 3);
    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    const booking = unwrap<any>(await jsonOf(bookingRes));
    expect(booking.status).toBe('confirmed');

    const completeRes = await mentorClient.patch(`course-bookings/${booking.id}`, { status: 'completed' });
    expect(completeRes.status()).toBe(400);
  });

  test('mentor cannot mark a PENDING (unpaid) booking as COMPLETED', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'unpaid_mentor' });
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'unpaid_mentee' });

    const course = await createActiveCourse(mentorClient, {
      price: 200_000,
      time: { thursday: ['10:00-11:00'] },
    });
    const meetingTime = pastWeekdayAt('thursday', 10, 0, 3);
    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    const booking = unwrap<any>(await jsonOf(bookingRes));
    expect(booking.status).toBe('pending');

    const completeRes = await mentorClient.patch(`course-bookings/${booking.id}`, { status: 'completed' });
    expect(completeRes.status()).toBe(400);
  });

  test('reviewing someone else\'s completed booking is forbidden', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'review_owner_mentor' });
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'review_owner_mentee' });
    const { client: intruderClient } = await registerAndLogin(request, { prefix: 'review_intruder' });

    const course = await createActiveCourse(mentorClient, {
      price: 0,
      time: { tuesday: ['09:00-10:00'] },
    });
    const meetingTime = pastWeekdayAt('tuesday', 9, 0, 3);
    const bookingRes = await menteeClient.post('course-bookings', {
      courseId: course.id,
      meetingTime: meetingTime.toISOString(),
    });
    const booking = unwrap<any>(await jsonOf(bookingRes));
    expect(booking.status).toBe('confirmed');

    await mentorClient.patch(`course-bookings/${booking.id}`, { status: 'completed' });

    const intruderReviewRes = await intruderClient.post('course-reviews', {
      courseBookingId: booking.id,
      courseId: course.id,
      rating: 1,
      comment: 'Not my booking',
    });
    expect(intruderReviewRes.status()).toBe(403);
  });
});
