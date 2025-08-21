export interface GeneralResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    [key: string]: any;
}

export interface PagedResponse<T> extends GeneralResponse<T> {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
}