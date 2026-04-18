import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getAllWasteType,
  createWasteType,
  updateWasteType,
  deleteWasteType,
} from '@/lib/services/wasteType';
import { getAllConfig, updateConfig } from '@/lib/services/config';
import {
  Config,
  CreateWasteType,
  Department,
  WasteType,
  WasteTypeWithEmissionFactor,
} from '@/lib/types/typing';
import { disposalMethodQueryKeys } from '@/hook/disposalMethods';

// ============= WASTE TYPE QUERY KEYS =============
export const wasteTypeQueryKeys = {
  all: ['wasteTypes'] as const,
  lists: () => [...wasteTypeQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...wasteTypeQueryKeys.lists(), { ...filters }] as const,
  detail: (id: string) => [...wasteTypeQueryKeys.all, 'detail', id] as const,
} as const;

// ============= GENERAL CONFIG QUERY KEYS =============
export const configQueryKeys = {
  all: ['config'] as const,
  lists: () => [...configQueryKeys.all, 'list'] as const,
  list: (filters?: { prefix?: string; year?: number }) =>
    [...configQueryKeys.lists(), { ...filters }] as const,
} as const;

// ============= MUTATION INPUT TYPES =============
export type CreateWasteTypeInput = Omit<CreateWasteType, 'id'>;

export type UpdateWasteTypeInput = {
  id: string;
  name: string;
  emissionFactor: number;
};

export type UpdateConfigInput = {
  key: string;
  value: string;
};

// ============= SHARED HELPERS =============
async function invalidateWasteTypeRelatedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: wasteTypeQueryKeys.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: disposalMethodQueryKeys.lists(),
    }),
  ]);
}

// ============= WASTE TYPE QUERY HOOKS =============
export const useWasteTypeList = () => {
  return useQuery({
    queryKey: wasteTypeQueryKeys.lists(),
    queryFn: async () => {
      const response = await getAllWasteType();
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    throwOnError: true,
  });
};

// ============= GENERAL CONFIG QUERY HOOKS =============
export const useConfigList = (filters?: { prefix?: string; year?: number }) => {
  return useQuery({
    queryKey: configQueryKeys.list(filters),
    queryFn: async () => {
      const response = await getAllConfig(filters);
      return response.data as Config[];
    },
    staleTime: 1000 * 60 * 10,
    throwOnError: true,
  });
};

// ============= WASTE TYPE MUTATION HOOKS =============
export const useCreateWasteType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWasteTypeInput) => {
      return await createWasteType(data);
    },
    onSuccess: async () => {
      message.success('Waste type created successfully');
      await invalidateWasteTypeRelatedQueries(queryClient);
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to create waste type');
    },
    throwOnError: true,
  });
};

export const useUpdateWasteType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, emissionFactor }: UpdateWasteTypeInput) => {
      return await updateWasteType(id, { id, name, emissionFactor });
    },
    onSuccess: async () => {
      message.success('Waste type updated successfully');
      await invalidateWasteTypeRelatedQueries(queryClient);
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to update waste type');
    },
    throwOnError: true,
  });
};

export const useDeleteWasteType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteWasteType(id);
    },
    onSuccess: async () => {
      message.success('Waste type deleted successfully');
      await invalidateWasteTypeRelatedQueries(queryClient);
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to delete waste type');
    },
    throwOnError: true,
  });
};

// ============= GENERAL CONFIG MUTATION HOOKS =============
export const useUpdateConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateConfigInput) => {
      return await updateConfig(data);
    },
    onSuccess: async () => {
      message.success('Configuration updated successfully');
      await queryClient.invalidateQueries({
        queryKey: configQueryKeys.lists(),
      });
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to update configuration');
    },
    throwOnError: true,
  });
};
