export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string;
  success: boolean;
  status: number;
}
