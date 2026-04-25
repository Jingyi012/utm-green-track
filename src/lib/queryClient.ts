import { QueryClient } from '@tanstack/react-query';
import { message } from 'antd';

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        throwOnError: true,
      },
      mutations: {
        retry: 0,
        throwOnError: true,
      },
    },
  });
}

// Global error handler for queries and mutations
export const createGlobalErrorHandler = () => {
  return (error: unknown) => {
    const errorMessage = getErrorMessage(error);
    message.error(errorMessage);
  };
};

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  // Handle API Error Response
  if (error && typeof error === 'object') {
    const err = error as any;

    // Check for axios error response
    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    // Check for custom error message
    if (err.message) {
      return err.message;
    }
  }

  return 'An error occurred. Please try again.';
};
