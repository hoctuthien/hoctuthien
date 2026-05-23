import { Field, ObjectType, InputType, ID, Int, registerEnumType } from '@nestjs/graphql';
import { MentorAvailabilityStatus } from '../../../common/enums/mentor-availability-status.enum';

// Đăng ký Enum MentorAvailabilityStatus vào GraphQL
registerEnumType(MentorAvailabilityStatus, {
  name: 'MentorAvailabilityStatus',
  description: 'Trạng thái của đơn đăng ký làm Mentor',
});

@ObjectType()
export class Certificate {
  @Field()
  name: string;

  @Field({ nullable: true })
  issuedBy?: string;

  @Field()
  imageUrl: string;
}

@ObjectType()
export class Degree {
  @Field()
  name: string;

  @Field({ nullable: true })
  university?: string;

  @Field()
  imageUrl: string;
}

@ObjectType()
export class MentorAvailabilityMetadata {
  @Field(() => [Certificate], { nullable: true })
  certificates?: Certificate[];

  @Field(() => [Degree], { nullable: true })
  degrees?: Degree[];
}

@ObjectType()
export class UserGql {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@ObjectType()
export class MentorAvailability {
  @Field(() => ID)
  id: string;

  @Field(() => UserGql, { nullable: true })
  user?: UserGql;

  @Field()
  mentorId: string;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  jobTitle?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  linkedinUrl?: string;

  @Field(() => Int, { nullable: true })
  yearsOfExperience?: number;

  @Field(() => [String])
  skills: string[];

  @Field()
  isActive: boolean;

  @Field(() => MentorAvailabilityMetadata)
  metadata: MentorAvailabilityMetadata;

  @Field(() => MentorAvailabilityStatus)
  status: MentorAvailabilityStatus;

  @Field({ nullable: true })
  note?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CreateMentorAvailabilityResult {
  @Field()
  message: string;

  @Field(() => MentorAvailability)
  data: MentorAvailability;
}

@InputType()
export class CertificateInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  issuedBy?: string;

  @Field()
  imageUrl: string;
}

@InputType()
export class DegreeInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  university?: string;

  @Field()
  imageUrl: string;
}

@InputType()
export class MentorAvailabilityMetadataInput {
  @Field(() => [CertificateInput])
  certificates: CertificateInput[];

  @Field(() => [DegreeInput])
  degrees: DegreeInput[];
}

@InputType()
export class CreateMentorAvailabilityGqlInput {
  @Field({ nullable: true })
  jobTitle?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  linkedinUrl?: string;

  @Field(() => Int, { nullable: true })
  yearsOfExperience?: number;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field(() => MentorAvailabilityMetadataInput)
  metadata: MentorAvailabilityMetadataInput;

  @Field({ nullable: true })
  note?: string;
}

@InputType()
export class UpdateMentorAvailabilityGqlInput {
  @Field({ nullable: true })
  jobTitle?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  linkedinUrl?: string;

  @Field(() => Int, { nullable: true })
  yearsOfExperience?: number;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field(() => MentorAvailabilityMetadataInput, { nullable: true })
  metadata?: MentorAvailabilityMetadataInput;

  @Field({ nullable: true })
  note?: string;

  @Field(() => MentorAvailabilityStatus, { nullable: true })
  status?: MentorAvailabilityStatus;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
