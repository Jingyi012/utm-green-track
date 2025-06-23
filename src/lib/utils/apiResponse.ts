// utils/apiResponse.ts

export interface PaginationMeta {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: PaginationMeta;
}

export function formatPaginatedResponse<T>(
    data: T[],
    pageNumber: number,
    pageSize: number,
    totalRecords: number
): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
        success: true,
        data,
        pagination: {
            pageNumber,
            pageSize,
            totalPages,
            totalRecords,
        },
    };
}
