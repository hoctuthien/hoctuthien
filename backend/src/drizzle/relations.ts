import { relations } from 'drizzle-orm/relations';
import {
  users,
  userSessions,
  mentorProfiles,
  mentorAvailabilities,
  courses,
  courseCategories,
  categories,
  payments,
  courseBookings,
  courseReviews,
  userReviews,
  systemConfig,
  penaltyTickets,
  conversations,
  messages,
  notifications,
} from './schema';

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userSessions: many(userSessions),
  mentorProfiles_userId: many(mentorProfiles, {
    relationName: 'mentorProfiles_userId_users_id',
  }),
  mentorProfiles_approvedBy: many(mentorProfiles, {
    relationName: 'mentorProfiles_approvedBy_users_id',
  }),
  mentorAvailabilities_mentorId: many(mentorAvailabilities, {
    relationName: 'mentorAvailabilities_mentorId_users_id',
  }),
  mentorAvailabilities_approvedBy: many(mentorAvailabilities, {
    relationName: 'mentorAvailabilities_approvedBy_users_id',
  }),
  courses_mentorId: many(courses, {
    relationName: 'courses_mentorId_users_id',
  }),
  courses_approvedBy: many(courses, {
    relationName: 'courses_approvedBy_users_id',
  }),
  payments: many(payments),
  courseBookings: many(courseBookings),
  courseReviews: many(courseReviews),
  userReviews_reviewerId: many(userReviews, {
    relationName: 'userReviews_reviewerId_users_id',
  }),
  userReviews_reviewedId: many(userReviews, {
    relationName: 'userReviews_reviewedId_users_id',
  }),
  systemConfigs: many(systemConfig),
  penaltyTickets: many(penaltyTickets),
  conversations_mentorId: many(conversations, {
    relationName: 'conversations_mentorId_users_id',
  }),
  conversations_menteeId: many(conversations, {
    relationName: 'conversations_menteeId_users_id',
  }),
  messages: many(messages),
  notifications: many(notifications),
}));

export const mentorProfilesRelations = relations(mentorProfiles, ({ one }) => ({
  user_userId: one(users, {
    fields: [mentorProfiles.userId],
    references: [users.id],
    relationName: 'mentorProfiles_userId_users_id',
  }),
  user_approvedBy: one(users, {
    fields: [mentorProfiles.approvedBy],
    references: [users.id],
    relationName: 'mentorProfiles_approvedBy_users_id',
  }),
}));

export const mentorAvailabilitiesRelations = relations(
  mentorAvailabilities,
  ({ one }) => ({
    user_mentorId: one(users, {
      fields: [mentorAvailabilities.mentorId],
      references: [users.id],
      relationName: 'mentorAvailabilities_mentorId_users_id',
    }),
    user_approvedBy: one(users, {
      fields: [mentorAvailabilities.approvedBy],
      references: [users.id],
      relationName: 'mentorAvailabilities_approvedBy_users_id',
    }),
  }),
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user_mentorId: one(users, {
    fields: [courses.mentorId],
    references: [users.id],
    relationName: 'courses_mentorId_users_id',
  }),
  user_approvedBy: one(users, {
    fields: [courses.approvedBy],
    references: [users.id],
    relationName: 'courses_approvedBy_users_id',
  }),
  courseCategories: many(courseCategories),
  courseBookings: many(courseBookings),
  courseReviews: many(courseReviews),
}));

export const courseCategoriesRelations = relations(
  courseCategories,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseCategories.courseId],
      references: [courses.id],
    }),
    category: one(categories, {
      fields: [courseCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  courseCategories: many(courseCategories),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  courseBookings: many(courseBookings),
}));

export const courseBookingsRelations = relations(
  courseBookings,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseBookings.courseId],
      references: [courses.id],
    }),
    user: one(users, {
      fields: [courseBookings.menteeId],
      references: [users.id],
    }),
    payment: one(payments, {
      fields: [courseBookings.paymentId],
      references: [payments.id],
    }),
    courseReviews: many(courseReviews),
    userReviews: many(userReviews),
  }),
);

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
  courseBooking: one(courseBookings, {
    fields: [courseReviews.courseBookingId],
    references: [courseBookings.id],
  }),
  course: one(courses, {
    fields: [courseReviews.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [courseReviews.reviewerId],
    references: [users.id],
  }),
}));

export const userReviewsRelations = relations(userReviews, ({ one }) => ({
  courseBooking: one(courseBookings, {
    fields: [userReviews.courseBookingId],
    references: [courseBookings.id],
  }),
  user_reviewerId: one(users, {
    fields: [userReviews.reviewerId],
    references: [users.id],
    relationName: 'userReviews_reviewerId_users_id',
  }),
  user_reviewedId: one(users, {
    fields: [userReviews.reviewedId],
    references: [users.id],
    relationName: 'userReviews_reviewedId_users_id',
  }),
}));

export const systemConfigRelations = relations(systemConfig, ({ one }) => ({
  user: one(users, {
    fields: [systemConfig.createdBy],
    references: [users.id],
  }),
}));

export const penaltyTicketsRelations = relations(penaltyTickets, ({ one }) => ({
  user: one(users, {
    fields: [penaltyTickets.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user_mentorId: one(users, {
      fields: [conversations.mentorId],
      references: [users.id],
      relationName: 'conversations_mentorId_users_id',
    }),
    user_menteeId: one(users, {
      fields: [conversations.menteeId],
      references: [users.id],
      relationName: 'conversations_menteeId_users_id',
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
