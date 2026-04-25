import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getAllRequest,
  getMyRequest,
  createRequest,
  updateRequestResolveStatus,
  deleteRequest,
  deleteMyRequest,
} from '@/lib/services/requestService';
import { ChangeRequest } from '@/lib/types/typing';
import { PagedResponse } from '@/lib/types/apiResponse';
import { RequestStatus, requestStatusLabels } from '@/lib/enum/status';
import { wasteRecordQueryKeys } from '@/hook/wasteRecords';
import { useBadgeRefresh } from '@/contexts/BadgeContext';

// Query Keys
export const requestQueryKeys = {
  all: ['requests'] as const,
  lists: () => [...requestQueryKeys.all, 'list'] as const,
  list: (filters: RequestListFilters) => [...requestQueryKeys.lists(), { ...filters }] as const,
  myLists: () => [...requestQueryKeys.all, 'my-list'] as const,
  myList: (filters: MyRequestListFilters) =>
    [...requestQueryKeys.myLists(), { ...filters }] as const,
} as const;

export interface RequestListFilters {
  pageNumber?: number;
  pageSize?: number;
  matricNo?: string;
  status?: number;
}

export interface MyRequestListFilters {
  pageNumber?: number;
  pageSize?: number;
  status?: number;
}

export type CreateRequestInput = {
  wasteRecordId?: string;
  message: string;
};

export type UpdateRequestStatusInput = {
  requestIds: string[];
  status: RequestStatus;
};

const invalidateRequestQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: requestQueryKeys.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: requestQueryKeys.myLists(),
    }),
  ]);
};

const invalidateRequestAndWasteRecordQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    invalidateRequestQueries(queryClient),
    queryClient.invalidateQueries({
      queryKey: wasteRecordQueryKeys.lists(),
    }),
  ]);
};

const REQUEST_BADGE_PATHS = ['/waste-data/requests'];
const REQUEST_AND_WASTE_BADGE_PATHS = ['/waste-data/requests', '/waste-data/approval'];

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

export const useMyRequestList = (filters: MyRequestListFilters) => {
  return useQuery({
    queryKey: requestQueryKeys.myList(filters),
    queryFn: async () => {
      try {
        const response = await getMyRequest(filters);
        return response as PagedResponse<ChangeRequest[]>;
      } catch (error) {
        if (error instanceof Error) {
          message.error(error.message || 'Failed to fetch your requests');
        } else {
          message.error('Failed to fetch your requests');
        }
        throw error;
      }
    },
    throwOnError: false,
  });
};

// Mutation Hooks
export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  const refreshBadges = useBadgeRefresh();

  return useMutation({
    mutationFn: async (data: CreateRequestInput) => {
      const response = await createRequest(data);
      return response;
    },
    onSuccess: async () => {
      message.success('Request submitted successfully');
      await invalidateRequestAndWasteRecordQueries(queryClient);
      await refreshBadges(REQUEST_BADGE_PATHS);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to send request');
    },
    throwOnError: true,
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  const refreshBadges = useBadgeRefresh();

  return useMutation({
    mutationFn: async ({ requestIds, status }: UpdateRequestStatusInput) => {
      const response = await updateRequestResolveStatus({
        requestIds,
        status,
      });
      return response;
    },
    onSuccess: async (_, variables) => {
      message.success(`Request status updated to ${requestStatusLabels[variables.status]}`);
      await invalidateRequestAndWasteRecordQueries(queryClient);
      await refreshBadges(REQUEST_AND_WASTE_BADGE_PATHS);
    },
    onError: (_, variables) => {
      message.error(`Failed to update status to ${requestStatusLabels[variables.status]}`);
    },
    throwOnError: true,
  });
};

export const useDeleteRequest = () => {
  const queryClient = useQueryClient();
  const refreshBadges = useBadgeRefresh();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteRequest(id);
      return response;
    },
    onSuccess: async () => {
      message.success('Request deleted successfully');
      await invalidateRequestQueries(queryClient);
      await refreshBadges(REQUEST_BADGE_PATHS);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete request');
    },
    throwOnError: true,
  });
};

export const useDeleteMyRequest = () => {
  const queryClient = useQueryClient();
  const refreshBadges = useBadgeRefresh();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteMyRequest(id);
      return response;
    },
    onSuccess: async () => {
      message.success('Pending request deleted');
      await queryClient.invalidateQueries({
        queryKey: requestQueryKeys.myLists(),
      });
      await refreshBadges(REQUEST_BADGE_PATHS);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete request');
    },
    throwOnError: true,
  });
};
