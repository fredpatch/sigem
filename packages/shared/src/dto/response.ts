export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string;
  success: boolean;
  status: number;
}

export const response = <T>(
  data: T | null,
  error: string | null,
  message: string,
  success = true,
  status = 200
): ApiResponse<T> => ({
  data,
  error,
  message,
  success,
  status,
});
