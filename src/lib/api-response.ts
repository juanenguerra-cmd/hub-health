// src/lib/api-response.ts

/**
 * Standardized API Response Types
 */

/**
 * Interface for the standard API response.
 */
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

/**
 * Helper function to create a successful response.
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Helper function to create an error response.
 */
export function createErrorResponse(message: string): ApiResponse<null> {
    return {
        success: false,
        message,
    };
}