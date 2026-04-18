import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getAllRequest,
  updateRequestResolveStatus,
  deleteRequest,
} from '@/lib/services/requestService';
import { ChangeRequest } from '@/lib/types/typing';
import { PagedResponse } from '@/lib/types/apiResponse';
import { RequestStatus } from '@/lib/enum/status';

// Query Keys
export const requestQueryKeys = {
  all: ['requests'] as const,
  lists: () => [...requestQueryKeys.all, 'list'] as const,
  list: (filters: RequestListFilters) => [...requestQueryKeys.lists(), { ...filters }] as const,
} as const;

export interface RequestListFilters {
  pageNumber?: number;
  pageSize?: number;
  matricNo?: string;
  status?: number;
}

// Query Hooks
export const useRequestList = (filters: RequestListFilters) => {
  return useQuery({
    queryKey: requestQueryKeys.list(filters),
    queryFn: async () => {
      const response = await getAllRequest(filters);
      return response as PagedResponse<ChangeRequest[]>;
    },
    throwOnError: true,
  });
};

// Mutation Hooks
export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { requestIds: string[]; status: RequestStatus }) => {
      const response = await updateRequestResolveStatus({
        requestIds: data.requestIds,
        status: data.status,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: requestQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};

export const useDeleteRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteRequest(id);
      return response;
    },
    onSuccess: () => {
      message.success('Request deleted successfully');
      queryClient.invalidateQueries({
        queryKey: requestQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};
