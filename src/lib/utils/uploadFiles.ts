import { UploadFile } from 'antd';

export const sanitizeUploadFileList = (files?: UploadFile[]): UploadFile[] => {
  if (!files?.length) {
    return [];
  }

  return files.map((file) => ({
    uid: file.uid,
    name: file.name,
    status: file.status,
    type: file.type,
    size: file.size,
    url: file.url,
    thumbUrl: file.thumbUrl,
    originFileObj: file.originFileObj,
  }));
};
