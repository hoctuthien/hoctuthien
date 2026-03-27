---
to: src/modules/<%= name %>/entities/<%= name %>.entity.ts
---
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: '<%= pluralName %>' })
export class <%= className %>Entity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
