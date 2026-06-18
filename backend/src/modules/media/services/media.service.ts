import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import FormData from 'form-data';
import { MediaEntity } from '../entities/media.entity';

@Injectable()
export class MediaService {
  private readonly openinaryUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(MediaEntity)
    private mediaRepository: Repository<MediaEntity>,
  ) {
    this.openinaryUrl = this.configService.get<string>('openinary.url');
    this.apiKey = this.configService.get<string>('openinary.apiKey');
  }

  async uploadImage(file: any, folder?: string, uploaderId?: string) {
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

      // Nếu FE truyền folder, dùng folder đó, nếu không sẽ lưu ở gốc
      if (folder) {
        formData.append('folder', folder);
      }

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

        // Lưu thông tin ảnh vào database
        for (const fileObj of response.data.files) {
          const media = this.mediaRepository.create({
            url: fileObj.url,
            filename: fileObj.name || file.originalname,
            mimeType: fileObj.type || file.mimetype,
            size: fileObj.size || file.size,
            uploaderId: uploaderId || null,
            metadata: {
              folder: folder || '',
              openinaryPath: fileObj.url.replace(this.openinaryUrl, ''),
            },
          });
          await this.mediaRepository.save(media);
          // Gán id từ DB vào fileObj để FE nhận diện được id
          fileObj.id = media.id;
        }
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

  async findAll(folder?: string) {
    if (folder) {
      return this.mediaRepository
        .createQueryBuilder('media')
        .where("media.metadata->>'folder' = :folder", { folder })
        .orderBy('media.createdAt', 'DESC')
        .getMany();
    }
    return this.mediaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new HttpException(
        'Không tìm thấy tệp tin media',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.mediaRepository.remove(media);
    return { success: true };
  }
}
