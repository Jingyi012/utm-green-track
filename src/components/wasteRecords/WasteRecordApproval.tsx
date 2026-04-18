import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';
import { wasteRecordStatusLabels, WasteRecordStatus } from '@/lib/enum/status';
import { WasteRecord, WasteRecordFilter } from '@/lib/types/wasteRecord';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FooterToolbar } from '@ant-design/pro-layout/es/components/FooterToolbar';
import { Alert, Button, Space, Tooltip } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CommentButton } from './CommentButton';
import { getBaseColumns } from './columns';
import {
  CheckOutlined,
  CloseOutlined,
  ExclamationOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { TableActionButton, TableActionGroup } from '@/components/table/TableAction';
import { useNavigate } from '@tanstack/react-router';
import { useUpdateWasteRecordApprovalStatus, useWasteRecordList } from '@/hook/wasteRecords';

const renderTabWithTooltip = (label: string, description: string) => (
  <Space size={6}>
    <span>{label}</span>
    <span onClick={(event) => event.stopPropagation()}>
      <Tooltip title={description}>
        <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
      </Tooltip>
    </span>
  </Space>
);

const WasteRecordApproval: React.FC = () => {
  const navigate = useNavigate();
  const { departments } = useProfileDropdownOptions();
  const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
  const [statusFilter, setStatusFilter] = useState<WasteRecordStatus>(WasteRecordStatus.New);
  const [selectedRows, setSelectedRows] = useState<WasteRecord[]>([]);
  const actionRef = useRef<ActionType | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<WasteRecordStatus | null>(null);
  const [modalRecords, setModalRecords] = useState<WasteRecord[]>([]);
  const [filters, setFilters] = useState<WasteRecordFilter>({
    pageNumber: 1,
    pageSize: 20,
    status: WasteRecordStatus.New,
    isAdmin: true,
  });

  const { data: wasteRecordData, isLoading: isFetching } = useWasteRecordList(filters);
  const { mutateAsync: updateApprovalStatus, isPending: isUpdating } =
    useUpdateWasteRecordApprovalStatus();

  const handleStatusUpdate = async (
    records: WasteRecord[],
    status: WasteRecordStatus,
    comment?: string,
  ) => {
    if (!records.length) return;
    try {
      await updateApprovalStatus({
        wasteRecordIds: records.map((record) => record.id),
        status,
        comment,
      });
      setSelectedRows([]);
    } catch {
      return;
    }
  };

  const openStatusModal = (records: WasteRecord[], status: WasteRecordStatus) => {
    if (!records.length) return;

    setModalStatus(status);
    setModalRecords(records);
    setModalOpen(true);
  };

  const tabList = useMemo(
    () => [
      {
        key: WasteRecordStatus.New.toString(),
        tab: renderTabWithTooltip(
          wasteRecordStatusLabels[WasteRecordStatus.New],
          'Verify clean records directly. Use Revision Required for fixable issues and Rejected for invalid submissions.',
        ),
      },
      {
        key: WasteRecordStatus.Verified.toString(),
        tab: renderTabWithTooltip(
          wasteRecordStatusLabels[WasteRecordStatus.Verified],
          'Verified records are complete submissions. Move them back to Revision Required only when follow-up changes are needed.',
        ),
      },
      {
        key: WasteRecordStatus.Rejected.toString(),
        tab: renderTabWithTooltip(
          wasteRecordStatusLabels[WasteRecordStatus.Rejected],
          'Rejected records remain visible for reference. Verify only when the submitted data is now acceptable.',
        ),
      },
      {
        key: WasteRecordStatus.RevisionRequired.toString(),
        tab: renderTabWithTooltip(
          wasteRecordStatusLabels[WasteRecordStatus.RevisionRequired],
          'These comments are visible to the requester. Once the updates are correct, verify the record to close the loop.',
        ),
      },
    ],
    [],
  );

  const modalSummary = useMemo(() => {
    if (modalStatus === WasteRecordStatus.RevisionRequired) {
      return {
        type: 'warning' as const,
        message: 'Tell the requester exactly what to fix',
        description:
          modalRecords.length > 1
            ? 'The same revision note will be applied to all selected records.'
            : 'Explain the incorrect fields, the expected values, and any missing evidence.',
      };
    }

    return {
      type: 'error' as const,
      message: 'Explain why the record is being rejected',
      description:
        modalRecords.length > 1
          ? 'The same rejection reason will be applied to all selected records.'
          : 'Use rejection for submissions that should not proceed, not for minor corrections.',
    };
  }, [modalRecords.length, modalStatus]);

  const columns: ProColumns<WasteRecord>[] = [
    ...getBaseColumns({ campuses, departments, disposalMethods, showUserColumn: true }),
    {
      title: 'Action',
      width: 280,
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        if (record.status === WasteRecordStatus.New) {
          return (
            <TableActionGroup>
              <TableActionButton
                tone="view"
                icon={<EyeOutlined />}
                onClick={() =>
                  void navigate({
                    href: `/waste-data/approval/record?wasteRecordId=${record.id}`,
                  })
                }
              >
                View
              </TableActionButton>
              <TableActionButton
                tone="success"
                icon={<CheckOutlined />}
                loading={isUpdating}
                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
              >
                Verify
              </TableActionButton>
              <TableActionButton
                tone="danger"
                icon={<CloseOutlined />}
                loading={isUpdating}
                onClick={() => openStatusModal([record], WasteRecordStatus.Rejected)}
              >
                Reject
              </TableActionButton>
              <TableActionButton
                tone="warning"
                icon={<ExclamationOutlined />}
                loading={isUpdating}
                onClick={() => openStatusModal([record], WasteRecordStatus.RevisionRequired)}
              >
                Revision
              </TableActionButton>
            </TableActionGroup>
          );
        }

        if (record.status === WasteRecordStatus.Verified) {
          return (
            <TableActionGroup>
              <TableActionButton
                tone="view"
                icon={<EyeOutlined />}
                onClick={() =>
                  void navigate({
                    href: `/waste-data/approval/record?wasteRecordId=${record.id}`,
                  })
                }
              >
                View
              </TableActionButton>
              <TableActionButton
                tone="warning"
                icon={<ExclamationOutlined />}
                loading={isUpdating}
                onClick={() => openStatusModal([record], WasteRecordStatus.RevisionRequired)}
              >
                Revision
              </TableActionButton>
              <TableActionButton
                tone="danger"
                icon={<CloseOutlined />}
                loading={isUpdating}
                onClick={() => openStatusModal([record], WasteRecordStatus.Rejected)}
              >
                Reject
              </TableActionButton>
            </TableActionGroup>
          );
        }

        if (record.status === WasteRecordStatus.Rejected) {
          return (
            <TableActionGroup>
              <TableActionButton
                tone="view"
                icon={<EyeOutlined />}
                onClick={() =>
                  void navigate({
                    href: `/waste-data/approval/record?wasteRecordId=${record.id}`,
                  })
                }
              >
                View
              </TableActionButton>
              <TableActionButton
                tone="success"
                icon={<CheckOutlined />}
                loading={isUpdating}
                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
              >
                Verify
              </TableActionButton>
              <TableActionButton
                tone="warning"
                icon={<ExclamationOutlined />}
                loading={isUpdating}
                onClick={() => openStatusModal([record], WasteRecordStatus.RevisionRequired)}
              >
                Revision
              </TableActionButton>
              <CommentButton comment={record.comment} />
            </TableActionGroup>
          );
        }

        if (record.status === WasteRecordStatus.RevisionRequired) {
          return (
            <TableActionGroup>
              <TableActionButton
                tone="view"
                icon={<EyeOutlined />}
                onClick={() =>
                  void navigate({
                    href: `/waste-data/approval/record?wasteRecordId=${record.id}`,
                  })
                }
              >
                View
              </TableActionButton>
              <TableActionButton
                tone="success"
                icon={<CheckOutlined />}
                loading={isUpdating}
                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
              >
                Verify
              </TableActionButton>
              <TableActionButton
                tone="danger"
                icon={<CloseOutlined />}
                loading={isUpdating}
                onClick={() => openStatusModal([record], WasteRecordStatus.Rejected)}
              >
                Reject
              </TableActionButton>
              <CommentButton comment={record.comment} />
            </TableActionGroup>
          );
        }

        return '-';
      },
    },
  ];

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: statusFilter,
      pageNumber: 1,
    }));
  }, [statusFilter]);

  return (
    <PageContainer
      title={'Waste Record Approval Management'}
      loading={isLoading}
      tabList={tabList}
      onTabChange={(key) => {
        setStatusFilter(parseInt(key) as WasteRecordStatus);
        setSelectedRows([]);
      }}
    >
      <ProTable<WasteRecord>
        rowKey="id"
        headerTitle="Waste Record List"
        actionRef={actionRef}
        loading={isFetching || isLoading}
        tableLayout="fixed"
        scroll={{ x: 2500 }}
        columnsState={{
          persistenceKey: 'waste-record-approval-columns',
          persistenceType: 'localStorage',
        }}
        columns={columns}
        dataSource={wasteRecordData?.data ?? []}
        pagination={{ showSizeChanger: true }}
        request={(params: { current?: number; pageSize?: number; [key: string]: unknown }) => {
          setFilters((prev) => ({
            ...prev,
            ...params,
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            status: statusFilter,
            isAdmin: true,
          }));

          return Promise.resolve({
            data: wasteRecordData?.data ?? [],
            success: true,
            total: wasteRecordData?.totalCount ?? 0,
          });
        }}
        search={{
          layout: 'vertical',
          labelWidth: 'auto',
        }}
        rowSelection={
          statusFilter === WasteRecordStatus.New
            ? {
                onChange: (_, rows) => setSelectedRows(rows),
              }
            : undefined
        }
      />

      {statusFilter === WasteRecordStatus.New && selectedRows.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Chosen <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> item
            </div>
          }
        >
          <Button
            onClick={async () => handleStatusUpdate(selectedRows, WasteRecordStatus.Verified)}
            loading={isUpdating}
          >
            Batch Approve
          </Button>
          <Button
            onClick={() => openStatusModal(selectedRows, WasteRecordStatus.RevisionRequired)}
            loading={isUpdating}
          >
            Batch Revision
          </Button>
          <Button
            danger
            onClick={() => openStatusModal(selectedRows, WasteRecordStatus.Rejected)}
            loading={isUpdating}
          >
            Batch Reject
          </Button>
        </FooterToolbar>
      )}

      <ModalForm
        title={modalStatus === WasteRecordStatus.Rejected ? 'Reject Record' : 'Request Revision'}
        modalProps={{
          destroyOnHidden: true,
        }}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onFinish={async (values) => {
          await handleStatusUpdate(modalRecords, modalStatus!, values.comment);
          return true;
        }}
        submitter={{
          searchConfig: {
            submitText: 'Submit',
          },
        }}
      >
        <Alert
          type={modalSummary.type}
          showIcon
          message={modalSummary.message}
          description={modalSummary.description}
          style={{ marginBottom: 16 }}
        />
        <ProFormTextArea
          name="comment"
          label="Comment"
          placeholder={
            modalStatus === WasteRecordStatus.Rejected
              ? 'Explain why this record is being rejected'
              : 'Explain exactly what must be revised'
          }
          rules={[
            { required: true, message: 'Comment is required' },
            { min: 10, message: 'Please provide at least 10 characters' },
          ]}
          fieldProps={{ showCount: true, maxLength: 500, autoSize: { minRows: 4, maxRows: 8 } }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default WasteRecordApproval;
