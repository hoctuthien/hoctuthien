// id (chuỗi ngẫu nhiên), userId, userAgent, ipAddress, expiresAt, isRevoked.
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userAgent: string;

  @Column()
  ipAddress: string;

  @Column()
  expiresAt: Date;

  @Column()
  isRevoked: boolean;
}

//
