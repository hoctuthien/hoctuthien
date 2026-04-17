import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: 'payments' })
export class PaymentEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
