import { Col, Row, Form, Button, Upload, Typography, App } from 'antd';
import {
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProForm,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Campus,
  Department,
  DisposalMethodWithWasteType,
  WasteTypeWithEmissionFactor,
} from '@/lib/types/typing';
import { WasteRecordStatus, wasteRecordStatusLabels } from '@/lib/enum/status';
import { UploadOutlined } from '@ant-design/icons';
import { WasteRecord } from '@/lib/types/wasteRecord';
import { useAuth } from '@/contexts/AuthContext';
import {
  ATTACHMENT_ACCEPT_ATTRIBUTE,
  ATTACHMENT_ACCEPT_LABEL,
  validateAttachmentBeforeUpload,
} from '@/lib/utils/attachmentValidation';
import { toDateOnlyString, toPickerDateValue } from '@/lib/utils/dateField';
import { sanitizeUploadFileList } from '@/lib/utils/uploadFiles';

const { Title } = Typography;
export type FormValueType = Partial<WasteRecord>;

export type UpdateFormDrawerProps = {
  campuses: Campus[];
  departments: Department[];
  disposalMethods: DisposalMethodWithWasteType[];
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<boolean>;
  visible: boolean;
  initialValues: Partial<WasteRecord>;
  isEditMode?: boolean;
};

const WasteRecordForm: React.FC<UpdateFormDrawerProps> = ({
  campuses,
  departments,
  disposalMethods,
  onCancel,
  onSubmit,
  visible,
  initialValues,
  isEditMode = false,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { isAdmin } = useAuth();
  const [selectedDisposalMethod, setSelectedDisposalMethod] = useState<string>();
  const [wasteTypes, setWasteTypes] = useState<WasteTypeWithEmissionFactor[]>([]);

  const normalizedInitialValues = useMemo(
    () => ({
      ...initialValues,
      date: toPickerDateValue(initialValues?.date),
      programDate: toPickerDateValue(initialValues?.programDate),
    }),
    [initialValues],
  );

  const handleDisposalMethodChange = (value: string) => {
    setSelectedDisposalMethod(value);
    form.setFieldValue('wasteTypeId', null);
    const selectedMethod = disposalMethods.find((dm) => dm.id === value);
    setWasteTypes(selectedMethod?.wasteTypes ?? []);
  };

  useEffect(() => {
    if (initialValues?.disposalMethodId) {
      const selectedMethod = disposalMethods.find((dm) => dm.id === initialValues.disposalMethodId);
      setWasteTypes(selectedMethod?.wasteTypes ?? []);
      setSelectedDisposalMethod(initialValues.disposalMethodId);
    } else {
      setWasteTypes([]);
      setSelectedDisposalMethod(undefined);
    }
  }, [initialValues?.disposalMethodId, disposalMethods]);

  useEffect(() => {
    if (initialValues?.attachments) {
      const formattedFileList = initialValues.attachments.map((a) => ({
        uid: a.id,
        name: a.fileName,
        status: 'done',
        url: a.filePath,
      }));

      form.setFieldValue('uploadedAttachments', formattedFileList);
    }
  }, [initialValues, form]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(normalizedInitialValues);
    }
  }, [visible, form, normalizedInitialValues]);

  const watchStatus = Form.useWatch('status', form);

  if (!visible) {
    return null;
  }

  return (
    <ProForm<FormValueType>
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        const payload: FormValueType = {
          ...values,
          date: toDateOnlyString(values.date),
          programDate: toDateOnlyString(values.programDate),
          uploadedAttachments: sanitizeUploadFileList(values.uploadedAttachments),
        };

        const success = await onSubmit(payload);
        if (success) {
          onCancel();
        }
      }}
      submitter={
        isEditMode
          ? {
              searchConfig: {
                submitText: 'Submit',
                resetText: 'Cancel',
              },
              resetButtonProps: {
                onClick: (event) => {
                  event.preventDefault();
                  onCancel();
                },
              },
            }
          : false
      }
      initialValues={normalizedInitialValues}
    >
      <ProCard title="Waste Record Details" bordered collapsible>
        <Title level={5}>Basic Information</Title>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormDatePicker
              name="date"
              label="Date"
              placeholder="Please select record date"
              rules={[{ required: true, message: 'Please select record date' }]}
              disabled={!isEditMode}
              fieldProps={{
                allowClear: false,
                format: 'DD/MM/YYYY',
                style: { width: '100%' },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name={'campusId'}
              label="UTM Campus"
              placeholder="Please select campus"
              rules={[{ required: true, message: 'Please select campus' }]}
              options={campuses.map((r) => ({
                label: r.name,
                value: r.id,
              }))}
              disabled={!isEditMode}
              fieldProps={{
                showSearch: true,
                optionFilterProp: 'label',
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormSelect
              name="departmentId"
              label="Faculty / Department / College / PTJ"
              placeholder="Select faculty / department / college / PTJ"
              options={departments.map((dept) => ({
                label: dept.name,
                value: dept.id,
              }))}
              rules={[
                { required: true, message: 'Please select faculty / department / college / PTJ' },
              ]}
              disabled={!isEditMode}
              showSearch
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormText
              name="unit"
              label="Unit"
              placeholder="Please enter unit"
              disabled={!isEditMode}
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormText
              name="location"
              label="Location"
              placeholder="Please enter location"
              rules={[{ required: true, message: 'Please enter location' }]}
              disabled={!isEditMode}
            />
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 12 }}>
          Waste Diversion Initiative (If any)
        </Title>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormText
              name="program"
              label="Name of Program/Initiative (if any)"
              placeholder="Please enter program / initiative name"
              rules={[]}
              disabled={!isEditMode}
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormDatePicker
              name="programDate"
              label="Date of Program/ Initiative"
              placeholder="Please enter date of program / initiative"
              rules={[]}
              disabled={!isEditMode}
              fieldProps={{
                allowClear: true,
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
          <Col span={12}>
            <ProFormSelect
              name={'disposalMethodId'}
              label="Disposal Method"
              rules={[{ required: true, message: 'Please select a disposal method' }]}
              placeholder="Please select a disposal method"
              options={disposalMethods.map((r) => ({
                label: r.name,
                value: r.id,
              }))}
              fieldProps={{
                onChange: handleDisposalMethodChange,
                showSearch: true,
                optionFilterProp: 'label',
              }}
              disabled={!isEditMode}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name={'wasteTypeId'}
              label="Waste Type"
              rules={[{ required: true, message: 'Please select a waste type' }]}
              placeholder="Please select a waste type"
              options={wasteTypes.map((wt) => ({
                label: wt.name,
                value: wt.id,
              }))}
              fieldProps={{
                disabled: !selectedDisposalMethod,
                showSearch: true,
                optionFilterProp: 'label',
              }}
              disabled={!isEditMode || !selectedDisposalMethod}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <ProFormDigit
              name="wasteWeight"
              label="Waste Weight (kg)"
              placeholder="Please enter waste weight"
              rules={[{ required: true, message: 'Please enter waste weight' }]}
              disabled={!isEditMode}
            />
          </Col>
          <Col span={12}>
            {isAdmin && (
              <ProFormSelect
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select a status' }]}
                placeholder="Please select a status"
                options={[
                  {
                    label: wasteRecordStatusLabels[WasteRecordStatus.New],
                    value: WasteRecordStatus.New,
                  },
                  {
                    label: wasteRecordStatusLabels[WasteRecordStatus.Verified],
                    value: WasteRecordStatus.Verified,
                  },
                  {
                    label: wasteRecordStatusLabels[WasteRecordStatus.Rejected],
                    value: WasteRecordStatus.Rejected,
                  },
                  {
                    label: wasteRecordStatusLabels[WasteRecordStatus.RevisionRequired],
                    value: WasteRecordStatus.RevisionRequired,
                  },
                ]}
                disabled={!isEditMode || !isAdmin}
              />
            )}
          </Col>
        </Row>

        {(watchStatus === WasteRecordStatus.Rejected ||
          watchStatus === WasteRecordStatus.RevisionRequired) && (
          <Row gutter={16}>
            <Col span={24}>
              <ProFormTextArea
                name="comment"
                label="Comment"
                placeholder="Please enter revision / reject reason"
                disabled={!isAdmin || !isEditMode}
              />
            </Col>
          </Row>
        )}

        <ProFormText name="id" label="id" hidden disabled />
      </ProCard>
      <ProCard title={'Attachments'} bordered collapsible style={{ marginTop: '16px' }}>
        <ProForm.Item
          name="uploadedAttachments"
          label="Attachment (Optional)"
          extra={ATTACHMENT_ACCEPT_LABEL}
          valuePropName="fileList"
          getValueFromEvent={(e) => sanitizeUploadFileList(e?.fileList ?? [])}
        >
          <Upload
            name="fileList"
            multiple
            listType="picture"
            accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
            beforeUpload={(file) => {
              return validateAttachmentBeforeUpload(file, message.error);
            }}
            onRemove={() => {}}
            disabled={!isEditMode}
          >
            {isEditMode && <Button icon={<UploadOutlined />}>Click to Upload</Button>}
          </Upload>
        </ProForm.Item>
      </ProCard>
    </ProForm>
  );
};

export default WasteRecordForm;
