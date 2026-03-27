---
to: src/modules/<%= name %>/dtos/<%= name %>.dto.ts
---
import { IsString, IsNotEmpty } from 'class-validator';

export class <%= className %>Dto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
