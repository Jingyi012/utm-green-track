import { Dayjs } from 'dayjs';
import { UploadFile } from 'antd';

type DateFieldValue = string | Date | Dayjs;

export type WasteItemFormValue = {
  wastePairKey: string;
  wasteWeight: number;
  attachments?: UploadFile[];
};

export type WasteEntryFormValues = {
  date?: DateFieldValue;
  campusId: string;
  departmentId: string;
  unit?: string;
  location: string;
  program?: string;
  programDate?: DateFieldValue;
  wasteItems: WasteItemFormValue[];
};

export type WastePairMeta = {
  disposalMethodId: string;
  wasteTypeId: string;
};
