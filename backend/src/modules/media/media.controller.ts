import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './services/media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiUploadMediaDoc } from './swagger/media.swagger';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiUploadMediaDoc()
  @UseGuards(JwtAuthGuard)
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
  ) {
    return this.mediaService.uploadImage(file);
  }
}
