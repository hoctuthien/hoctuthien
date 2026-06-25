import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { UserRole } from '../../../common/enums/database.enum';
import { MentorProfileEntity } from '../../mentor-profile/entities/mentor-profile.entity';
import { CourseEntity } from '../../course/entities/course.entity';
import { CourseBookingEntity, BookingStatus } from '../../course-booking/entities/course-booking.entity';
import { PaymentEntity, PaymentStatus } from '../../payment/entities/payment.entity';

@Injectable()
export class AdminStatsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(MentorProfileEntity)
    private readonly mentorProfileRepo: Repository<MentorProfileEntity>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,

    @InjectRepository(CourseBookingEntity)
    private readonly bookingRepo: Repository<CourseBookingEntity>,

    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalMentors,
      totalMentees,
      pendingMentors,
      activeCourses,
      totalCourses,
      totalBookings,
      completedBookings,
      cancelledBookings,
      donationResult,
      monthlyStats,
    ] = await Promise.all([
      this.userRepo.count({ where: { deletedAt: null as any } }),
      this.userRepo.count({ where: { role: UserRole.MENTOR, deletedAt: null as any } }),
      this.userRepo.count({ where: { role: UserRole.MENTEE, deletedAt: null as any } }),
      this.mentorProfileRepo.count({ where: { status: 'PENDING', deletedAt: null as any } }),
      this.courseRepo.count({ where: { status: 'ACTIVE' as any, deletedAt: null as any } }),
      this.courseRepo.count({ where: { deletedAt: null as any } }),
      this.bookingRepo.count({ where: { deletedAt: null as any } }),
      this.bookingRepo.count({ where: { status: BookingStatus.COMPLETED, deletedAt: null as any } }),
      this.bookingRepo.count({ where: { status: BookingStatus.CANCELLED, deletedAt: null as any } }),
      this.paymentRepo
        .createQueryBuilder('p')
        .select('COALESCE(SUM(p.amount), 0)', 'total')
        .where('p.status = :status', { status: PaymentStatus.SUCCESS })
        .andWhere('p.deletedAt IS NULL')
        .getRawOne(),
      this.getMonthlyDonations(),
    ]);

    return {
      totalUsers,
      totalMentors,
      totalMentees,
      pendingMentors,
      activeCourses,
      totalCourses,
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalDonations: parseFloat(donationResult?.total ?? '0') || 0,
      monthlyStats,
    };
  }

  async getLeaderboard(type: 'mentor' | 'mentee', limit = 10) {
    if (type === 'mentor') {
      return this.mentorProfileRepo
        .createQueryBuilder('mp')
        .leftJoinAndSelect('mp.user', 'user')
        .where('mp.isApproved = true')
        .andWhere('mp.deletedAt IS NULL')
        .orderBy('mp.totalStudents', 'DESC')
        .addOrderBy('mp.averageRating', 'DESC')
        .take(limit)
        .getMany();
    }

    // Mentee leaderboard: most completed bookings
    return this.bookingRepo
      .createQueryBuilder('b')
      .select('b.menteeId', 'menteeId')
      .addSelect('COUNT(b.id)', 'completedCount')
      .leftJoinAndSelect('user', 'user', 'user.id = b.menteeId')
      .where('b.status = :status', { status: BookingStatus.COMPLETED })
      .andWhere('b.deletedAt IS NULL')
      .groupBy('b.menteeId')
      .orderBy('completedCount', 'DESC')
      .take(limit)
      .getRawMany();
  }

  async getTransparencyData() {
    const [totalResult, completedCount, monthlyStats, recentPayments] = await Promise.all([
      this.paymentRepo
        .createQueryBuilder('p')
        .select('COALESCE(SUM(p.amount), 0)', 'total')
        .where('p.status = :status', { status: PaymentStatus.SUCCESS })
        .andWhere('p.deletedAt IS NULL')
        .getRawOne(),
      this.paymentRepo.count({
        where: { status: PaymentStatus.SUCCESS, deletedAt: null as any },
      }),
      this.getMonthlyDonations(),
      this.paymentRepo.find({
        where: { status: PaymentStatus.SUCCESS, deletedAt: null as any },
        order: { paidAt: 'DESC' },
        take: 10,
        select: ['id', 'amount', 'currency', 'paidAt', 'description'],
      }),
    ]);

    return {
      totalRaised: parseFloat(totalResult?.total ?? '0') || 0,
      totalCompleted: completedCount,
      monthlyStats,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        paidAt: p.paidAt,
        description: p.description
          ? p.description.replace(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g, '***@***.com')
          : null,
      })),
    };
  }

  private async getMonthlyDonations() {
    const rows = await this.paymentRepo
      .createQueryBuilder('p')
      .select("TO_CHAR(DATE_TRUNC('month', p.paidAt), 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'amount')
      .where('p.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('p.paidAt >= NOW() - INTERVAL \'12 months\'')
      .andWhere('p.deletedAt IS NULL')
      .groupBy("DATE_TRUNC('month', p.paidAt)")
      .orderBy("DATE_TRUNC('month', p.paidAt)", 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      month: r.month as string,
      amount: parseFloat(r.amount) || 0,
    }));
  }
}
