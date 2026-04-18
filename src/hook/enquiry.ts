import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  createEnquiry,
  deleteEnquiry,
  getAllEnquiry,
  getEnquiryById,
  replyEnquiry,
  updateEnquiryStatus,
} from '@/lib/services/enquiry';
import { Enquiry, EnquiryDetails, EnquiryInput } from '@/lib/types/typing';
import { PagedResponse } from '@/lib/types/apiResponse';
import { useBadgeRefresh } from '@/contexts/BadgeContext';

// Query Keys
export const enquiryQueryKeys = {
  all: ['enquiry'] as const,
  lists: () => [...enquiryQueryKeys.all, 'list'] as const,
  list: (filters: EnquiryListFilters) => [...enquiryQueryKeys.lists(), { ...filters }] as const,
  details: () => [...enquiryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...enquiryQueryKeys.details(), id] as const,
} as const;

export interface EnquiryListFilters {
  pageNumber?: number;
  pageSize?: number;
  subject?: string;
  status?: number;
}

export type CreateEnquiryInput = Pick<EnquiryInput, 'subject' | 'message'>;

export type UpdateEnquiryStatusInput = {
  enquiryId: string;
  status: number;
};

export type ReplyEnquiryInput = {
  enquiryId: string;
  message: string;
};

const invalidateEnquiryQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({
    queryKey: enquiryQueryKeys.lists(),
  });
};

// Query Hooks
export const useEnquiryList = (filters: EnquiryListFilters) => {
  return useQuery({
    queryKey: enquiryQueryKeys.list(filters),
    queryFn: async () => {
      const response = await getAllEnquiry(filters);
      return response as PagedResponse<Enquiry[]>;
    },
    enabled: true,
    throwOnError: true,
  });
};

export const useEnquiryDetail = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: enquiryQueryKeys.detail(id ?? ''),
    queryFn: async () => {
      try {
        const response = await getEnquiryById(id!);
        return response.data as EnquiryDetails;
      } catch (error) {
        if (error instanceof Error) {
          message.error(error.message || 'Failed to fetch enquiry details');
        } else {
          message.error('Failed to fetch enquiry details');
        }
        throw error;
      }
    },
    enabled: enabled && Boolean(id),
    throwOnError: false,
  });
};

// Mutation Hooks
export const useCreateEnquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEnquiryInput) => {
      const response = await createEnquiry({
        subject: data.subject,
        message: data.message,
      });
      return response;
    },
    onSuccess: async () => {
      message.success('Enquiry created successfully');
      await invalidateEnquiryQueries(queryClient);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create enquiry');
    },
    throwOnError: true,
  });
};

export const useUpdateEnquiryStatus = () => {
  const queryClient = useQueryClient();
  const refreshBadges = useBadgeRefresh();

  return useMutation({
    mutationFn: async (data: UpdateEnquiryStatusInput) => {
      const response = await updateEnquiryStatus(data);
      return response;
    },
    onSuccess: async () => {
      message.success('Enquiry status updated');
      await invalidateEnquiryQueries(queryClient);
      // Refresh badge immediately after enquiry status update
      await refreshBadges(['/enquiry']);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update enquiry status');
    },
    throwOnError: true,
  });
};

export const useReplyEnquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReplyEnquiryInput) => {
      const response = await replyEnquiry(data);
      return response;
    },
    onSuccess: async (_, variables) => {
      message.success('Reply sent successfully');
      await Promise.all([
        invalidateEnquiryQueries(queryClient),
        queryClient.invalidateQueries({
          queryKey: enquiryQueryKeys.detail(variables.enquiryId),
        }),
      ]);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to reply, please try again');
    },
    throwOnError: true,
  });
};

export const useDeleteEnquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteEnquiry(id);
      return response;
    },
    onSuccess: async () => {
      message.success('Enquiry deleted successfully');
      await invalidateEnquiryQueries(queryClient);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete enquiry');
    },
    throwOnError: true,
  });
};
