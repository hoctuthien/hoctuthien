import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CreateMentorProfileDto,
  UpdateMentorProfileDto,
} from '../dtos/mentor-profile.dto';

export const ApiCreateMentorProfileDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Tạo hồ sơ mentor mới',
      description: 'Lưu ý: Hồ sơ này thường được tạo tự động khi đơn đăng ký (MentorAvailability) được phê duyệt.' 
    }),
    ApiBody({ type: CreateMentorProfileDto }),
    ApiResponse({ status: 201, description: 'Tạo hồ sơ thành công' }),
    ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' }),
  );
};

export const ApiFindAllMentorProfilesDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy danh sách hồ sơ mentor' }),
    ApiResponse({ status: 200, description: 'Lấy danh sách thành công' }),
  );
};

export const ApiFindOneMentorProfileDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy chi tiết hồ sơ mentor theo id' }),
    ApiParam({ name: 'id', description: 'ID của hồ sơ mentor' }),
    ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' }),
  );
};

export const ApiFindMentorProfileByUserIdDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy hồ sơ mentor theo userId' }),
    ApiParam({ name: 'userId', description: 'ID của user' }),
    ApiResponse({ status: 200, description: 'Lấy hồ sơ thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' }),
  );
};

export const ApiUpdateMentorProfileDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Cập nhật hồ sơ mentor',
      description: 'Cập nhật các thông tin chuyên môn, bio, kỹ năng của mentor.' 
    }),
    ApiParam({ name: 'id', description: 'ID của hồ sơ mentor' }),
    ApiBody({ type: UpdateMentorProfileDto }),
    ApiResponse({ status: 200, description: 'Cập nhật thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' }),
  );
};

export const ApiRemoveMentorProfileDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Xóa hồ sơ mentor (soft delete)' }),
    ApiParam({ name: 'id', description: 'ID của hồ sơ mentor' }),
    ApiResponse({ status: 200, description: 'Xóa thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' }),
  );
};
