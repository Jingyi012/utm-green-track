import { Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';

const MAX_ATTACHMENT_SIZE_MB = 5;
const ALLOWED_ATTACHMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const ALLOWED_ATTACHMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export const ATTACHMENT_ACCEPT_ATTRIBUTE = '.pdf,.jpg,.jpeg,.png';
export const ATTACHMENT_ACCEPT_LABEL = 'Accepted file types: PDF, JPG, PNG (max 5MB each)';

const isAllowedAttachmentType = (file: RcFile): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const normalizedMimeType = file.type.toLowerCase();

  return (
    ALLOWED_ATTACHMENT_EXTENSIONS.includes(fileExtension) ||
    ALLOWED_ATTACHMENT_MIME_TYPES.includes(normalizedMimeType)
  );
};

export const validateAttachmentBeforeUpload = (
  file: RcFile,
  onError: (message: string) => void,
) => {
  if (!isAllowedAttachmentType(file)) {
    onError('Only PDF, JPG, and PNG files are allowed.');
    return Upload.LIST_IGNORE;
  }

  const isWithinSizeLimit = file.size / 1024 / 1024 < MAX_ATTACHMENT_SIZE_MB;
  if (!isWithinSizeLimit) {
    onError(`File must be smaller than ${MAX_ATTACHMENT_SIZE_MB}MB.`);
    return Upload.LIST_IGNORE;
  }

  return false;
};
