import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CourseBookingService } from '../src/modules/course-booking/services/course-booking.service';
import { BookingStatus } from '../src/modules/course-booking/entities/course-booking.entity';
import { DataSource } from 'typeorm';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookingService = app.get(CourseBookingService);
  const dataSource = app.get(DataSource);

  const menteeId = 'dddb1198-1da3-46a8-8d35-900d9a643031'; // Batch User 1 (Mentee)
  const courseId = '652872df-b186-4a57-a987-aee32bb36a09'; // Lập trình Node.js & Express thực chiến
  
  console.log('\n--- BẮT ĐẦU KIỂM THỬ RÀNG BUỘC COURSE BOOKING ---');

  // 1. Dọn dẹp các booking cũ của course này
  console.log('\n1. Dọn dẹp dữ liệu đăng ký cũ của khóa học này...');
  await dataSource.query('DELETE FROM course_bookings WHERE course_id = $1', [courseId]);
  console.log('✅ Đã dọn dẹp.');

  // 2. Tạo đơn booking đầu tiên
  console.log('\n2. Đang tạo đơn đăng ký đầu tiên...');
  const firstBooking = await bookingService.create({
    courseId,
    meetingTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // ngày mai
    notesForMentor: 'Đăng ký kiểm thử số 1',
  }, menteeId);
  console.log('✅ Đăng ký đầu tiên thành công:', {
    id: firstBooking.id,
    courseId: firstBooking.courseId,
    menteeId: firstBooking.menteeId,
    status: firstBooking.status
  });

  // 3. Tạo đơn booking thứ 2 (khi đơn 1 vẫn đang hoạt động)
  console.log('\n3. Đang thử tạo đơn đăng ký thứ 2 cho cùng khóa học (mong đợi bị chặn)...');
  try {
    await bookingService.create({
      courseId,
      meetingTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notesForMentor: 'Đăng ký kiểm thử số 2',
    }, menteeId);
    console.error('❌ THẤT BẠI: Hệ thống cho phép đăng ký trùng lặp!');
  } catch (error: any) {
    console.log('✅ THÀNH CÔNG: Đã chặn trùng lặp chính xác! Chi tiết lỗi:', error.message);
  }

  // 4. Hủy đơn booking đầu tiên
  console.log('\n4. Đang tiến hành hủy đơn đăng ký đầu tiên để giải phóng khóa học...');
  await bookingService.updateByMentee(firstBooking.id, {
    status: BookingStatus.CANCELLED,
    cancellationReason: 'Hủy đơn kiểm thử',
  }, menteeId);
  console.log('✅ Đã hủy đơn đăng ký thứ 1.');

  // 5. Tạo đơn booking thứ 2 sau khi đơn 1 đã hủy
  console.log('\n5. Đang thử tạo đơn đăng ký thứ 2 sau khi đơn 1 đã hủy (mong đợi thành công)...');
  try {
    const secondBooking = await bookingService.create({
      courseId,
      meetingTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notesForMentor: 'Đăng ký kiểm thử số 2',
    }, menteeId);
    console.log('✅ THÀNH CÔNG: Đã đăng ký thành công sau khi đơn cũ được giải phóng:', {
      id: secondBooking.id,
      courseId: secondBooking.courseId,
      menteeId: secondBooking.menteeId,
      status: secondBooking.status
    });
  } catch (error: any) {
    console.error('❌ THẤT BẠI: Không thể đăng ký ngay cả khi đơn cũ đã hủy!', error);
  }

  console.log('\n--- KẾT THÚC KIỂM THỬ COURSE BOOKING ---');
  await app.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
