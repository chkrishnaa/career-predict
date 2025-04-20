// API response types

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = any> extends ApiResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
} 