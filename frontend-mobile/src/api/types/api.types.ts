export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Post type moved to post.types.ts to avoid conflicts
