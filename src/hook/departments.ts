import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getAllDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/lib/services/department';
import { Department } from '@/lib/types/typing';

// Query Keys
export const departmentQueryKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentQueryKeys.all, 'list'] as const,
} as const;

// Types
export type CreateDepartmentInput = {
  name: string;
};

export type UpdateDepartmentInput = {
  id: string;
  name: string;
};

// Query Hooks
export const useDepartmentList = () => {
  return useQuery({
    queryKey: departmentQueryKeys.lists(),
    queryFn: async () => {
      const response = await getAllDepartment();
      return response.data as Department[];
    },
    staleTime: 1000 * 60 * 10,
    throwOnError: true,
  });
};

// Mutation Hooks
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepartmentInput) => {
      return await createDepartment(data);
    },
    onSuccess: async () => {
      message.success('Department created successfully');
      await queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.lists(),
      });
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to create department');
    },
    throwOnError: true,
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: UpdateDepartmentInput) => {
      return await updateDepartment(id, { id, name });
    },
    onSuccess: async () => {
      message.success('Department updated successfully');
      await queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteDepartment(id);
    },
    onSuccess: async () => {
      message.success('Department deleted successfully');
      await queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};
