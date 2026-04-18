import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getAllDisposalMethod,
  createDisposalMethod,
  updateDisposalMethod,
  deleteDisposalMethod,
} from '@/lib/services/disposalMethod';
import { DisposalMethodWithWasteType } from '@/lib/types/typing';

// Query Keys
export const disposalMethodQueryKeys = {
  all: ['disposalMethods'] as const,
  lists: () => [...disposalMethodQueryKeys.all, 'list'] as const,
} as const;

// Query Hooks
export const useDisposalMethodList = () => {
  return useQuery({
    queryKey: disposalMethodQueryKeys.lists(),
    queryFn: async () => {
      const response = await getAllDisposalMethod();
      return response.data as DisposalMethodWithWasteType[];
    },
    staleTime: 1000 * 60 * 10,
    throwOnError: true,
  });
};

// Mutation Hooks
export const useCreateDisposalMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await createDisposalMethod(data);
      return response;
    },
    onSuccess: () => {
      message.success('Disposal method created successfully');
      queryClient.invalidateQueries({
        queryKey: disposalMethodQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};

export const useUpdateDisposalMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await updateDisposalMethod(data.id, data);
      return response;
    },
    onSuccess: () => {
      message.success('Disposal method updated successfully');
      queryClient.invalidateQueries({
        queryKey: disposalMethodQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};

export const useDeleteDisposalMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteDisposalMethod(id);
      return response;
    },
    onSuccess: () => {
      message.success('Disposal method deleted successfully');
      queryClient.invalidateQueries({
        queryKey: disposalMethodQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};
