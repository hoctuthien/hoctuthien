import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("UQ_97672ac88f789774dd47f7c8be3", ["email"], { unique: true })
@Index("UQ_0bd5012aeb82628e07f6a1be53b", ["googleId"], { unique: true })
@Index("UQ_a000cca60bcf04454e727699490", ["phone"], { unique: true })
@Entity("users", { schema: "public" })
export class Users {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp without time zone", {
    name: "updated_at",
    default: () => "now()",
  })
  updatedAt: Date;

  @Column("timestamp without time zone", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @Column("character varying", {
    name: "google_id",
    nullable: true,
    unique: true,
    length: 255,
  })
  googleId: string | null;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("character varying", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("character varying", {
    name: "password_hash",
    nullable: true,
    length: 255,
  })
  passwordHash: string | null;

  @Column("character varying", {
    name: "phone",
    nullable: true,
    unique: true,
    length: 50,
  })
  phone: string | null;

  @Column("character varying", {
    name: "avatar_url",
    nullable: true,
    length: 500,
  })
  avatarUrl: string | null;

  @Column("date", { name: "day_of_birth", nullable: true })
  dayOfBirth: string | null;

  @Column("character varying", { name: "gender", nullable: true, length: 50 })
  gender: string | null;

  @Column("character varying", { name: "timezone", nullable: true, length: 50 })
  timezone: string | null;

  @Column("character varying", {
    name: "role",
    length: 50,
    default: () => "'mentee'",
  })
  role: string;

  @Column("integer", { name: "points", default: () => "0" })
  points: number;

  @Column("boolean", { name: "is_verified", default: () => "false" })
  isVerified: boolean;

  @Column("jsonb", { name: "preferences", nullable: true })
  preferences: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("character varying", {
    name: "status",
    length: 50,
    default: () => "'active'",
  })
  status: string;
}
