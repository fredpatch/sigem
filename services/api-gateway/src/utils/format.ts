export const response = (
  data: any,
  message: string,
  success: boolean,
  status: number
) => {
  return {
    data,
    message,
    success,
    status,
  };
};
