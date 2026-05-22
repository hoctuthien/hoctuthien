import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MentorAvailabilityService } from './services/mentor-availability.service';
import {
  MentorAvailability,
  CreateMentorAvailabilityResult,
  CreateMentorAvailabilityGqlInput,
  UpdateMentorAvailabilityGqlInput,
} from './types/mentor-availability.graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';

@Resolver(() => MentorAvailability)
export class MentorAvailabilityResolver {
  constructor(
    private readonly mentorAvailabilityService: MentorAvailabilityService,
  ) {}

  /**
   * @description Lấy danh sách tất cả các yêu cầu làm Mentor (Dành cho Admin duyệt)
   * @access Admin (Role.ADMIN)
   */
  @Query(() => [MentorAvailability], { name: 'mentorAvailabilities' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll() {
    return this.mentorAvailabilityService.findAll();
  }

  /**
   * @description Lấy danh sách các yêu cầu làm Mentor của bản thân
   * @access Mentee (Role.MENTEE)
   */
  @Query(() => [MentorAvailability], { name: 'myMentorAvailabilities' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  async findMyMentorAvailabilities(@User('id') mentorId: string) {
    return this.mentorAvailabilityService.findByMentorId(mentorId);
  }

  /**
   * @description Lấy chi tiết một yêu cầu làm Mentor theo ID (Dành cho Admin)
   * @access Admin (Role.ADMIN)
   */
  @Query(() => MentorAvailability, { name: 'mentorAvailability' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findOneAdmin(@Args('id', { type: () => ID }) id: string) {
    return this.mentorAvailabilityService.findOne(id);
  }

  /**
   * @description Lấy chi tiết một yêu cầu làm Mentor của bản thân theo ID
   * @access Mentee (Role.MENTEE)
   */
  @Query(() => MentorAvailability, { name: 'myMentorAvailability' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  async findOneMine(
    @Args('id', { type: () => ID }) id: string,
    @User('id') mentorId: string,
  ) {
    return this.mentorAvailabilityService.findOneForMentor(id, mentorId);
  }

  /**
   * @description Đăng ký/Tạo mới yêu cầu làm Mentor (Mentee gửi yêu cầu)
   * @access Mentee (Role.MENTEE)
   */
  @Mutation(() => CreateMentorAvailabilityResult, { name: 'createMentorAvailability' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  async create(
    @Args('input') input: CreateMentorAvailabilityGqlInput,
    @User('id') mentorId: string,
  ) {
    return this.mentorAvailabilityService.create(mentorId, input);
  }

  /**
   * @description Cập nhật thông tin yêu cầu làm Mentor
   */
  @Mutation(() => MentorAvailability, { name: 'updateMentorAvailability' })
  async update(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMentorAvailabilityGqlInput,
  ) {
    return this.mentorAvailabilityService.update(id, input);
  }

  /**
   * @description Chuyển trạng thái yêu cầu sang Đang xử lý (In Progress)
   * @access Admin (Role.ADMIN)
   */
  @Mutation(() => MentorAvailability, { name: 'updateMentorAvailabilityToInProgress' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateToInProgress(
    @Args('id', { type: () => ID }) id: string,
    @User('id') adminId: string,
  ) {
    return this.mentorAvailabilityService.updateToInProgress(id, adminId);
  }

  /**
   * @description Phê duyệt yêu cầu làm Mentor
   * @access Admin (Role.ADMIN)
   */
  @Mutation(() => MentorAvailability, { name: 'approveMentorAvailability' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async approve(
    @Args('id', { type: () => ID }) id: string,
    @Args('note') note: string,
    @User('id') adminId: string,
  ) {
    return this.mentorAvailabilityService.approve(id, adminId, note);
  }

  /**
   * @description Từ chối yêu cầu làm Mentor
   * @access Admin (Role.ADMIN)
   */
  @Mutation(() => MentorAvailability, { name: 'rejectMentorAvailability' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reject(
    @Args('id', { type: () => ID }) id: string,
    @Args('note') note: string,
    @User('id') adminId: string,
  ) {
    return this.mentorAvailabilityService.reject(id, adminId, note);
  }

  /**
   * @description Hủy yêu cầu làm Mentor (Mentee tự hủy)
   * @access Mentee (Role.MENTEE)
   */
  @Mutation(() => MentorAvailability, { name: 'cancelMentorAvailability' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTEE)
  async cancel(
    @Args('id', { type: () => ID }) id: string,
    @User('id') menteeId: string,
  ) {
    return this.mentorAvailabilityService.cancel(id, menteeId);
  }

  /**
   * @description Xóa yêu cầu làm Mentor
   */
  @Mutation(() => Boolean, { name: 'removeMentorAvailability' })
  async remove(@Args('id', { type: () => ID }) id: string) {
    await this.mentorAvailabilityService.remove(id);
    return true;
  }
}
