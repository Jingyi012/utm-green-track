import { RequestStatus, WasteRecordStatus, wasteRecordStatusLabels } from '@/lib/enum/status';
import { ChangeRequest } from '@/lib/types/typing';

export type StatusBadgeTone = 'default' | 'processing' | 'success' | 'warning' | 'error';

export type RequestFlowSummary = {
  label: string;
  description: string;
  tone: StatusBadgeTone;
};

export const getWasteRecordStatusMeta = (status?: number | null) => {
  if (status === undefined || status === null) {
    return null;
  }

  const typedStatus = status as WasteRecordStatus;
  const toneMap: Record<WasteRecordStatus, StatusBadgeTone> = {
    [WasteRecordStatus.New]: 'default',
    [WasteRecordStatus.Verified]: 'success',
    [WasteRecordStatus.Rejected]: 'error',
    [WasteRecordStatus.RevisionRequired]: 'warning',
  };

  return {
    label: wasteRecordStatusLabels[typedStatus],
    tone: toneMap[typedStatus],
  };
};

export const getRequestFlowSummary = (request: ChangeRequest): RequestFlowSummary => {
  if (request.status === RequestStatus.Pending) {
    return {
      label: 'Awaiting Review',
      description: 'Admin needs to review this request before the related record changes.',
      tone: 'processing',
    };
  }

  if (request.status === RequestStatus.Rejected) {
    return {
      label: 'Request Rejected',
      description: 'No record changes were applied. The current waste record remains unchanged.',
      tone: 'error',
    };
  }

  const wasteRecordStatus = request.wasteRecord?.status as WasteRecordStatus | undefined;

  if (wasteRecordStatus === WasteRecordStatus.RevisionRequired) {
    return {
      label: 'Action Needed',
      description: 'Approved request. Update the linked waste record and submit it again.',
      tone: 'warning',
    };
  }

  if (wasteRecordStatus === WasteRecordStatus.New) {
    return {
      label: 'Resubmitted',
      description: 'The requester updated the record and it is waiting for waste-record approval.',
      tone: 'success',
    };
  }

  if (wasteRecordStatus === WasteRecordStatus.Verified) {
    return {
      label: 'Resolved',
      description: 'The linked record has already been updated and verified.',
      tone: 'success',
    };
  }

  return {
    label: 'Approved',
    description: 'Open the linked record to continue the revision flow.',
    tone: 'success',
  };
};
