import { VALIDATION_RULES } from '../constants/validation.constant';
import { DynamicRegexPipe } from '../pipes/dynamic-regex.pipe';

export const ParseCustomId = (key: keyof typeof VALIDATION_RULES) => {
  const { regex, message } = VALIDATION_RULES[key];
  return new DynamicRegexPipe(regex, message);
};

// ParseCustomId thực chất là một Factory Function
// giúp bạn khởi tạo nhanh một Pipe instance mà
// không cần viết new DynamicRegexPipe(...) rườm rà nhe.
