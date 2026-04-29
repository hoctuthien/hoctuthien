import { VALIDATION_RULES } from '../constants/validation.constant';
import { DynamicRegexPipe } from '../pipes/dynamic-regex.pipe';

// Class dành riêng cho Mentee ID
export class ParseMenteeIdPipe extends DynamicRegexPipe {
  constructor() {
    super(VALIDATION_RULES.MENTEE_ID.regex, VALIDATION_RULES.MENTEE_ID.message);
  }
}

// Class dành riêng cho Mentor ID
export class ParseMentorIdPipe extends DynamicRegexPipe {
  constructor() {
    super(VALIDATION_RULES.MENTOR_ID.regex, VALIDATION_RULES.MENTOR_ID.message);
  }
}
