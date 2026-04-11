'use client';

import { useMemo, useState } from 'react';
import { App, Button, Card, Col, Row, Space, Table, Typography, Upload, UploadFile } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import {
  PageContainer,
  ProForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormList,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { createWasteRecords } from '@/lib/services/wasteRecord';
import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';
import { useWasteEntryStore } from '@/lib/store/useWasteEntryStore';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import { WasteRecordDraftInput, WasteRecordInput } from '@/lib/types/wasteRecord';
import EditFormModal from './EditFormModal';
import {
  ATTACHMENT_ACCEPT_ATTRIBUTE,
  ATTACHMENT_ACCEPT_LABEL,
  validateAttachmentBeforeUpload,
} from '@/lib/utils/attachmentValidation';

const { Title, Text } = Typography;

const WASTE_PAIR_SEPARATOR = '::';

type WasteItemFormValue = {
  wastePairKey: string;
  wasteWeight: number;
  attachments?: UploadFile[];
};

type WasteEntryFormValues = {
  campusId: string;
  departmentId: string;
  unit?: string;
  location: string;
  program?: string;
  programDate?: string;
  wasteItems: WasteItemFormValue[];
};

type WastePairMeta = {
  disposalMethodId: string;
  wasteTypeId: string;
};

const getWastePairKey = (disposalMethodId: string, wasteTypeId: string): string =>
  `${disposalMethodId}${WASTE_PAIR_SEPARATOR}${wasteTypeId}`;

export default function WasteEntryForm() {
  const [form] = ProForm.useForm<WasteEntryFormValues>();
  const { message, modal } = App.useApp();
  const { departments } = useProfileDropdownOptions();
  const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
  const { tableData, addRecord, updateRecord, deleteRecord, setRecords, clearRecords } =
    useWasteEntryStore();

  const [editingRecord, setEditingRecord] = useState<WasteRecordDraftInput | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const wastePairOptions = useMemo(
    () =>
      disposalMethods.flatMap((method) =>
        method.wasteTypes.map((wasteType) => ({
          value: getWastePairKey(method.id, wasteType.id),
          label: `${method.name} | ${wasteType.name}`,
        })),
      ),
    [disposalMethods],
  );

  const wastePairMap = useMemo(() => {
    const map: Record<string, WastePairMeta> = {};
    disposalMethods.forEach((method) => {
      method.wasteTypes.forEach((wasteType) => {
        map[getWastePairKey(method.id, wasteType.id)] = {
          disposalMethodId: method.id,
          wasteTypeId: wasteType.id,
        };
      });
    });
    return map;
  }, [disposalMethods]);

  const totalWeight = useMemo(
    () => tableData.reduce((sum, record) => sum + Number(record.wasteWeight || 0), 0),
    [tableData],
  );

  const resetWholeForm = (): void => {
    form.resetFields();
    form.setFieldValue('wasteItems', [{}]);
  };

  const handleAdd = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      const validWasteItems = (values.wasteItems ?? []).filter(
        (item) =>
          item?.wastePairKey && item?.wasteWeight !== undefined && item?.wasteWeight !== null,
      );

      if (validWasteItems.length === 0) {
        message.error('Please add at least one waste line item.');
        return;
      }

      const normalizedProgram = values.program?.trim() || undefined;
      const normalizedProgramDate = normalizedProgram ? values.programDate : undefined;

      const sharedRecord = {
        campusId: values.campusId,
        departmentId: values.departmentId,
        unit: values.unit,
        location: values.location,
        program: normalizedProgram,
        programDate: normalizedProgramDate,
      };

      const displayDate = new Date().toLocaleDateString('en-GB');
      const now = Date.now();
      let skippedInvalidPair = 0;

      validWasteItems.forEach((item, index) => {
        const pair = wastePairMap[item.wastePairKey];
        if (!pair) {
          skippedInvalidPair += 1;
          return;
        }

        const newRow: WasteRecordDraftInput = {
          key: `${now}-${index}`,
          date: displayDate,
          campusId: sharedRecord.campusId,
          departmentId: sharedRecord.departmentId,
          unit: sharedRecord.unit,
          location: sharedRecord.location,
          program: sharedRecord.program,
          programDate: sharedRecord.programDate,
          disposalMethodId: pair.disposalMethodId,
          wasteTypeId: pair.wasteTypeId,
          wasteWeight: Number(item.wasteWeight),
          status: '',
          attachments: [...(item.attachments ?? [])],
        };

        addRecord(newRow);
      });

      if (skippedInvalidPair > 0) {
        message.warning(
          `${skippedInvalidPair} line item(s) were skipped due to invalid selection.`,
        );
      }

      resetWholeForm();

      message.success(`${validWasteItems.length - skippedInvalidPair} record(s) added to table.`);
    } catch {
      message.error('Please complete all required fields before adding.');
    }
  };

  const handleEdit = (record: WasteRecordDraftInput): void => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveEdit = (values: Partial<WasteRecordDraftInput>, recordKey: string): void => {
    updateRecord(recordKey, values);
    message.success('Row updated successfully');
  };

  const handleDelete = (key: string): void => {
    modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this entry?',
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      onOk: () => {
        deleteRecord(key);
        setSelectedRowKeys((prev) => prev.filter((rowKey) => String(rowKey) !== key));
        message.success('Record deleted successfully');
      },
    });
  };

  const handleBatchDelete = (): void => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one record to delete.');
      return;
    }

    modal.confirm({
      title: 'Delete Selected Records',
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected record(s)?`,
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => {
        const selectedKeySet = new Set(selectedRowKeys.map(String));
        const nextRecords = tableData.filter((record) => !selectedKeySet.has(record.key));
        setRecords(nextRecords);
        setSelectedRowKeys([]);
        message.success('Selected records deleted successfully');
      },
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (tableData.length === 0) {
      message.warning('No data to submit. Please add at least one entry.');
      return;
    }

    modal.confirm({
      title: 'Confirm Submission',
      content: 'Are you sure you want to submit all the waste records?',
      okText: 'Yes, Submit',
      cancelText: 'Cancel',
      onOk: async () => {
        const hide = message.loading('Submitting records...', 0);

        try {
          const wasteRecords: WasteRecordInput[] = tableData.map((record) => ({
            ...record,
            date: new Date().toISOString(),
            attachments: (record.attachments ?? [])
              .map((file) => file.originFileObj)
              .filter((file): file is NonNullable<UploadFile['originFileObj']> => Boolean(file)),
          }));

          const response = await createWasteRecords({ wasteRecords });

          if (response?.success) {
            message.success('All waste records submitted successfully');
            clearRecords();
            setSelectedRowKeys([]);
            resetWholeForm();
          } else {
            message.error(response?.message || 'Failed to submit waste records');
          }
        } catch (error) {
          console.error('Batch submission failed:', error);
          message.error('Unexpected error occurred during submission');
        } finally {
          hide();
        }
      },
    });
  };

  const columns: ColumnsType<WasteRecordDraftInput> = [
    {
      title: 'No.',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      width: 100,
    },
    {
      title: 'UTM Campus',
      dataIndex: 'campusId',
      width: 140,
      render: (campusId: string) => campuses.find((campus) => campus.id === campusId)?.name ?? '-',
    },
    {
      title: 'Faculty / Department / College / PTJ',
      dataIndex: 'departmentId',
      width: 180,
      render: (departmentId: string) =>
        departments.find((department) => department.id === departmentId)?.name ?? '-',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      width: 140,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      width: 140,
    },
    {
      title: 'Program Name',
      dataIndex: 'program',
      width: 180,
    },
    {
      title: 'Program Date',
      dataIndex: 'programDate',
      width: 160,
      render: (programDate: string | undefined) => dateTimeFormatter(programDate),
    },
    {
      title: 'Disposal Method',
      dataIndex: 'disposalMethodId',
      width: 170,
      render: (methodId: string) =>
        disposalMethods.find((method) => method.id === methodId)?.name ?? '-',
    },
    {
      title: 'Waste Type',
      dataIndex: 'wasteTypeId',
      width: 170,
      render: (wasteTypeId: string, record) => {
        const method = disposalMethods.find((item) => item.id === record.disposalMethodId);
        return method?.wasteTypes.find((wasteType) => wasteType.id === wasteTypeId)?.name ?? '-';
      },
    },
    {
      title: 'Waste Weight (kg)',
      dataIndex: 'wasteWeight',
      width: 140,
    },
    {
      title: 'Attachment',
      dataIndex: 'attachments',
      width: 220,
      render: (attachments: UploadFile[]) =>
        attachments?.length > 0
          ? attachments.map((file, index) => {
              const blob = file.originFileObj;
              const url = blob ? URL.createObjectURL(blob) : null;

              return (
                <div key={index}>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {file.name}
                    </a>
                  ) : (
                    file.name
                  )}
                </div>
              );
            })
          : 'None',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          />
        </>
      ),
    },
  ];

  return (
    <PageContainer title={false}>
      <Card loading={isLoading} style={{ marginBottom: 24 }}>
        <ProForm<WasteEntryFormValues>
          form={form}
          layout="vertical"
          submitter={false}
          onFinish={handleAdd}
          initialValues={{ wasteItems: [{}] }}
        >
          <Title level={5}>Basic Information</Title>
          <Row gutter={16}>
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
                options={departments.map((department) => ({
                  label: department.name,
                  value: department.id,
                }))}
                fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
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
                  rules={[
                    { required: true, message: 'Please select disposal method + waste type' },
                  ]}
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
                    Array.isArray(event) ? event : (event?.fileList ?? [])
                  }
                >
                  <Upload
                    accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
                    beforeUpload={(file) => validateAttachmentBeforeUpload(file, message.error)}
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
              <ProFormDateTimePicker
                name="programDate"
                label="Date of Program / Initiative"
                placeholder="Please enter date of program / initiative"
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col>
              <Button type="primary" onClick={() => form.submit()}>
                Add To Table
              </Button>
            </Col>
            <Col>
              <Button danger onClick={resetWholeForm}>
                Reset Form
              </Button>
            </Col>
          </Row>
        </ProForm>
      </Card>

      <Card>
        <div
          style={{
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space wrap>
            <Text strong>{`Records: ${tableData.length}`}</Text>
            <Text strong>{`Total Weight: ${totalWeight.toFixed(2)} kg`}</Text>
          </Space>
          {selectedRowKeys.length > 0 && (
            <Button danger onClick={handleBatchDelete}>
              Delete Selected ({selectedRowKeys.length})
            </Button>
          )}
        </div>
        <Table<WasteRecordDraftInput>
          dataSource={tableData}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={false}
          bordered
          scroll={{ x: 1500 }}
          style={{ marginBottom: 16 }}
        />
        <div className="flex justify-center">
          <Button type="primary" onClick={handleSubmit} disabled={tableData.length === 0}>
            Submit All Records
          </Button>
        </div>
      </Card>

      <EditFormModal
        open={isModalOpen}
        record={editingRecord}
        campuses={campuses}
        departments={departments}
        disposalMethods={disposalMethods}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveEdit}
      />
    </PageContainer>
  );
}
