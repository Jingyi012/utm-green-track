import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getAllUsers, updateUserApprovalStatus, deleteUser, updateUser } from '@/lib/services/user';
import { UserDetails } from '@/lib/types/typing';
import { PagedResponse } from '@/lib/types/apiResponse';
import { userStatusLabels } from '@/lib/enum/status';

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

export type UpdateUserApprovalStatusInput = {
  userIds: string[];
  status?: number;
  rejectedReason?: string;
};

export type UpdateUserInput = {
  userId: string;
  name?: string;
  email?: string;
  contactNumber?: string;
  staffMatricNo?: string;
  departmentId?: string;
  positionId?: string;
  roleIds?: string[];
  status?: number;
};

const invalidateUserQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({
    queryKey: userQueryKeys.lists(),
  });
};

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
    mutationFn: async (data: UpdateUserApprovalStatusInput) => {
      const response = await updateUserApprovalStatus(data);
      return response;
    },
    onSuccess: async (_, variables) => {
      message.success(`User status updated to ${userStatusLabels[variables.status ?? 0]}`);
      await invalidateUserQueries(queryClient);
    },
    onError: (_, variables) => {
      message.error(`Failed to update status to ${userStatusLabels[variables.status ?? 0]}`);
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
    onSuccess: async () => {
      message.success('User deleted successfully');
      await invalidateUserQueries(queryClient);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete user');
    },
    throwOnError: true,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const response = await updateUser(data);
      return response;
    },
    onSuccess: async () => {
      message.success('User updated successfully');
      await invalidateUserQueries(queryClient);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update user');
    },
    throwOnError: true,
  });
};
