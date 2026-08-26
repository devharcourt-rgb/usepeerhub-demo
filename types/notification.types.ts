export interface INotification {
  id?: string;
  recipient: string;
  subject: string;
  message: string;
  status: NotificationStatus;
}

export enum NotificationStatus {
  UNREAD = "unread",
  READ = "read",
}
