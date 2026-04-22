import { SetMetadata } from '@nestjs/common';
import { CookieOptions } from 'express';

export const SET_COOKIE_KEY = 'set_cookie';

export interface SetCookieOptions {
  name: string;
  field: string;
  options?: CookieOptions;
}

export const SetCookie = (
  options: SetCookieOptions | SetCookieOptions[],
) => SetMetadata(SET_COOKIE_KEY, Array.isArray(options) ? options : [options]);
