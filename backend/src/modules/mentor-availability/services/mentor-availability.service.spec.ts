import { Test, TestingModule } from '@nestjs/testing';
import { MentorAvailabilityService } from './mentor-availability.service';
import { MentorAvailabilityRepository } from '../repositories/mentor-availability.repository';
import { DataSource, EntityManager } from 'typeorm';
import { MentorAvailabilityStatus } from '../../../common/enums/mentor-availability-status.enum';
import { UserEntity, UserRole } from '../../user/entities/user.entity';
import { MentorProfileEntity } from '../../mentor-profile/entities/mentor-profile.entity';
import { MentorProfileStatus } from '../../mentor-profile/enums/mentor-profile-status.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MentorAvailabilityService - Mentor Application Flow', () => {
  let service: MentorAvailabilityService;
  let repository: MentorAvailabilityRepository;
  let dataSource: DataSource;
  let manager: Partial<EntityManager>;

  const adminId = 'fb00613c-14ef-4702-b797-6969fcbd5bfb';
  const menteeId = '6c99612d-25f0-49c3-813c-0e2e4877fb9f';
  const applicationId = 'app-id-123';

  beforeEach(async () => {
    // Mock EntityManager
    manager = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    // Mock DataSource
    const mockDataSource = {
      transaction: jest.fn((cb) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorAvailabilityService,
        {
          provide: MentorAvailabilityRepository,
          useValue: {
            findOne: jest.fn(),
            createAndSave: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MentorAvailabilityService>(MentorAvailabilityService);
    repository = module.get<MentorAvailabilityRepository>(
      MentorAvailabilityRepository,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('Full Flow: Creation to Approval', () => {
    it('should complete the mentor application flow successfully', async () => {
      // --- BƯỚC 1: TẠO ĐƠN (CREATE) ---
      const createPayload = {
        jobTitle: 'Senior Dev',
        company: 'Google',
        bio: 'I want to help others.',
        skills: ['NestJS', 'React'],
        yearsOfExperience: 5,
      };

      (repository.findOne as jest.Mock).mockResolvedValue(null); // Không có đơn nào đang chờ
      (repository.createAndSave as jest.Mock).mockResolvedValue({
        id: applicationId,
        mentorId: menteeId,
        ...createPayload,
        status: MentorAvailabilityStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createResult = await service.create(menteeId, createPayload);
      expect(createResult.data.status).toBe(MentorAvailabilityStatus.PENDING);
      expect(repository.createAndSave).toHaveBeenCalled();

      // --- BƯỚC 2: CHUYỂN SANG ĐANG XỬ LÝ (IN_PROGRESS) ---
      const pendingApp = {
        id: applicationId,
        mentorId: menteeId,
        status: MentorAvailabilityStatus.PENDING,
      };

      (manager.findOne as jest.Mock).mockResolvedValueOnce(pendingApp); // Tìm đơn PENDING
      (manager.save as jest.Mock).mockImplementationOnce((entity, data) => ({
        ...data,
        status: MentorAvailabilityStatus.IN_PROGRESS,
        approvedBy: adminId,
      }));

      const inProgressResult = await service.updateToInProgress(
        applicationId,
        adminId,
      );
      expect(inProgressResult.status).toBe(MentorAvailabilityStatus.IN_PROGRESS);
      expect(inProgressResult.approvedBy).toBe(adminId);

      // --- BƯỚC 3: PHÊ DUYỆT (APPROVE) ---
      const inProgressApp = {
        ...pendingApp,
        ...createPayload,
        status: MentorAvailabilityStatus.IN_PROGRESS,
        approvedBy: adminId,
      };

      const mockUser = { id: menteeId, role: UserRole.MENTEE };
      const mockProfile = null; // Chưa có profile

      (manager.findOne as jest.Mock)
        .mockResolvedValueOnce(inProgressApp) // 1. Tìm đơn IN_PROGRESS
        .mockResolvedValueOnce(mockUser) // 2. Tìm User để đổi role
        .mockResolvedValueOnce(mockProfile); // 3. Tìm Profile (không thấy)

      (manager.create as jest.Mock).mockReturnValue({ userId: menteeId }); // Tạo profile mới
      (manager.save as jest.Mock).mockImplementation((entityClass, entity) => entity);

      const approveResult = await service.approve(
        applicationId,
        adminId,
        'Welcome to the team!',
      );

      // Kiểm tra kết quả phê duyệt đơn
      expect(approveResult.status).toBe(MentorAvailabilityStatus.APPROVED);

      // Kiểm tra logic đồng bộ (đã thực hiện trong transaction)
      // 1. Kiểm tra lưu User role mới
      expect(manager.save).toHaveBeenCalledWith(
        UserEntity,
        expect.objectContaining({ role: UserRole.MENTOR }),
      );

      // 2. Kiểm tra tạo/lưu Mentor Profile
      expect(manager.save).toHaveBeenCalledWith(
        MentorProfileEntity,
        expect.objectContaining({
          userId: menteeId,
          jobTitle: createPayload.jobTitle,
          status: MentorProfileStatus.ACTIVE,
          isApproved: true,
        }),
      );
    });

    it('should throw BadRequestException if application is not IN_PROGRESS when approving', async () => {
      const pendingApp = {
        id: applicationId,
        status: MentorAvailabilityStatus.PENDING,
      };

      (manager.findOne as jest.Mock).mockResolvedValueOnce(pendingApp);

      await expect(
        service.approve(applicationId, adminId, 'Note'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
