import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseBookingRepository } from '../repositories/course-booking.repository';
import { createCourseBookingSchema, updateCourseBookingSchema, courseBookingSchema } from '../schema/course-booking.schema';
import { CreateCourseBookingInput, UpdateCourseBookingInput } from '../types/course-booking.types';

@Injectable()
export class CourseBookingService {
  constructor(private readonly courseBookingRepository: CourseBookingRepository) {}

  async findAll() {
    const items = await this.courseBookingRepository.findMany();
    return items.map(item => courseBookingSchema.parse(item));
  }

  async findOne(id: string) {
    const item = await this.courseBookingRepository.findById(id);
    if (!item) throw new NotFoundException('Course Booking not found');
    return courseBookingSchema.parse(item);
  }

  async create(payload: CreateCourseBookingInput) {
    const parsed = createCourseBookingSchema.parse(payload);
    const created = await this.courseBookingRepository.createAndSave(parsed);
    return courseBookingSchema.parse(created);
  }

  async update(id: string, payload: UpdateCourseBookingInput) {
    const parsed = updateCourseBookingSchema.parse(payload);
    const updated = await this.courseBookingRepository.updateById(id, parsed);
    return courseBookingSchema.parse(updated);
  }

  async remove(id: string) {
    await this.courseBookingRepository.softDeleteById(id);
  }
}
