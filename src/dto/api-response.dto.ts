export class ApiResponseDto<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export enum ErrorCodes {
    DUPLICATE_APPLICATION = 'DUPLICATE_APPLICATION',
    APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
    CANCEL_NOT_ALLOWED = 'CANCEL_NOT_ALLOWED',
    INVALID_STATUS = 'INVALID_STATUS',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}
