import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';
import { WasteRecordStatus } from '@/lib/enum/status';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Alert, App, Button } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import WasteRecordDrawerForm from './WasteRecordDrawerForm';
import { WasteRecord, WasteRecordFilter } from '@/lib/types/wasteRecord';
import { useAuth } from '@/contexts/AuthContext';
import {
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  FormOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { ExportWasteRecordModal } from './ExportWasteRecordModal';
import { getBaseColumns } from './columns';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  useWasteRecordList,
  useSaveWasteRecord,
  useDeleteWasteRecord,
  useExportWasteRecordExcel,
  useExportWasteRecordPdf,
} from '@/hook/wasteRecords';
import { useCreateRequest } from '@/hook/requests';
import { TableActionButton, TableActionGroup } from '@/components/table/TableAction';

interface WasteRecordManagementProps {
  isViewForm?: boolean;
}

const WasteRecordManagement: React.FC<WasteRecordManagementProps> = ({ isViewForm = false }) => {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const searchStr = useLocation({ select: (location) => location.searchStr });
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const { departments } = useProfileDropdownOptions();
  const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
  const [selectedRecord, setSelectedRecord] = useState<WasteRecord>();
  const [modalDrawerOpen, setModalDrawerOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [filters, setFilters] = useState<WasteRecordFilter>({
    pageNumber: 1,
    pageSize: 20,
  });

  const actionRef = useRef<ActionType | undefined>(undefined);
  const isAdmin = hasRole('Admin');
  const userRequestRoute = '/data-entry/view-form/requests';
  const linkedWasteRecordId = searchParams.get('wasteRecordId') ?? undefined;
  const [modalOpen, setModalOpen] = useState<false | 'excel' | 'pdf'>(false);
  const [changeRequestModalOpen, setChangeRequestModalOpen] = useState<boolean>(false);

  const { data: wasteRecordData, isLoading: isFetching } = useWasteRecordList(filters);
  const { mutateAsync: saveWasteRecord } = useSaveWasteRecord();
  const { mutateAsync: deleteWasteRecord, isPending: isDeleting } = useDeleteWasteRecord();
  const { mutateAsync: exportWasteRecordExcel, isPending: isExportingExcel } =
    useExportWasteRecordExcel();
  const { mutateAsync: exportWasteRecordPdf, isPending: isExportingPdf } =
    useExportWasteRecordPdf();
  const { mutateAsync: createRequest, isPending: isSubmittingRequest } = useCreateRequest();

  const handleExportExcel = async (year: number, month: number) => {
    try {
      await exportWasteRecordExcel({ year, month });
    } catch {
      return;
    } finally {
      setModalOpen(false);
    }
  };

  const handleExportPDF = async (year: number, month: number) => {
    try {
      await exportWasteRecordPdf({ year, month });
    } catch {
      return;
    } finally {
      setModalOpen(false);
    }
  };

  const handleChangeRequest = async (wasteRecordId: string | undefined, reqMessage: string) => {
    if (!wasteRecordId) {
      message.error('No waste record selected for request');
      return false;
    }

    try {
      await createRequest({
        wasteRecordId: wasteRecordId,
        message: reqMessage,
      });

      modal.info({
        title: 'Request Submitted',
        content: (
          <div>
            <p>1. Admin reviews your request message.</p>
            <p>2. If approved, record status becomes Revision Required.</p>
            <p>3. You can update the record in View Form.</p>
            <p>Track progress in My Requests.</p>
          </div>
        ),
        okText: 'Got it',
      });

      return true;
    } catch {
      return false;
    }
  };

  const showRequestGuide = () => {
    modal.info({
      title: 'Request Changes Process',
      content: (
        <div>
          <p>1. Click Request Changes on a record and describe the correction clearly.</p>
          <p>2. Admin reviews your request.</p>
          <p>3. If approved, the record status becomes Revision Required.</p>
          <p>4. Update the record in View Form and submit again.</p>
          <p>Track your request status in My Requests.</p>
        </div>
      ),
      okText: 'Understood',
    });
  };

  const handleWasteRecordUpdate = async (wasteRecord: WasteRecord) => {
    try {
      await saveWasteRecord({
        id: wasteRecord.id,
        campusId: wasteRecord.campusId,
        departmentId: wasteRecord.departmentId,
        disposalMethodId: wasteRecord.disposalMethodId,
        wasteTypeId: wasteRecord.wasteTypeId,
        location: wasteRecord.location,
        unit: wasteRecord.unit,
        program: wasteRecord.program,
        programDate: wasteRecord.programDate,
        wasteWeight: wasteRecord.wasteWeight,
        status: wasteRecord.status,
        date: wasteRecord.date,
        comment: wasteRecord.comment,
        uploadedAttachments: wasteRecord.uploadedAttachments,
        originalAttachmentIds:
          selectedRecord?.attachments?.map((attachment) => attachment.id) ?? [],
        isAdmin,
      });
      return true;
    } catch {
      return false;
    }
  };

  const confirmDeletion = async (wasteRecord: WasteRecord) => {
    modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this waste record?',
      okText: 'Yes',
      cancelText: 'Cancel',
      onOk: async () => handleWasteRecordDelete(wasteRecord),
    });
  };

  const handleWasteRecordDelete = (wasteRecord: WasteRecord) => {
    return deleteWasteRecord({ id: wasteRecord.id });
  };

  const columns: ProColumns<WasteRecord>[] = useMemo(
    () => [
      ...getBaseColumns({
        campuses,
        departments,
        disposalMethods,
        showUserColumn: !isViewForm,
      }),
      {
        title: 'Action',
        align: 'center',
        width: 320,
        fixed: 'right',
        hideInSearch: true,
        render: (_, record) => {
          return (
            <TableActionGroup>
              <TableActionButton
                tone="view"
                icon={<EyeOutlined />}
                onClick={() =>
                  void navigate({ href: `/data-entry/view-form/record?wasteRecordId=${record.id}` })
                }
              >
                View
              </TableActionButton>
              {(isAdmin || record.status == WasteRecordStatus.RevisionRequired) && (
                <>
                  <TableActionButton
                    tone="edit"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedRecord(record);
                      setModalDrawerOpen(true);
                      setEditMode(true);
                    }}
                  >
                    Edit
                  </TableActionButton>
                  <TableActionButton
                    tone="danger"
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    onClick={() => {
                      confirmDeletion(record);
                    }}
                  >
                    Delete
                  </TableActionButton>
                </>
              )}
              {!isAdmin &&
                record.status != WasteRecordStatus.Verified &&
                record.status != WasteRecordStatus.RevisionRequired && (
                  <TableActionButton
                    tone="warning"
                    icon={<FormOutlined />}
                    onClick={() => {
                      setSelectedRecord(record);
                      setChangeRequestModalOpen(true);
                    }}
                  >
                    Request Changes
                  </TableActionButton>
                )}
            </TableActionGroup>
          );
        },
      },
    ],
    [
      campuses,
      confirmDeletion,
      departments,
      disposalMethods,
      isAdmin,
      isDeleting,
      isViewForm,
      navigate,
    ],
  );

  useEffect(() => {
    if (linkedWasteRecordId) {
      setFilters((prev) => ({ ...prev, id: linkedWasteRecordId }));
    }
  }, [linkedWasteRecordId]);

  return (
    <PageContainer
      title={!isViewForm ? 'Waste Record Management' : 'View Form'}
      subTitle={
        linkedWasteRecordId ? `Showing linked request record: ${linkedWasteRecordId}` : undefined
      }
    >
      <ProTable<WasteRecord>
        rowKey="id"
        headerTitle="Waste Record List"
        actionRef={actionRef}
        loading={isFetching || isLoading}
        tableLayout="fixed"
        scroll={{ x: 2100 }}
        columnsState={{
          persistenceKey: isViewForm
            ? 'waste-record-view-form-columns'
            : 'waste-record-management-columns',
          persistenceType: 'localStorage',
        }}
        columns={columns}
        pagination={{
          showSizeChanger: true,
        }}
        dataSource={wasteRecordData?.data ?? []}
        request={(params: { current?: number; pageSize?: number; [key: string]: unknown }) => {
          setFilters((prev) => ({
            ...prev,
            ...params,
            id: linkedWasteRecordId,
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            isAdmin: isAdmin,
          }));
          return Promise.resolve({
            data: wasteRecordData?.data ?? [],
            success: true,
            total: wasteRecordData?.totalCount ?? 0,
          });
        }}
        toolbar={{
          actions: [
            ...(!isAdmin
              ? [
                  <Button key="request-guide" onClick={showRequestGuide}>
                    Request Guide
                  </Button>,
                  <Button
                    key="request-status"
                    onClick={() => void navigate({ href: userRequestRoute })}
                  >
                    My Requests
                  </Button>,
                ]
              : []),
            <Button
              key="excel"
              loading={isExportingExcel}
              icon={<FileExcelOutlined />}
              onClick={() => setModalOpen('excel')}
            >
              Excel
            </Button>,
            <Button
              key="pdf"
              loading={isExportingPdf}
              icon={<FilePdfOutlined />}
              danger
              onClick={() => setModalOpen('pdf')}
            >
              PDF
            </Button>,
          ],
        }}
        search={{
          layout: 'vertical',
          labelWidth: 'auto',
        }}
      />

      <WasteRecordDrawerForm
        campuses={campuses}
        departments={departments}
        disposalMethods={disposalMethods}
        onCancel={() => {
          setModalDrawerOpen(false);
          setEditMode(false);
          setTimeout(() => setSelectedRecord(undefined), 300);
        }}
        onSubmit={async (value) => {
          const success = await handleWasteRecordUpdate(value as WasteRecord);
          return success;
        }}
        visible={modalDrawerOpen}
        initialValues={selectedRecord || {}}
        isEditMode={editMode}
        handleDelete={async () => confirmDeletion(selectedRecord!)}
      />

      <ExportWasteRecordModal
        open={!!modalOpen}
        type={modalOpen || 'excel'}
        onCancel={() => setModalOpen(false)}
        onConfirm={(year: number, month: number) => {
          if (modalOpen === 'excel') handleExportExcel(year, month);
          if (modalOpen === 'pdf') handleExportPDF(year, month);
        }}
      />
      <ModalForm
        title="Request Changes"
        open={changeRequestModalOpen}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setSelectedRecord(undefined);
            setChangeRequestModalOpen(false);
          },
        }}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRecord(undefined);
            setChangeRequestModalOpen(false);
          }
        }}
        onFinish={async (values) => {
          const success = await handleChangeRequest(selectedRecord?.id, values.message);
          return success;
        }}
        submitter={{
          searchConfig: {
            submitText: 'Submit Request',
          },
          submitButtonProps: {
            loading: isSubmittingRequest,
          },
        }}
      >
        <Alert
          showIcon
          type="info"
          style={{ marginBottom: 12 }}
          message="Before submitting"
          description="Include exact fields and values to change for faster approval."
        />
        <ProFormTextArea
          label="Why you want to change this record"
          name="message"
          placeholder="Example: Please change waste type from Plastic to Paper and waste weight from 8.5 kg to 6.2 kg."
          rules={[
            { required: true, message: 'Please enter request details' },
            { min: 10, message: 'Please provide more detail (minimum 10 characters)' },
          ]}
          fieldProps={{ showCount: true, maxLength: 500, autoSize: { minRows: 4, maxRows: 8 } }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default WasteRecordManagement;
