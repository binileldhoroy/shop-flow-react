// Generic API response
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// API error response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Query params
export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: any;
}
