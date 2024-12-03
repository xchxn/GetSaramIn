export class GetJobsDto {
  readonly search?: string;
  readonly keyword?: string;
  readonly company?: string;
  readonly category?: string;
  readonly location?: string;
  readonly experience?: string;
  readonly page?: number;
  readonly limit?: number;
}
