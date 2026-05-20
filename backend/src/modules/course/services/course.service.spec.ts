import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { CourseRepository } from '../repositories/course.repository';
import { DataSource } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CourseStatus } from '../enums/course-status.enum';
import { COURSE_MESSAGES } from '../../../common/constants/message.constant';

describe('CourseService', () => {
  let service: CourseService;
  let mockEntityManager: any;
  let mockDataSource: any;
  let mockCourseRepo: any;

  beforeEach(async () => {
    mockEntityManager = {
      create: jest.fn().mockImplementation((entity, data) => {
        if (Array.isArray(data)) {
          return data.map((item) => ({ ...item, id: 'mock-id' }));
        }
        return {
          ...data,
          id: 'mock-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
      save: jest.fn().mockImplementation((entityOrData, data) => {
        const result = data || entityOrData;
        return Promise.resolve(result);
      }),
      findOne: jest.fn(),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      restore: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
    };

    mockCourseRepo = {
      findMany: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      softDeleteById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: CourseRepository,
          useValue: mockCourseRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const payload = {
      title: 'Test Course',
      price: 500000,
      durationMinutes: 60,
      categoryIds: ['cat-1'],
    };
    const mentorId = 'mentor-123';

    it('should throw ForbiddenException if mentor is not approved', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.create(payload as any, mentorId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(payload as any, mentorId)).rejects.toThrow(
        COURSE_MESSAGES.INVALID_MENTOR_PROFILE,
      );
    });

    it('should throw BadRequestException if duration is invalid', async () => {
      // Mock mentor approved
      mockEntityManager.findOne.mockResolvedValueOnce({
        userId: mentorId,
        isApproved: true,
      });
      // Mock system config invalid duration
      mockEntityManager.findOne.mockResolvedValueOnce({
        configKey: 'course_duration_whitelist',
        configValue: [30, 90], // 60 is not in whitelist
      });

      await expect(service.create(payload as any, mentorId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create course successfully with categories', async () => {
      // Mock mentor
      mockEntityManager.findOne.mockResolvedValueOnce({
        userId: mentorId,
        isApproved: true,
      });
      // Mock config
      mockEntityManager.findOne.mockResolvedValueOnce({
        configKey: 'course_duration_whitelist',
        configValue: [30, 60, 90],
      });

      const result = await service.create(payload as any, mentorId);

      expect(mockEntityManager.create).toHaveBeenCalledWith(
        CourseEntity,
        expect.objectContaining({
          title: payload.title,
          durationMinutes: 60,
          status: CourseStatus.ACTIVE,
        }),
      );
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result.title).toBe(payload.title);
    });
  });

  describe('updateStatus', () => {
    const courseId = 'course-123';
    const mentorId = 'mentor-123';

    it('should throw NotFoundException if course not found', async () => {
      mockCourseRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus(courseId, mentorId, CourseStatus.INACTIVE),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if mentor is not owner', async () => {
      mockCourseRepo.findById.mockResolvedValue({ mentorId: 'other-mentor' });

      await expect(
        service.updateStatus(courseId, mentorId, CourseStatus.INACTIVE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update status successfully', async () => {
      mockCourseRepo.findById.mockResolvedValue({
        id: courseId,
        mentorId,
        status: CourseStatus.ACTIVE,
      });
      mockCourseRepo.updateById.mockResolvedValue({
        id: courseId,
        mentorId,
        title: 'Mocked Title',
        price: 500000,
        durationMinutes: 60,
        prerequisites: [],
        metadata: {},
        status: CourseStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.updateStatus(
        courseId,
        mentorId,
        CourseStatus.INACTIVE,
      );
      expect(result.status).toBe(CourseStatus.INACTIVE);
      expect(mockCourseRepo.updateById).toHaveBeenCalledWith(courseId, {
        status: CourseStatus.INACTIVE,
      });
    });
  });
});
