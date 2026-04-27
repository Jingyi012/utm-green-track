import { Button, Card, Col, Row, Typography, Upload, UploadFile } from 'antd';
import {
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormInstance,
  ProFormList,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  ATTACHMENT_ACCEPT_ATTRIBUTE,
  ATTACHMENT_ACCEPT_LABEL,
  validateAttachmentBeforeUpload,
} from '@/lib/utils/attachmentValidation';
import { sanitizeUploadFileList } from '@/lib/utils/uploadFiles';
import { WasteEntryFormValues } from './types';

const { Title, Text } = Typography;

type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  form: ProFormInstance<WasteEntryFormValues>;
  isLoading: boolean;
  campusOptions: SelectOption[];
  departmentOptions: SelectOption[];
  wastePairOptions: SelectOption[];
  onAddToTable: () => void;
  onReset: () => void;
  onAttachmentError: (message: string) => void;
};

export default function WasteEntryFormCard({
  form,
  isLoading,
  campusOptions,
  departmentOptions,
  wastePairOptions,
  onAddToTable,
  onReset,
  onAttachmentError,
}: Props) {
  return (
    <Card loading={isLoading} style={{ marginBottom: 24 }}>
      <ProForm<WasteEntryFormValues>
        form={form}
        layout="vertical"
        submitter={false}
        initialValues={{
          date: dayjs(),
          wasteItems: [{}],
        }}
      >
        <Title level={5}>Basic Information</Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormSelect
              name="campusId"
              label="UTM Campus"
              placeholder="Please select campus"
              rules={[{ required: true, message: 'Please select a campus' }]}
              options={campusOptions}
              fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormSelect
              name="departmentId"
              label="Faculty / Department / College / PTJ"
              placeholder="Select faculty / department / college / PTJ"
              rules={[
                { required: true, message: 'Please select faculty / department / college / PTJ' },
              ]}
              options={departmentOptions}
              fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
            />
          </Col>
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

          <Col xs={24} md={12}>
            <ProFormDatePicker
              name="date"
              label="Date"
              placeholder="Please select record date"
              rules={[{ required: true, message: 'Please select record date' }]}
              width="xl"
              fieldProps={{
                allowClear: false,
                format: 'DD/MM/YYYY',
                style: { width: '100%' },
              }}
            />
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 8 }}>
          Waste Information
        </Title>

        <ProFormList
          name="wasteItems"
          copyIconProps={false}
          deleteIconProps={{
            tooltipText: 'Remove this line',
          }}
          creatorButtonProps={{
            creatorButtonText: 'Add another line item',
            type: 'dashed',
          }}
          min={1}
          itemRender={({ listDom, action }) => (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                columnGap: 12,
                alignItems: 'start',
              }}
            >
              <div>{listDom}</div>
              <div style={{ paddingTop: 32 }}>{action}</div>
            </div>
          )}
        >
          <Row gutter={16}>
            <Col xs={24} md={11}>
              <ProFormSelect
                name="wastePairKey"
                label="Disposal Method + Waste Type"
                placeholder="Select disposal method and waste type"
                rules={[{ required: true, message: 'Please select disposal method + waste type' }]}
                options={wastePairOptions}
                fieldProps={{
                  showSearch: true,
                  optionFilterProp: 'label',
                }}
              />
            </Col>
            <Col xs={24} md={6}>
              <ProFormDigit
                name="wasteWeight"
                label="Waste Weight (kg)"
                placeholder="Weight"
                rules={[{ required: true, message: 'Please enter waste weight' }]}
                fieldProps={{
                  min: 0,
                  step: 0.1,
                  precision: 2,
                }}
                min={0}
              />
            </Col>
            <Col xs={24} md={7}>
              <ProForm.Item
                name="attachments"
                label="Attachment (.pdf, .jpg, .png)"
                valuePropName="fileList"
                getValueFromEvent={(event: { fileList: UploadFile[] } | UploadFile[]) =>
                  sanitizeUploadFileList(Array.isArray(event) ? event : (event?.fileList ?? []))
                }
              >
                <Upload
                  accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
                  beforeUpload={(file) => validateAttachmentBeforeUpload(file, onAttachmentError)}
                  multiple
                  style={{ width: '100%' }}
                >
                  <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                    Upload
                  </Button>
                </Upload>
              </ProForm.Item>
            </Col>
          </Row>
        </ProFormList>
        <Text type="secondary">{ATTACHMENT_ACCEPT_LABEL}</Text>

        <Title level={5} style={{ marginTop: 8 }}>
          Waste Diversion Initiative (If any)
        </Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ProFormText
              name="program"
              label="Name of Program / Initiative"
              placeholder="Please enter program / initiative name"
            />
          </Col>
          <Col xs={24} md={12}>
            <ProFormDatePicker
              name="programDate"
              label="Date of Program / Initiative"
              placeholder="Please enter date of program / initiative"
              fieldProps={{
                allowClear: false,
                format: 'DD/MM/YYYY',
                style: { width: '100%' },
              }}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col>
            <Button type="primary" onClick={onAddToTable}>
              Add To Table
            </Button>
          </Col>
          <Col>
            <Button danger onClick={onReset}>
              Reset Form
            </Button>
          </Col>
        </Row>
      </ProForm>
    </Card>
  );
}
