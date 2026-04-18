import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getAllUsers, updateUserApprovalStatus, deleteUser, updateUser } from '@/lib/services/user';
import { UserDetails } from '@/lib/types/typing';
import { PagedResponse } from '@/lib/types/apiResponse';

// Query Keys
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters: UserListFilters) => [...userQueryKeys.lists(), { ...filters }] as const,
} as const;

export interface UserListFilters {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  contactNumber?: string;
  positionId?: string;
  departmentId?: string;
  status?: number;
}

// Query Hooks
export const useUserList = (filters: UserListFilters) => {
  return useQuery({
    queryKey: userQueryKeys.list(filters),
    queryFn: async () => {
      const response = await getAllUsers(filters);
      return response as PagedResponse<UserDetails[]>;
    },
    throwOnError: true,
  });
};

// Mutation Hooks
export const useUpdateUserApprovalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userIds: string[]; status?: number; rejectedReason?: string }) => {
      const response = await updateUserApprovalStatus(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteUser(id);
      return response;
    },
    onSuccess: () => {
      message.success('User deleted successfully');
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; updatedData: any }) => {
      const response = await updateUser(data.updatedData);
      return response;
    },
    onSuccess: () => {
      message.success('User updated successfully');
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};
