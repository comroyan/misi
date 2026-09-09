export type StepType =
  | 'INSTRUCTION'
  | 'EXTERNAL_LINK'
  | 'IMAGE_UPLOAD'
  | 'MULTIPLE_IMAGES'
  | 'VIDEO_UPLOAD'
  | 'TEXT'
  | 'TEXTAREA'
  | 'USERNAME'
  | 'LINK'
  | 'NUMBER'
  | 'CHECKBOX'
  | 'CONFIRMATION';

export interface MissionStep {
  id: string;
  order: number;
  type: StepType;
  title: string;
  description: string;
  required: boolean;
  placeholder?: string;
  externalUrl?: string;
  ctaText?: string;
  maxFiles?: number;
  maxFileSizeMb?: number;
  allowedMimeTypes?: string[];
}

export type MissionStatus = 'PUBLISHED' | 'DRAFT' | 'PAUSED' | 'ARCHIVED';

export type ParticipationLimitType =
  | 'UNLIMITED'
  | 'ONCE_PER_PHONE'
  | 'ONCE_PER_VISITOR'
  | 'ONCE_PER_DAY';

export interface Mission {
  id: string;
  title: string;
  slug: string;
  brandName: string;
  brandLogoUrl?: string;
  categoryId: string;
  description: string;
  termsAndConditions?: string[];
  rewardAmount: number;
  estimatedMinutes: number;
  coverUrl: string;
  status: MissionStatus;
  maxSlots: number;
  takenSlots: number;
  completedSlots: number;
  deadline?: string;
  reserveSlotOnStart: boolean;
  reservationMinutes: number;
  participationLimitType: ParticipationLimitType;
  badge?: 'Baru' | 'Terbatas' | 'Populer' | '';
  steps: MissionStep[];
  createdAt: string;
  updatedAt: string;
}

export interface MissionCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description?: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  phoneNormalized: string;
  createdAt: string;
  lastSeenAt: string;
}

export type ParticipationStatus =
  | 'STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'PAID';

export type SubmissionStatus = ParticipationStatus;

export interface StepAnswer {
  stepId: string;
  type: StepType;
  textValue?: string;
  files?: string[];
  completed: boolean;
  updatedAt: string;
}

export interface Participation {
  id: string;
  missionId: string;
  missionTitle: string;
  brandName: string;
  rewardAmount: number;
  coverUrl?: string;
  visitorId: string;
  participantName: string;
  participantPhone: string;
  participantPhoneMasked: string;
  publicToken: string;
  submissionCode?: string;
  status: ParticipationStatus;
  totalSteps?: number;
  completedSteps?: number;
  currentStepIndex?: number;
  stepsSnapshot?: MissionStep[];
  answers: Record<string, StepAnswer>;
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
  revisionStepId?: string;
  revisionReason?: string;
}

export interface Submission {
  id: string;
  submissionCode: string; // e.g. "MS-A7K2P"
  participationId: string;
  missionId: string;
  missionTitle: string;
  brandName: string;
  rewardAmount: number;
  visitorId: string;
  participantName: string;
  participantPhone: string;
  participantPhoneMasked: string;
  publicToken: string;
  status: ParticipationStatus;
  answers: Record<string, StepAnswer>;
  stepsSnapshot: MissionStep[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  revisionStepId?: string;
  revisionReason?: string;
  paymentMethod?: string;
  paymentAccount?: string;
  whatsappNotified?: boolean;
}

export type PaymentStatus = 'UNPAID' | 'PROCESSING' | 'PAID';

export interface PaymentRecord {
  id: string;
  submissionId: string;
  submissionCode: string;
  participantName: string;
  participantPhone: string;
  participantPhoneMasked: string;
  rewardAmount: number;
  method: 'DANA' | 'GOPAY' | 'SHOPEEPAY' | 'BANK_TRANSFER' | 'OVO' | 'LAINNYA';
  accountNumber: string;
  accountName: string;
  status: PaymentStatus;
  referenceNote?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  linkUrl?: string;
  badge?: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface PlatformSettings {
  platformName: string;
  tagline?: string;
  logoText?: string;
  accentColor?: string;
  whatsappSupportNumber: string;
  whatsappNotificationNumber?: string;
  whatsappAdminNotificationNumber?: string;
  maxUploadSizeMb?: number;
  maintenanceMode: boolean;
  enableWhatsAppNotifications?: boolean;
  acceptedPaymentMethods?: string[];
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: 'MISSION' | 'SUBMISSION' | 'PAYMENT' | 'SETTINGS' | 'BANNER' | 'AUTH';
  targetId: string;
  timestamp: string;
  details: string;
}
