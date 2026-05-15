import { useMemo, useState } from 'react';
import { App, Button, UploadFile } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import dayjs from 'dayjs';
import { PageContainer, ProForm } from '@ant-design/pro-components';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { createWasteRecords } from '@/lib/services/wasteRecord';
import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';
import { useWasteEntryStore } from '@/lib/store/useWasteEntryStore';
import { dateFormatter } from '@/lib/utils/formatter';
import { WasteRecordDraftInput, WasteRecordInput } from '@/lib/types/wasteRecord';
import EditFormModal from './EditFormModal';
import { toDateOnlyString } from '@/lib/utils/dateField';
import WasteEntryFormCard from './newForm/WasteEntryFormCard';
import WasteEntryRecordsCard from './newForm/WasteEntryRecordsCard';
import { getWastePairKey } from './newForm/helpers';
import { WasteEntryFormValues, WastePairMeta } from './newForm/types';
import { sanitizeUploadFileList } from '@/lib/utils/uploadFiles';

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

  const selectedRecords = useMemo(() => {
    const selectedKeySet = new Set(selectedRowKeys.map(String));
    return tableData.filter((record) => selectedKeySet.has(record.key));
  }, [selectedRowKeys, tableData]);

  const resetWholeForm = (): void => {
    form.resetFields();
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
      const normalizedProgramDate = normalizedProgram
        ? toDateOnlyString(values.programDate)
        : undefined;
      const normalizedDate = toDateOnlyString(values.date) ?? dayjs().format('YYYY-MM-DD');

      const sharedRecord = {
        date: normalizedDate,
        campusId: values.campusId,
        departmentId: values.departmentId,
        unit: values.unit,
        location: values.location,
        program: normalizedProgram,
        programDate: normalizedProgramDate,
      };

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
          date: sharedRecord.date,
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
          attachments: sanitizeUploadFileList(item.attachments),
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
          const response = await submitRecords(tableData);

          if (!response.success) {
            return;
          }

          message.success('All waste records submitted successfully');
          clearRecords();
          setSelectedRowKeys([]);
          resetWholeForm();
        } catch (error) {
          message.error('Unexpected error occurred during submission');
        } finally {
          hide();
        }
      },
    });
  };

  const handleSubmitSelected = (): void => {
    if (selectedRecords.length === 0) {
      message.warning('Please select at least one record to submit.');
      return;
    }

    modal.confirm({
      title: 'Confirm Selected Submission',
      content: `Are you sure you want to submit ${selectedRecords.length} selected record(s)?`,
      okText: 'Yes, Submit',
      cancelText: 'Cancel',
      onOk: async () => {
        const hide = message.loading('Submitting selected records...', 0);

        try {
          const response = await submitRecords(selectedRecords);

          if (!response.success) {
            return;
          }

          const selectedKeySet = new Set(selectedRowKeys.map(String));
          const remainingRecords = tableData.filter((record) => !selectedKeySet.has(record.key));

          setRecords(remainingRecords);
          setSelectedRowKeys([]);

          if (remainingRecords.length === 0) {
            resetWholeForm();
          }

          message.success('Selected waste records submitted successfully');
        } catch (error) {
          message.error('Unexpected error occurred during submission');
        } finally {
          hide();
        }
      },
    });
  };

  const submitRecords = async (records: WasteRecordDraftInput[]) => {
    const wasteRecords: WasteRecordInput[] = records.map((record) => ({
      ...record,
      date: record.date,
      attachments: (record.attachments ?? [])
        .map((file) => file.originFileObj)
        .filter((file): file is NonNullable<UploadFile['originFileObj']> => Boolean(file)),
    }));

    const response = await createWasteRecords({ wasteRecords });

    if (!response.success) {
      message.error(response.message || 'Failed to submit waste records');
    }

    return response;
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
      width: 120,
      render: (date: string) => dateFormatter(date),
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
      render: (text: string) => text || '-',
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
      render: (programDate: string | undefined) => dateFormatter(programDate),
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

  const campusOptions = useMemo(
    () =>
      campuses.map((campus) => ({
        label: campus.name,
        value: campus.id,
      })),
    [campuses],
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        label: department.name,
        value: department.id,
      })),
    [departments],
  );

  return (
    <PageContainer title={false}>
      <WasteEntryFormCard
        form={form}
        isLoading={Boolean(isLoading)}
        campusOptions={campusOptions}
        departmentOptions={departmentOptions}
        wastePairOptions={wastePairOptions}
        onAddToTable={() => {
          void handleAdd();
        }}
        onReset={resetWholeForm}
        onAttachmentError={message.error}
      />

      <WasteEntryRecordsCard
        tableData={tableData}
        totalWeight={totalWeight}
        selectedRowKeys={selectedRowKeys}
        columns={columns}
        onSelectionChange={setSelectedRowKeys}
        onSubmitAll={() => {
          void handleSubmit();
        }}
        onSubmitSelected={handleSubmitSelected}
        onDeleteSelected={handleBatchDelete}
      />

      <EditFormModal
        key={editingRecord?.key}
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
