import {
  pgTable,
  bigserial,
  timestamp,
  varchar,
  uuid,
  boolean,
  unique,
  date,
  integer,
  jsonb,
  foreignKey,
  bigint,
  text,
  inet,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const courseBookingsStatusEnum = pgEnum('course_bookings_status_enum', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rescheduled',
]);
export const coursesStatusEnum = pgEnum('courses_status_enum', [
  'DRAFT',
  'PENDING',
  'ACTIVE',
  'INACTIVE',
]);
export const mentorAvailabilitiesStatusEnum = pgEnum(
  'mentor_availabilities_status_enum',
  ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED'],
);
export const paymentsStatusEnum = pgEnum('payments_status_enum', [
  'pending',
  'success',
  'failed',
  'expired',
]);
export const usersRoleEnum = pgEnum('users_role_enum', [
  'mentee',
  'mentor',
  'admin',
]);

export const redis = pgTable('redis', {
  id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  name: varchar({ length: 255 }).notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  userId: varchar().notNull(),
  userAgent: varchar().notNull(),
  ipAddress: varchar().notNull(),
  expiresAt: timestamp({ mode: 'string' }).notNull(),
  isRevoked: boolean().notNull(),
});

export const users = pgTable(
  'users',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    googleId: varchar('google_id', { length: 255 }),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    phone: varchar({ length: 50 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    dayOfBirth: date('day_of_birth'),
    gender: varchar({ length: 50 }),
    timezone: varchar({ length: 50 }).default('UTC'),
    role: usersRoleEnum().default('mentee').notNull(),
    points: integer().default(0),
    isVerified: boolean('is_verified').default(false),
    preferences: jsonb().default({}),
    metadata: jsonb().default({}),
    status: varchar({ length: 50 }).default('active'),
  },
  (table) => [
    unique('UQ_0bd5012aeb82628e07f6a1be53b').on(table.googleId),
    unique('UQ_97672ac88f789774dd47f7c8be3').on(table.email),
    unique('UQ_a000cca60bcf04454e727699490').on(table.phone),
  ],
);

export const userSessions = pgTable(
  'user_sessions',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    refreshToken: varchar('refresh_token', { length: 255 }).notNull(),
    deviceName: varchar('device_name', { length: 255 }),
    deviceType: varchar('device_type', { length: 100 }),
    userAgent: text('user_agent'),
    ipAddress: inet('ip_address'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    lastUsedAt: timestamp('last_used_at', {
      withTimezone: true,
      mode: 'string',
    }),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
    metadata: jsonb().default({}).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'FK_e9658e959c490b0a634dfc54783',
    }).onDelete('cascade'),
  ],
);

export const mentorProfiles = pgTable(
  'mentor_profiles',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    jobTitle: varchar('job_title', { length: 255 }),
    company: varchar({ length: 255 }),
    bio: text(),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    yearsOfExperience: integer('years_of_experience'),
    skills: jsonb().default([]).notNull(),
    averageRating: numeric('average_rating', { precision: 3, scale: 2 })
      .default('0')
      .notNull(),
    totalStudents: integer('total_students').default(0).notNull(),
    isApproved: boolean('is_approved').default(false).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    approvedBy: bigint('approved_by', { mode: 'number' }),
    metadata: jsonb().default({}).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'FK_5fa86c14c3a0de91f7253a180bb',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.approvedBy],
      foreignColumns: [users.id],
      name: 'FK_110ee6d532ceda80f06a52827ec',
    }).onDelete('set null'),
    unique('UQ_5fa86c14c3a0de91f7253a180bb').on(table.userId),
  ],
);

export const mentorAvailabilities = pgTable(
  'mentor_availabilities',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    mentorId: bigint('mentor_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    approvedBy: bigint('approved_by', { mode: 'number' }),
    jobTitle: varchar('job_title', { length: 255 }),
    company: varchar({ length: 255 }),
    bio: text(),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    yearsOfExperience: integer('years_of_experience'),
    skills: jsonb().default([]).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb().default({}).notNull(),
    status: mentorAvailabilitiesStatusEnum().default('PENDING').notNull(),
    note: varchar({ length: 500 }),
  },
  (table) => [
    foreignKey({
      columns: [table.mentorId],
      foreignColumns: [users.id],
      name: 'FK_97e6437a382fba7006286ade1c3',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.approvedBy],
      foreignColumns: [users.id],
      name: 'FK_3ad98be5779026743d0a5183ca8',
    }).onDelete('set null'),
  ],
);

export const courses = pgTable(
  'courses',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    mentorId: bigint('mentor_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    approvedBy: bigint('approved_by', { mode: 'number' }),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
    price: numeric({ precision: 15, scale: 2 }).notNull(),
    durationMinutes: integer('duration_minutes').default(60).notNull(),
    prerequisites: jsonb().default([]).notNull(),
    metadata: jsonb().default({}).notNull(),
    status: coursesStatusEnum().default('DRAFT').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.mentorId],
      foreignColumns: [users.id],
      name: 'FK_6a6abcb4975e235ea32e6c7fd98',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.approvedBy],
      foreignColumns: [users.id],
      name: 'FK_081d019674a95831850573a51e3',
    }).onDelete('set null'),
  ],
);

export const courseCategories = pgTable(
  'course_categories',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    courseId: bigint('course_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    categoryId: bigint('category_id', { mode: 'number' }).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: 'FK_c961c57e9f869094eebab0d547d',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'FK_53c2e5fe2bb1ba3c21deac6a986',
    }).onDelete('cascade'),
    unique('UQ_0fcee24a5291cf6c3de60ea670e').on(
      table.courseId,
      table.categoryId,
    ),
  ],
);

export const categories = pgTable(
  'categories',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }),
    iconUrl: varchar('icon_url', { length: 500 }),
    metadata: jsonb().default({}).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [unique('UQ_420d9f679d41281f282f5bc7d09').on(table.slug)],
);

export const payments = pgTable(
  'payments',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    currency: varchar({ length: 10 }).default('VND').notNull(),
    paymentMethod: varchar('payment_method', { length: 100 }),
    transactionId: varchar('transaction_id', { length: 255 }),
    description: varchar({ length: 500 }),
    expiredAt: timestamp('expired_at', { withTimezone: true, mode: 'string' }),
    vietqrQrDataUrl: text('vietqr_qr_data_url'),
    vietqrPayload: jsonb('vietqr_payload').default({}).notNull(),
    paymentGatewayPayload: jsonb('payment_gateway_payload')
      .default({})
      .notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true, mode: 'string' }),
    status: paymentsStatusEnum().default('pending').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'FK_427785468fb7d2733f59e7d7d39',
    }).onDelete('cascade'),
    unique('UQ_3c324ca49dabde7ffc0ef64675d').on(table.transactionId),
  ],
);

export const courseBookings = pgTable(
  'course_bookings',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    courseId: bigint('course_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    menteeId: bigint('mentee_id', { mode: 'number' }).notNull(),
    meetingTime: timestamp('meeting_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    googleMeetUrl: varchar('google_meet_url', { length: 500 }),
    calendarEventId: varchar('calendar_event_id', { length: 255 }),
    notesForMentor: text('notes_for_mentor'),
    cancellationReason: text('cancellation_reason'),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    paymentId: bigint('payment_id', { mode: 'number' }),
    metadata: jsonb().default({}).notNull(),
    status: courseBookingsStatusEnum().default('pending').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: 'FK_0fa3cabc0a327c50557f304c181',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.menteeId],
      foreignColumns: [users.id],
      name: 'FK_9fa0254718aaf654707a0d6ba64',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.paymentId],
      foreignColumns: [payments.id],
      name: 'FK_2bcf136d1622f9e26f660dc9495',
    }).onDelete('set null'),
    unique('REL_2bcf136d1622f9e26f660dc949').on(table.paymentId),
  ],
);

export const courseReviews = pgTable(
  'course_reviews',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    courseBookingId: bigint('course_booking_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    courseId: bigint('course_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    reviewerId: bigint('reviewer_id', { mode: 'number' }).notNull(),
    rating: integer().notNull(),
    comment: text(),
    metadata: jsonb().default({}).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseBookingId],
      foreignColumns: [courseBookings.id],
      name: 'FK_ae8af75a0e1b00ff26be172b577',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: 'FK_1f69fdcbd7ea5f0e52c3230c00b',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.reviewerId],
      foreignColumns: [users.id],
      name: 'FK_0e8d075087cb5408c0e9578d87e',
    }).onDelete('cascade'),
    unique('UQ_ae8af75a0e1b00ff26be172b577').on(table.courseBookingId),
  ],
);

export const userReviews = pgTable(
  'user_reviews',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    courseBookingId: bigint('course_booking_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    reviewerId: bigint('reviewer_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    reviewedId: bigint('reviewed_id', { mode: 'number' }).notNull(),
    rating: integer().notNull(),
    comment: text(),
    type: varchar({ length: 50 }),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseBookingId],
      foreignColumns: [courseBookings.id],
      name: 'FK_3ff984b7f418d5f49f4b516390b',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.reviewerId],
      foreignColumns: [users.id],
      name: 'FK_0ba89242a8bea8c4a3780963d7d',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.reviewedId],
      foreignColumns: [users.id],
      name: 'FK_0e43c5f7ecb9c6c074cb4067073',
    }).onDelete('cascade'),
  ],
);

export const systemConfig = pgTable(
  'system_config',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    configKey: varchar('config_key', { length: 255 }).notNull(),
    configValue: jsonb('config_value').notNull(),
    description: text(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    createdBy: bigint('created_by', { mode: 'number' }),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: 'FK_67098b57e7e7c5f4096581589d0',
    }).onDelete('set null'),
    unique('UQ_c54d4e3d5a246ef29601e48d751').on(table.configKey),
  ],
);

export const penaltyTickets = pgTable(
  'penalty_tickets',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    reason: text().notNull(),
    pointsDeducted: integer('points_deducted').default(0).notNull(),
    evidenceUrl: varchar('evidence_url', { length: 500 }),
    metadata: jsonb().default({}).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'FK_451e10d609d7abedd0cc1be5b8b',
    }).onDelete('cascade'),
  ],
);

export const conversations = pgTable(
  'conversations',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    mentorId: bigint('mentor_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    menteeId: bigint('mentee_id', { mode: 'number' }).notNull(),
    metadata: jsonb().default({}).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.mentorId],
      foreignColumns: [users.id],
      name: 'FK_758daecfb58715b12dd3abbcdc7',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.menteeId],
      foreignColumns: [users.id],
      name: 'FK_ff45964dca3e37d8430f7206502',
    }).onDelete('cascade'),
  ],
);

export const messages = pgTable(
  'messages',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conversationId: bigint('conversation_id', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    senderId: bigint('sender_id', { mode: 'number' }).notNull(),
    content: text().notNull(),
    attachments: jsonb().default([]).notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: 'FK_3bc55a7c3f9ed54b520bb5cfe23',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.senderId],
      foreignColumns: [users.id],
      name: 'FK_22133395bd13b970ccd0c34ab22',
    }).onDelete('cascade'),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    type: varchar({ length: 100 }).notNull(),
    actionLink: varchar('action_link', { length: 500 }),
    payload: jsonb().default({}).notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    status: varchar({ length: 50 }).default('active').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'FK_9a8a82462cab47c73d25f49261f',
    }).onDelete('cascade'),
  ],
);
