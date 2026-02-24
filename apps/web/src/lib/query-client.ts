import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Max Retries
      retryDelay: 2000, //ms
      staleTime: 30000,
    },
  },
});
