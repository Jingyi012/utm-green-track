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
  exportExcelWasteRecords,
  exportPdfWasteRecords,
} from '@/lib/services/wasteRecord';
import { WasteRecord, WasteRecordFilter } from '@/lib/types/wasteRecord';
import { PagedResponse } from '@/lib/types/apiResponse';
import { UploadFile } from 'antd';
import { WasteRecordStatus } from '@/lib/enum/status';
import { downloadFile } from '@/lib/utils/downloadFile';

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

export type UpdateWasteRecordInput = {
  id: string;
  campusId?: string;
  departmentId?: string;
  disposalMethodId?: string;
  wasteTypeId?: string;
  location?: string;
  unit?: string;
  program?: string;
  programDate?: string;
  wasteWeight?: number;
  status?: number;
  date?: string;
  comment?: string;
};

export type SaveWasteRecordInput = UpdateWasteRecordInput & {
  uploadedAttachments?: UploadFile[];
  originalAttachmentIds?: string[];
  isAdmin?: boolean;
};

export type DeleteWasteRecordInput = {
  id: string;
};

export type UploadAttachmentsInput = {
  fileList: UploadFile[];
  wasteRecordId: string;
};

export type DeleteAttachmentInput = {
  id: string;
  wasteRecordId: string;
};

export type ExportWasteRecordInput = {
  year: number;
  month: number;
};

const invalidateWasteRecordListQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await queryClient.invalidateQueries({
    queryKey: wasteRecordQueryKeys.lists(),
  });
};

const invalidateWasteRecordDetailQuery = async (
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) => {
  await queryClient.invalidateQueries({
    queryKey: wasteRecordQueryKeys.detail(id),
  });
};

const extractAttachmentChanges = (
  uploadedAttachments: UploadFile[] = [],
  originalAttachmentIds: string[] = [],
) => {
  const newAttachments = uploadedAttachments.filter((file) => Boolean(file.originFileObj));
  const currentAttachmentIds = uploadedAttachments
    .filter((file) => !file.originFileObj)
    .map((file) => file.uid);
  const attachmentIdsToDelete = originalAttachmentIds.filter(
    (id) => !currentAttachmentIds.includes(id),
  );

  return {
    newAttachments,
    attachmentIdsToDelete,
  };
};

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
    mutationFn: async ({ id, ...updatedData }: UpdateWasteRecordInput) => {
      const response = await updateWasteRecord(id, { id, ...updatedData });
      return response;
    },
    onSuccess: async (_, variables) => {
      message.success('Waste record updated successfully');
      await Promise.all([
        invalidateWasteRecordListQueries(queryClient),
        invalidateWasteRecordDetailQuery(queryClient, variables.id),
      ]);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update waste record');
    },
    throwOnError: true,
  });
};

export const useDeleteWasteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteWasteRecordInput) => {
      const response = await deleteWasteRecord(id);
      return response;
    },
    onSuccess: async () => {
      message.success('Waste record deleted successfully');
      await invalidateWasteRecordListQueries(queryClient);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete waste record');
    },
    throwOnError: true,
  });
};

export const useUploadAttachments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileList, wasteRecordId }: UploadAttachmentsInput) => {
      const response = await uploadAttachments(fileList, wasteRecordId);
      return response;
    },
    onSuccess: async (_, variables) => {
      message.success('Attachments uploaded successfully');
      await invalidateWasteRecordDetailQuery(queryClient, variables.wasteRecordId);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to upload attachments');
    },
    throwOnError: true,
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteAttachmentInput) => {
      const response = await deleteAttachment(id);
      return response;
    },
    onSuccess: async (_, variables) => {
      message.success('Attachment deleted successfully');
      await Promise.all([
        invalidateWasteRecordListQueries(queryClient),
        invalidateWasteRecordDetailQuery(queryClient, variables.wasteRecordId),
      ]);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete attachment');
    },
    throwOnError: true,
  });
};

export const useSaveWasteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uploadedAttachments = [],
      originalAttachmentIds = [],
      isAdmin = true,
      id,
      ...updatedData
    }: SaveWasteRecordInput) => {
      const { newAttachments, attachmentIdsToDelete } = extractAttachmentChanges(
        uploadedAttachments,
        originalAttachmentIds,
      );
      const normalizedPayload = isAdmin
        ? updatedData
        : { ...updatedData, status: WasteRecordStatus.New };

      await updateWasteRecord(id, { id, ...normalizedPayload });

      if (newAttachments.length > 0) {
        await uploadAttachments(newAttachments, id);
      }

      if (attachmentIdsToDelete.length > 0) {
        await Promise.all(attachmentIdsToDelete.map((attachmentId) => deleteAttachment(attachmentId)));
      }

      return { id };
    },
    onSuccess: async (_, variables) => {
      message.success('Waste record updated successfully');
      await Promise.all([
        invalidateWasteRecordListQueries(queryClient),
        invalidateWasteRecordDetailQuery(queryClient, variables.id),
      ]);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update waste record');
    },
    throwOnError: true,
  });
};

const useExportWasteRecords = (format: 'excel' | 'pdf') => {
  return useMutation({
    mutationFn: async ({ year, month }: ExportWasteRecordInput) => {
      const hide = message.loading(
        format === 'excel' ? 'Generating Excel...' : 'Generating Pdf...',
        0,
      );

      try {
        const response =
          format === 'excel'
            ? await exportExcelWasteRecords({ year, month })
            : await exportPdfWasteRecords({ year, month });
        const contentDisposition = response.headers['content-disposition'];

        downloadFile(
          response.data,
          contentDisposition,
          format === 'excel' ? 'Waste_Records.xlsx' : 'Waste_Records.pdf',
        );
      } finally {
        hide();
      }
    },
    onError: () => {
      message.error(
        format === 'excel' ? 'Failed to generate Excel' : 'Failed to generate PDF',
      );
    },
    throwOnError: true,
  });
};

export const useExportWasteRecordExcel = () => useExportWasteRecords('excel');

export const useExportWasteRecordPdf = () => useExportWasteRecords('pdf');
