import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class DynamicRegexPipe implements PipeTransform {
  constructor(
    private readonly regex: RegExp,
    private readonly errorMessage: string,
  ) {}

  transform(value: string) {
    if (!this.regex.test(value)) {
      throw new BadRequestException(this.errorMessage);
    }
    return value;
  }
}
