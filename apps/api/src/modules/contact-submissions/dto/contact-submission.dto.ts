import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  CONTACT_CONSULTATION_TOPICS,
  CONTACT_SUBMISSION_LIMITS,
  CONTACT_SUBMISSION_STATUSES,
  PHONE_NUMBER_PATTERN,
} from '@repo/shared/constants';
import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateContactSubmissionDto {
  @IsIn(CONTACT_CONSULTATION_TOPICS)
  consultationTopic: (typeof CONTACT_CONSULTATION_TOPICS)[number];

  @IsString()
  @Length(
    CONTACT_SUBMISSION_LIMITS.fullName.min,
    CONTACT_SUBMISSION_LIMITS.fullName.max,
  )
  fullName: string;

  @IsString()
  @Length(
    CONTACT_SUBMISSION_LIMITS.phone.min,
    CONTACT_SUBMISSION_LIMITS.phone.max,
  )
  @Matches(PHONE_NUMBER_PATTERN)
  phone: string;

  @IsString()
  @Length(
    CONTACT_SUBMISSION_LIMITS.provinceCode.min,
    CONTACT_SUBMISSION_LIMITS.provinceCode.max,
  )
  @Matches(/^\d+$/)
  provinceCode: string;

  @IsString()
  @Length(
    CONTACT_SUBMISSION_LIMITS.content.min,
    CONTACT_SUBMISSION_LIMITS.content.max,
  )
  content: string;

  @IsOptional()
  @IsString()
  @Length(
    CONTACT_SUBMISSION_LIMITS.sourcePath.min,
    CONTACT_SUBMISSION_LIMITS.sourcePath.max,
  )
  sourcePath?: string | null;
}

export class ListContactSubmissionsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsIn(CONTACT_SUBMISSION_STATUSES)
  status?: (typeof CONTACT_SUBMISSION_STATUSES)[number];
}

export class ExportContactSubmissionsDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsIn(CONTACT_SUBMISSION_STATUSES)
  status?: (typeof CONTACT_SUBMISSION_STATUSES)[number];
}

export class UpdateContactSubmissionStatusDto {
  @IsIn(CONTACT_SUBMISSION_STATUSES)
  status: (typeof CONTACT_SUBMISSION_STATUSES)[number];
}
