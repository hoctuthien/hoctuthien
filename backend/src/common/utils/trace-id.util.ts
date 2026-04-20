import { randomUUID } from 'node:crypto';

export const createTraceId = () => `req-${randomUUID()}`;

