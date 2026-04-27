import { Modal, Button, Upload, App, Col, Row, Typography, UploadFile } from 'antd';
import {
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { UploadOutlined } from '@ant-design/icons';
import { WasteTypeWithEmissionFactor } from '@/lib/types/typing';
import { useState, useEffect } from 'react';
import { WasteRecordDraftInput } from '@/lib/types/wasteRecord';
import {
  ATTACHMENT_ACCEPT_ATTRIBUTE,
  ATTACHMENT_ACCEPT_LABEL,
  validateAttachmentBeforeUpload,
} from '@/lib/utils/attachmentValidation';
import { toDateOnlyString, toPickerDateValue } from '@/lib/utils/dateField';
import { sanitizeUploadFileList } from '@/lib/utils/uploadFiles';

const { Title } = Typography;

type FormValues = Omit<Partial<WasteRecordDraftInput>, 'date' | 'programDate'> & {
  date?: unknown;
  programDate?: unknown;
  attachments?: UploadFile[];
};

type Props = {
  open: boolean;
  record: WasteRecordDraftInput | null;
  campuses: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  disposalMethods: {
    id: string;
    name: string;
    wasteTypes: WasteTypeWithEmissionFactor[];
  }[];
  onClose: () => void;
  onSave: (values: Partial<WasteRecordDraftInput>, recordKey: string) => void;
};

export default function EditformModal({
  open,
  record,
  campuses,
  departments,
  disposalMethods,
  onClose,
  onSave,
}: Props) {
  const { message } = App.useApp();
  const [form] = ProForm.useForm<FormValues>();
  const [selectedDisposalMethod, setSelectedDisposalMethod] = useState<string>();
  const [wasteTypes, setWasteTypes] = useState<WasteTypeWithEmissionFactor[]>([]);

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        date: toPickerDateValue(record.date),
        programDate: toPickerDateValue(record.programDate),
      });
      const method = disposalMethods.find((item) => item.id === record.disposalMethodId);
      setWasteTypes(method?.wasteTypes ?? []);
      setSelectedDisposalMethod(record.disposalMethodId);
    }
  }, [record, disposalMethods, form]);

  const handleDisposalMethodChange = (value: string): void => {
    setSelectedDisposalMethod(value);
    const selectedMethod = disposalMethods.find((method) => method.id === value);
    form.resetFields(['wasteTypeId']);
    setWasteTypes(selectedMethod?.wasteTypes ?? []);
  };

  const handleFinish = async (values: FormValues): Promise<void> => {
    if (!record) {
      return;
    }

    onSave(
      {
        ...values,
        date: toDateOnlyString(values.date) ?? record.date,
        programDate: toDateOnlyString(values.programDate) ?? record.programDate,
        attachments: sanitizeUploadFileList(values.attachments),
      },
      record.key,
    );
    onClose();
  };

  return (
    <Modal
      title="Edit Waste Record"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <ProForm<FormValues> form={form} layout="vertical" submitter={false} onFinish={handleFinish}>
        <Title level={5}>Basic Information</Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormDatePicker
              name="date"
              label="Record Date"
              placeholder="Please select record date"
              rules={[{ required: true, message: 'Please select record date' }]}
              fieldProps={{
                format: 'DD/MM/YYYY',
                allowClear: false,
                style: { width: '100%' },
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormSelect
              name="campusId"
              label="UTM Campus"
              placeholder="Please select campus"
              rules={[{ required: true, message: 'Please select a campus' }]}
              options={campuses.map((campus) => ({
                label: campus.name,
                value: campus.id,
              }))}
              fieldProps={{
                showSearch: true,
                optionFilterProp: 'label',
              }}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormSelect
              name="departmentId"
              label="Faculty / Department / College / PTJ"
              placeholder="Select faculty / department / college / PTJ"
              options={departments.map((department) => ({
                label: department.name,
                value: department.id,
              }))}
              rules={[
                { required: true, message: 'Please select faculty / department / college / PTJ' },
              ]}
              showSearch
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormText name="unit" label="Unit" placeholder="Please enter unit" />
          </Col>
          <Col xs={24} md={12}>
            <ProFormText
              name="location"
              label="Location"
              placeholder="Please enter location"
              rules={[{ required: true, message: 'Please enter location' }]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormText
              name="program"
              label="Name of Program / Initiative (if any)"
              placeholder="Please enter program / initiative name"
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormDatePicker
              name="programDate"
              label="Date of Program / Initiative"
              placeholder="Please enter date of program / initiative"
              fieldProps={{
                format: 'DD/MM/YYYY',
                style: { width: '100%' },
              }}
            />
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 12 }}>
          Waste Information
        </Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormSelect
              name="disposalMethodId"
              label="Disposal Method"
              placeholder="Please select disposal method"
              rules={[{ required: true, message: 'Please select disposal method' }]}
              options={disposalMethods.map((method) => ({
                label: method.name,
                value: method.id,
              }))}
              fieldProps={{
                onChange: handleDisposalMethodChange,
                showSearch: true,
                optionFilterProp: 'label',
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormSelect
              name="wasteTypeId"
              label="Waste Type"
              placeholder="Please select waste type"
              rules={[{ required: true, message: 'Please select waste type' }]}
              options={wasteTypes.map((wasteType) => ({
                label: wasteType.name,
                value: wasteType.id,
              }))}
              fieldProps={{
                disabled: !selectedDisposalMethod,
                showSearch: true,
                optionFilterProp: 'label',
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormDigit
              name="wasteWeight"
              label="Waste Weight (kg)"
              placeholder="Please enter waste weight"
              rules={[{ required: true, message: 'Please enter waste weight' }]}
              fieldProps={{
                min: 0,
                step: 0.1,
                precision: 2,
              }}
              min={0}
            />
          </Col>
          <Col xs={24} md={12}>
            <ProForm.Item
              name="attachments"
              label="Attachment (Optional)"
              extra={ATTACHMENT_ACCEPT_LABEL}
              valuePropName="fileList"
              getValueFromEvent={(event: { fileList: UploadFile[] } | UploadFile[]) => {
                return sanitizeUploadFileList(
                  Array.isArray(event) ? event : (event?.fileList ?? []),
                );
              }}
            >
              <Upload
                accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
                beforeUpload={(file) => validateAttachmentBeforeUpload(file, message.error)}
                multiple
              >
                <Button icon={<UploadOutlined />}>Click to upload files</Button>
              </Upload>
            </ProForm.Item>
          </Col>
        </Row>

        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()}>
            Save Changes
          </Button>
        </div>
      </ProForm>
    </Modal>
  );
}
