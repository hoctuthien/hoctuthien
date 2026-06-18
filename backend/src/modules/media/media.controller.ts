import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './services/media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiUploadMediaDoc } from './swagger/media.swagger';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiUploadMediaDoc()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Giới hạn 5MB
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          // Chỉ chấp nhận các định dạng ảnh phổ biến
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|avif)$/ }),
        ],
      }),
    )
    file: any,
    @Body('folder') folder: string,
    @User('id') uploaderId: string,
  ) {
    return this.mediaService.uploadImage(file, folder, uploaderId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tất cả file media trong thư viện' })
  @ApiResponse({ status: 200, description: 'Danh sách các file media' })
  async findAll(@Query('folder') folder?: string) {
    return this.mediaService.findAll(folder);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tệp tin media khỏi thư viện' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
