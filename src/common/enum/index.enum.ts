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
  ZERO = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export enum TeacherSpecification {
  ENGLISH = "ENGLISH",
  RUSSIAN = "RUSSIAN",
  DEUTSCH = "DEUTSCH",
  SPANISH = "SPANISH",
  FRENCH = "FRENCH",
  ITALIAN = "ITALIAN",
  JAPANESE = "JAPANESE",
  CHINESE = "CHINESE",
  ARABIC = "ARABIC",
  KOREAN = "KOREAN",
}
