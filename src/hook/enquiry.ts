import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  createEnquiry,
  deleteEnquiry,
  getAllEnquiry,
  updateEnquiryStatus,
} from '@/lib/services/enquiry';
import { Enquiry, EnquiryInput } from '@/lib/types/typing';
import { PagedResponse } from '@/lib/types/apiResponse';

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

// Mutation Hooks
export const useCreateEnquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EnquiryInput) => {
      const response = await createEnquiry({
        subject: data.subject,
        message: data.message,
      });
      return response;
    },
    onSuccess: () => {
      message.success('Enquiry created successfully');
      queryClient.invalidateQueries({
        queryKey: enquiryQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};

export const useUpdateEnquiryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { enquiryId: string; status: number }) => {
      const response = await updateEnquiryStatus(data);
      return response;
    },
    onSuccess: () => {
      message.success('Enquiry status updated');
      queryClient.invalidateQueries({
        queryKey: enquiryQueryKeys.lists(),
      });
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
    onSuccess: () => {
      message.success('Enquiry deleted successfully');
      queryClient.invalidateQueries({
        queryKey: enquiryQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};
