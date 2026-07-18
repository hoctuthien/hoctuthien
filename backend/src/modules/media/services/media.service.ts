import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { MediaEntity } from '../entities/media.entity';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(MediaEntity)
    private mediaRepository: Repository<MediaEntity>,
  ) {
    const endpoint = this.configService.get<string>('minio.endpoint') || '';
    this.endpoint = endpoint.replace(/\/$/, '');
    const accessKey = this.configService.get<string>('minio.accessKey');
    const secretKey = this.configService.get<string>('minio.secretKey');

    this.bucketName = this.configService.get<string>('minio.bucketName') || 'hoctuthien-media';

    if (!endpoint || !accessKey || !secretKey) {
      // Đừng ném lỗi ngay khi khởi tạo vì có thể chạy test hoặc các CLI tool không có config này.
      // Sẽ kiểm tra lúc thực hiện hành động upload/delete.
      return;
    }

    // Khởi tạo S3 Client tương thích với MinIO
    this.s3Client = new S3Client({
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      region: 'us-east-1', // Bắt buộc đối với AWS SDK v3
      forcePathStyle: true, // Bắt buộc đối với MinIO tự host
    });
  }

  private checkConfig() {
    const endpoint = this.configService.get<string>('minio.endpoint');
    const accessKey = this.configService.get<string>('minio.accessKey');
    const secretKey = this.configService.get<string>('minio.secretKey');
    if (!endpoint || !accessKey || !secretKey || !this.s3Client) {
      throw new HttpException(
        'Cấu hình MinIO thiếu thông tin kết nối (endpoint, accessKey hoặc secretKey). Vui lòng kiểm tra file .env',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadImage(file: any, folder?: string, uploaderId?: string) {
    this.checkConfig();

    try {
      const ext = path.extname(file.originalname);
      const uniqueFilename = `${randomUUID()}${ext}`;
      const objectKey = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(uploadCommand);

      const fileUrl = `${this.endpoint}/${this.bucketName}/${objectKey}`;

      const media = this.mediaRepository.create({
        url: fileUrl,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploaderId: uploaderId || null,
        metadata: {
          folder: folder || '',
          bucket: this.bucketName,
          objectKey: objectKey,
        },
      });

      await this.mediaRepository.save(media);
      file.id = media.id;

      return {
        success: true,
        files: [
          {
            id: media.id,
            filename: file.originalname,
            path: objectKey,
            size: file.size,
            url: fileUrl,
          },
        ],
      };
    } catch (error: any) {
      console.error('MinIO Upload Error:', error);
      throw new HttpException(
        `Lỗi khi upload ảnh lên MinIO: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

    try {
      const objectKey = media.metadata?.objectKey;
      const bucket = media.metadata?.bucket || this.bucketName;

      if (objectKey && this.s3Client) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucket,
          Key: objectKey,
        });
        await this.s3Client.send(deleteCommand);
      }
    } catch (error) {
      console.error('Lỗi khi xóa file vật lý trên MinIO:', error);
    }

    await this.mediaRepository.remove(media);
    return { success: true };
  }
}
