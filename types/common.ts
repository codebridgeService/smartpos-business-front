/**
 * Common API pagination and response types matching backend microservice specifications.
 */

export interface PaginatorLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface LengthAwarePaginator<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PaginatorLink[];
  next_page_url: string | null;
  path: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ApiMessageResponse {
  message: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  message?: string;
}
