export enum Roles {
  SUPER_ADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PENDING_CANCELED = 'PENDING_CANCELED',
  PAID_CANCELED = 'PAID_CANCELED',
}

export enum LessonStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',

  CANCELED = 'CANCELED',
}

export enum Rating {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
}

export enum TeacherSpecification {
  ENGLISH = 'ENGLISH',
  RUSSIAN = 'RUSSIAN',
  DEUTSCH = 'DEUTSCH',
  SPANISH = 'SPANISH',
  FRENCH = 'FRENCH',
  ITALIAN = 'ITALIAN',
  JAPANESE = 'JAPANESE',
  CHINESE = 'CHINESE',
  ARABIC = 'ARABIC',
  KOREAN = 'KOREAN',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export enum SearchFieldEnum {
  FULL_NAME = 'fullName',
  EMAIL = 'email',
  SPECIFICATION = 'specification',
  DESCRIPTION = 'description',
}

export enum NotificationType {
  LESSON_REMINDER = 'lesson_reminder',
  LESSON_CANCELLED = 'lesson_cancelled',
  LESSON_RESCHEDULED = 'lesson_rescheduled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REMINDER = 'payment_reminder',
  GENERAL = 'general',
  ANNOUNCEMENT = 'announcement',
}

export enum NotificationChannel {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}
