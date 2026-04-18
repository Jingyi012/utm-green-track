import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getWasteRecordsPaginated,
  getWasteRecordById,
  updateWasteRecord,
  deleteWasteRecord,
  uploadAttachments,
  deleteAttachment,
  getWasteStatisticByYear,
  getCampusYearlySummary,
  getYearlyDataAnalytics,
  getLifetimeDataAnalytics,
} from '@/lib/services/wasteRecord';
import { WasteRecord, WasteRecordFilter } from '@/lib/types/wasteRecord';
import { PagedResponse } from '@/lib/types/apiResponse';
import { UploadFile } from 'antd';

// Query Keys
export const wasteRecordQueryKeys = {
  all: ['wasteRecords'] as const,
  lists: () => [...wasteRecordQueryKeys.all, 'list'] as const,
  list: (filters: WasteRecordFilter) => [...wasteRecordQueryKeys.lists(), { ...filters }] as const,
  details: () => [...wasteRecordQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...wasteRecordQueryKeys.details(), id] as const,
  statistics: () => [...wasteRecordQueryKeys.all, 'statistics'] as const,
  statistic: (year: number, campusId?: string, departmentId?: string) =>
    [...wasteRecordQueryKeys.statistics(), { year, campusId, departmentId }] as const,
  yearlySummary: (campusId: string, year: number) =>
    [...wasteRecordQueryKeys.all, 'yearly-summary', { campusId, year }] as const,
  yearlyAnalytics: (year: number, campusId: string) =>
    [...wasteRecordQueryKeys.all, 'yearly-analytics', { year, campusId }] as const,
  lifetimeAnalytics: (campusId: string) =>
    [...wasteRecordQueryKeys.all, 'lifetime-analytics', campusId] as const,
} as const;

// Query Hooks
export const useWasteRecordList = (filters: WasteRecordFilter) => {
  return useQuery({
    queryKey: wasteRecordQueryKeys.list(filters),
    queryFn: async () => {
      const response = await getWasteRecordsPaginated(filters);
      return response as PagedResponse<WasteRecord[]>;
    },
    throwOnError: true,
  });
};

export const useWasteRecordDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: wasteRecordQueryKeys.detail(id),
    queryFn: async () => {
      const response = await getWasteRecordById(id);
      return response.data;
    },
    enabled,
    throwOnError: true,
  });
};

export const useWasteStatistics = (
  year: number,
  campusId?: string,
  departmentId?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: wasteRecordQueryKeys.statistic(year, campusId, departmentId),
    queryFn: async () => {
      const response = await getWasteStatisticByYear({
        year,
        campusId,
        departmentId,
      });
      return response.data;
    },
    enabled,
    throwOnError: true,
  });
};

export const useYearlySummary = (campusId: string, year: number, enabled = true) => {
  return useQuery({
    queryKey: wasteRecordQueryKeys.yearlySummary(campusId, year),
    queryFn: async () => {
      const response = await getCampusYearlySummary(campusId, year);
      return response.data;
    },
    enabled,
    throwOnError: true,
  });
};

export const useYearlyAnalytics = (year: number, campusId: string, enabled = true) => {
  return useQuery({
    queryKey: wasteRecordQueryKeys.yearlyAnalytics(year, campusId),
    queryFn: async () => {
      const response = await getYearlyDataAnalytics({ year, campusId });
      return response.data;
    },
    enabled,
    throwOnError: true,
  });
};

export const useLifetimeAnalytics = (campusId: string, enabled = true) => {
  return useQuery({
    queryKey: wasteRecordQueryKeys.lifetimeAnalytics(campusId),
    queryFn: async () => {
      const response = await getLifetimeDataAnalytics({ campusId });
      return response.data;
    },
    enabled,
    throwOnError: true,
  });
};

// Mutation Hooks
export const useUpdateWasteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; updatedData: any }) => {
      const response = await updateWasteRecord(data.id, data.updatedData);
      return response;
    },
    onSuccess: (_, variables) => {
      message.success('Waste record updated successfully');
      queryClient.invalidateQueries({
        queryKey: wasteRecordQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: wasteRecordQueryKeys.detail(variables.id),
      });
    },
    throwOnError: true,
  });
};

export const useDeleteWasteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteWasteRecord(id);
      return response;
    },
    onSuccess: () => {
      message.success('Waste record deleted successfully');
      queryClient.invalidateQueries({
        queryKey: wasteRecordQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};

export const useUploadAttachments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { fileList: UploadFile[]; wasteRecordId: string }) => {
      const response = await uploadAttachments(data.fileList, data.wasteRecordId);
      return response;
    },
    onSuccess: (_, variables) => {
      message.success('Attachments uploaded successfully');
      queryClient.invalidateQueries({
        queryKey: wasteRecordQueryKeys.detail(variables.wasteRecordId),
      });
    },
    throwOnError: true,
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteAttachment(id);
      return response;
    },
    onSuccess: () => {
      message.success('Attachment deleted successfully');
      queryClient.invalidateQueries({
        queryKey: wasteRecordQueryKeys.lists(),
      });
    },
    throwOnError: true,
  });
};
