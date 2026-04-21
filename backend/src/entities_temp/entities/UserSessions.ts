import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_sessions", { schema: "public" })
export class UserSessions {
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

  @Column("bigint", { name: "user_id" })
  userId: string;

  @Column("character varying", { name: "refresh_token", length: 255 })
  refreshToken: string;

  @Column("character varying", {
    name: "device_name",
    nullable: true,
    length: 255,
  })
  deviceName: string | null;

  @Column("character varying", {
    name: "device_type",
    nullable: true,
    length: 100,
  })
  deviceType: string | null;

  @Column("text", { name: "user_agent", nullable: true })
  userAgent: string | null;

  @Column("inet", { name: "ip_address", nullable: true })
  ipAddress: string | null;

  @Column("timestamp with time zone", { name: "refresh_token_expires_at" })
  refreshTokenExpiresAt: Date;

  @Column("timestamp with time zone", { name: "last_used_at", nullable: true })
  lastUsedAt: Date | null;

  @Column("timestamp with time zone", { name: "revoked_at", nullable: true })
  revokedAt: Date | null;

  @Column("jsonb", { name: "metadata", default: {} })
  metadata: object;

  @Column("character varying", {
    name: "status",
    length: 50,
    default: () => "'active'",
  })
  status: string;
}
