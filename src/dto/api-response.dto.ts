export class ApiResponseDto<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export enum ErrorCodes {
    // Application related errors
    DUPLICATE_APPLICATION = 'DUPLICATE_APPLICATION',
    APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
    CANCEL_NOT_ALLOWED = 'CANCEL_NOT_ALLOWED',
    INVALID_STATUS = 'INVALID_STATUS',
    
    // Job related errors
    JOB_NOT_FOUND = 'JOB_NOT_FOUND',
    CRAWLING_ERROR = 'CRAWLING_ERROR',
    INVALID_JOB_DATA = 'INVALID_JOB_DATA',
    SAVE_ERROR = 'SAVE_ERROR',
    
    // Common errors
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}
