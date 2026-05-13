import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class MediaService {
  private readonly openinaryUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.openinaryUrl = this.configService.get<string>('openinary.url');
    this.apiKey = this.configService.get<string>('openinary.apiKey');
  }

  async uploadImage(file: any) {
    if (!this.openinaryUrl || !this.apiKey) {
      throw new HttpException(
        'Cấu hình Openinary thiếu URL hoặc API Key. Vui lòng kiểm tra file .env',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const formData = new FormData();
      // Field name 'files' theo yêu cầu của Openinary
      formData.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await axios.post(
        `${this.openinaryUrl}/api/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      // Xử lý để trả về URL tuyệt đối giúp Frontend/Database dễ sử dụng
      if (response.data.success && Array.isArray(response.data.files)) {
        response.data.files = response.data.files.map((f: any) => ({
          ...f,
          url: `${this.openinaryUrl}${f.url}`,
        }));
      }

      return response.data;
    } catch (error: any) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi upload ảnh lên Openinary';

      console.error('Openinary Upload Error:', {
        status,
        message,
        data: error.response?.data,
      });

      throw new HttpException(message, status);
    }
  }
}
