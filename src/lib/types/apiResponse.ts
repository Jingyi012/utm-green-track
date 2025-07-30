export interface PaginationMeta {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: PaginationMeta;
}

export const formatPaginatedResponse = <T>(
    data: T[],
    pageNumber: number,
    pageSize: number,
    totalCount: number
): PaginatedResponse<T> => ({
    success: true,
    data,
    pagination: {
        pageNumber,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
    },
});

export interface GeneralResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    [key: string]: any;
}

export const formatResponse = <T>(data: T, success: boolean = true, message?: string, extras?: Record<string, any>): GeneralResponse<T> => {
    return {
        success,
        data,
        message,
        ...extras,
    };
};