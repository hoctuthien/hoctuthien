import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiCreateMentorAvailabilityDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Gửi đơn đăng ký làm Mentor',
      description:
        'Mentee gửi đơn đăng ký với đầy đủ thông tin chuyên môn và bằng cấp.',
    }),
    ApiResponse({ status: 201, description: 'Gửi đơn thành công' }),
    ApiResponse({
      status: 400,
      description: 'Dữ liệu không hợp lệ hoặc đã có đơn đang chờ',
    }),
  );
};

export const ApiFindAllMentorAvailabilitiesDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lấy danh sách tất cả các đơn đăng ký (Admin)',
      description:
        'Dành cho Admin để xem và quản lý tất cả các đơn đăng ký trong hệ thống.',
    }),
    ApiResponse({ status: 200, description: 'Lấy danh sách thành công' }),
  );
};

export const ApiFindMyMentorAvailabilitiesDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lấy danh sách đơn đăng ký của bản thân',
      description:
        'Người dùng xem lại lịch sử các đơn đăng ký làm mentor của mình.',
    }),
    ApiResponse({ status: 200, description: 'Lấy danh sách thành công' }),
  );
};

export const ApiFindOneMentorAvailabilityDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy chi tiết một đơn đăng ký (Admin)' }),
    ApiParam({ name: 'id', description: 'ID của đơn đăng ký' }),
    ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy đơn' }),
  );
};

export const ApiUpdateToInProgressDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Admin tiếp nhận đơn (Chuyển sang In Progress)',
      description: 'Đánh dấu đơn đang được Admin xử lý.',
    }),
    ApiParam({ name: 'id', description: 'ID của đơn đăng ký' }),
    ApiResponse({ status: 200, description: 'Cập nhật thành công' }),
  );
};

export const ApiApproveMentorAvailabilityDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Phê duyệt đơn đăng ký làm Mentor',
      description:
        'Khi phê duyệt: \n1. Đơn chuyển sang APPROVED. \n2. Role của User đổi thành MENTOR. \n3. Mentor Profile được tự động tạo/cập nhật và đặt trạng thái ACTIVE.',
    }),
    ApiParam({ name: 'id', description: 'ID của đơn đăng ký' }),
    ApiResponse({ status: 200, description: 'Phê duyệt thành công' }),
  );
};

export const ApiRejectMentorAvailabilityDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Từ chối đơn đăng ký làm Mentor' }),
    ApiParam({ name: 'id', description: 'ID của đơn đăng ký' }),
    ApiResponse({ status: 200, description: 'Từ chối thành công' }),
  );
};

export const ApiCancelMentorAvailabilityDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Người dùng hủy đơn đăng ký' }),
    ApiParam({ name: 'id', description: 'ID của đơn đăng ký' }),
    ApiResponse({ status: 200, description: 'Hủy đơn thành công' }),
  );
};
