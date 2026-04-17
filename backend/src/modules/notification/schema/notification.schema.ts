export type NotificationSchema = {
  name: string;
};

export const notificationSchema = {
  parse: <T>(payload: T) => payload,
};
