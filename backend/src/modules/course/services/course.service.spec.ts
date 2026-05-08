import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { CourseRepository } from '../repositories/course.repository';
import { DataSource } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';
import { CourseCategoryEntity } from '../../course-category/entities/course-category.entity';
import { NotFoundException } from '@nestjs/common';

describe('CourseService', () => {
  let service: CourseService;
  let mockEntityManager: any;
  let mockDataSource: any;

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
        // Handle both (entity, data) and (data) signatures
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: CourseRepository,
          useValue: {}, // Not used as we use dataSource.transaction
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
    it('should create a course and its category associations within a transaction', async () => {
      const payload = {
        title: 'Test Course',
        price: 500000,
        categoryIds: ['cat-1', 'cat-2'],
      };
      const mentorId = 'mentor-123';

      const result = await service.create(payload as any, mentorId);

      // Verify transaction was started
      expect(mockDataSource.transaction).toHaveBeenCalled();

      // Verify course was created with correct data
      expect(mockEntityManager.create).toHaveBeenCalledWith(
        CourseEntity,
        expect.objectContaining({
          title: payload.title,
          price: payload.price,
          mentorId,
        }),
      );

      // Verify categories were created
      expect(mockEntityManager.create).toHaveBeenCalledWith(
        CourseCategoryEntity,
        expect.objectContaining({
          courseId: 'mock-id',
          categoryId: 'cat-1',
        }),
      );

      // Verify both course and categories were saved
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        CourseEntity,
        expect.any(Object),
      );
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        CourseCategoryEntity,
        expect.any(Array),
      );

      expect(result).toBeDefined();
      expect(result.title).toBe(payload.title);
    });

    it('should create only course if no categoryIds provided', async () => {
      const payload = {
        title: 'Test Course',
        price: 500000,
        categoryIds: [],
      };
      const mentorId = 'mentor-123';

      await service.create(payload as any, mentorId);

      // Should only save course, not categories
      expect(mockEntityManager.save).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        CourseEntity,
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    it('should update course and refresh category associations', async () => {
      const courseId = 'course-123';
      const payload = {
        title: 'Updated Title',
        categoryIds: ['cat-3'],
      };

      mockEntityManager.findOne.mockImplementation((entity, options) => {
        if (entity === CourseEntity) {
          return Promise.resolve({
            id: courseId,
            title: 'Old Title',
            mentorId: 'mentor-123',
            price: 500000,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      });

      const result = await service.update(
        courseId,
        payload as any,
        'mentor-123',
      );

      // Verify transaction
      expect(mockDataSource.transaction).toHaveBeenCalled();

      // Verify old categories were deleted
      expect(mockEntityManager.softDelete).toHaveBeenCalledWith(
        CourseCategoryEntity,
        { courseId },
      );

      // Verify course was updated
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        CourseEntity,
        expect.objectContaining({
          title: 'Updated Title',
        }),
      );

      // Verify new categories were saved
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        CourseCategoryEntity,
        expect.any(Object),
      );

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', {} as any, 'mentor-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
