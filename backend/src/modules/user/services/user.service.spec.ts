import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUserRepository = {
    findMany: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    createAndSave: jest.fn(),
    updateById: jest.fn(),
    softDeleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and hash password', async () => {
      const payload = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.MENTEE,
      };

      const mockSavedUser = {
        id: '1',
        ...payload,
        passwordHash: 'hashed_password',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      delete (mockSavedUser as any).password;

      mockUserRepository.createAndSave.mockResolvedValue(mockSavedUser);

      const result = await service.create(payload);

      expect(repository.createAndSave).toHaveBeenCalled();
      expect(result.email).toEqual(payload.email);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const mockUser = { 
        id: '1', 
        email: 'test@example.com', 
        name: 'Test', 
        role: UserRole.MENTEE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne('1');
      expect(result.email).toEqual(mockUser.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
