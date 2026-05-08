import { components } from '@/core/types/api.generated';

type Category = NonNullable<components['schemas']['CreateCourseDto']['categoryIds']>[number];
// Since Category schema wasn't fully defined in components, I'll use the structure from CategoryController_findAll
export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  status: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'mentee' | 'mentor' | 'admin';
  status: string;
}

export interface CourseData {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  durationMinutes: number;
  status: string;
}

export interface ReviewData {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const MOCK_CATEGORIES: CategoryData[] = [
  {
    id: 'cat-1',
    name: 'Toán học',
    slug: 'mathematics',
    iconUrl: 'Calculator',
    status: 'active',
  },
  {
    id: 'cat-2',
    name: 'Khoa học',
    slug: 'science',
    iconUrl: 'Beaker',
    status: 'active',
  },
  {
    id: 'cat-3',
    name: 'Địa lý',
    slug: 'geography',
    iconUrl: 'Globe',
    status: 'active',
  },
  {
    id: 'cat-4',
    name: 'Kinh tế',
    slug: 'economics',
    iconUrl: 'TrendingUp',
    status: 'active',
  },
];

export const MOCK_INSTRUCTORS: UserData[] = [
  {
    id: 'ins-1',
    name: 'Dr. Robert Fox',
    email: 'robert.fox@example.com',
    avatarUrl: '/images/avatar_logo.png',
    role: 'mentor',
    status: 'active',
  },
  {
    id: 'ins-2',
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    avatarUrl: '/images/avatar_logo.png',
    role: 'mentor',
    status: 'active',
  },
  {
    id: 'ins-3',
    name: 'Cody Fisher',
    email: 'cody.fisher@example.com',
    avatarUrl: '/images/avatar_logo.png',
    role: 'mentor',
    status: 'active',
  },
  {
    id: 'ins-4',
    name: 'Esther Howard',
    email: 'esther.howard@example.com',
    avatarUrl: '/images/avatar_logo.png',
    role: 'mentor',
    status: 'active',
  },
];

export const MOCK_TESTIMONIALS: ReviewData[] = [
  {
    id: 'rev-1',
    courseId: 'course-1',
    userId: 'user-1',
    userName: 'Guy Hawkins',
    userAvatar: '',
    rating: 5,
    comment: 'The courses are very well structured and the mentors are extremely helpful. I have learned a lot in a short period of time.',
    createdAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'rev-2',
    courseId: 'course-2',
    userId: 'user-2',
    userName: 'Brooklyn Simmons',
    userAvatar: '',
    rating: 5,
    comment: 'I highly recommend this platform for anyone looking to improve their skills. The quality of education is top-notch.',
    createdAt: '2026-05-02T09:00:00Z',
  },
  {
    id: 'rev-3',
    courseId: 'course-3',
    userId: 'user-3',
    userName: 'Albert Flores',
    userAvatar: '',
    rating: 5,
    comment: 'Great community and amazing content. I love how I can learn at my own pace and still get guidance when needed.',
    createdAt: '2026-05-03T10:00:00Z',
  },
];
