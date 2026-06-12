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
        metadata: {
          certificates: [
            {
              name: 'NestJS Certified',
              issuedBy: 'NestJS',
              imageUrl: 'https://example.com/cert.png',
            },
          ],
          degrees: [
            {
              name: 'Bachelor of Computer Science',
              university: 'HUST',
              imageUrl: 'https://example.com/degree.png',
            },
          ],
        },
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
        createdAt: new Date(),
        updatedAt: new Date(),
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

    it('should successfully onboard candidate user 43451b60-9c9d-4420-96dd-4e3efb479ea6 and be approved by admin f389003f-bef3-4d0b-8e89-a6a82992215d', async () => {
      const specificCandidateId = '43451b60-9c9d-4420-96dd-4e3efb479ea6';
      const specificAdminId = 'f389003f-bef3-4d0b-8e89-a6a82992215d';
      const specificAppId = 'app-uuid-spec-43451';

      const createPayload = {
        jobTitle: 'Senior Software Engineer',
        company: 'Charity Tech Hub',
        bio: 'Dedicated mentor aiming to support education projects.',
        skills: ['TypeScript', 'NestJS', 'GraphQL'],
        yearsOfExperience: 8,
        metadata: {
          certificates: [
            {
              name: 'Certified AWS Professional',
              issuedBy: 'Amazon Web Services',
              imageUrl: 'https://example.com/aws-cert.png',
            },
          ],
          degrees: [
            {
              name: 'Master of Computer Science',
              university: 'VNU University of Engineering and Technology',
              imageUrl: 'https://example.com/master-degree.png',
            },
          ],
        },
      };

      // --- 1. Register / Create application ---
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      (repository.createAndSave as jest.Mock).mockResolvedValue({
        id: specificAppId,
        mentorId: specificCandidateId,
        ...createPayload,
        status: MentorAvailabilityStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createResult = await service.create(specificCandidateId, createPayload);
      expect(createResult.data.status).toBe(MentorAvailabilityStatus.PENDING);
      expect(createResult.data.mentorId).toBe(specificCandidateId);

      // --- 2. Move application to IN_PROGRESS by Admin ---
      const pendingApp = {
        id: specificAppId,
        mentorId: specificCandidateId,
        status: MentorAvailabilityStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (manager.findOne as jest.Mock).mockResolvedValueOnce(pendingApp);
      (manager.save as jest.Mock).mockImplementationOnce((entity, data) => ({
        ...data,
        status: MentorAvailabilityStatus.IN_PROGRESS,
        approvedBy: specificAdminId,
      }));

      const inProgressResult = await service.updateToInProgress(
        specificAppId,
        specificAdminId,
      );
      expect(inProgressResult.status).toBe(MentorAvailabilityStatus.IN_PROGRESS);
      expect(inProgressResult.approvedBy).toBe(specificAdminId);

      // --- 3. Approve application by Admin (Promote to Mentor) ---
      const inProgressApp = {
        ...pendingApp,
        ...createPayload,
        status: MentorAvailabilityStatus.IN_PROGRESS,
        approvedBy: specificAdminId,
      };

      const mockUser = { id: specificCandidateId, role: UserRole.MENTEE };
      const mockProfile = null;

      (manager.findOne as jest.Mock)
        .mockResolvedValueOnce(inProgressApp) // Find application
        .mockResolvedValueOnce(mockUser)       // Find User to change role
        .mockResolvedValueOnce(mockProfile);   // Find profile (returns null)

      (manager.create as jest.Mock).mockReturnValue({ userId: specificCandidateId });
      (manager.save as jest.Mock).mockImplementation((entityClass, entity) => entity);

      const approveResult = await service.approve(
        specificAppId,
        specificAdminId,
        'Welcome candidate to the mentor community! Approved.',
      );

      // --- 4. Assertions ---
      expect(approveResult.status).toBe(MentorAvailabilityStatus.APPROVED);

      // Check User Role updated to UserRole.MENTOR
      expect(manager.save).toHaveBeenCalledWith(
        UserEntity,
        expect.objectContaining({
          id: specificCandidateId,
          role: UserRole.MENTOR,
        }),
      );

      // Check Mentor Profile is created with correct properties
      expect(manager.save).toHaveBeenCalledWith(
        MentorProfileEntity,
        expect.objectContaining({
          userId: specificCandidateId,
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

