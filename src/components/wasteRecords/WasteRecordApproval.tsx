import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';
import { wasteRecordStatusLabels, WasteRecordStatus } from '@/lib/enum/status';
import {
  getWasteRecordsPaginated,
  updateWasteRecordApprovalStatus,
} from '@/lib/services/wasteRecord';
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
import { Button, App } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CommentButton } from './CommentButton';
import { getBaseColumns } from './columns';
import {
  CheckOutlined,
  CloseOutlined,
  ExclamationOutlined,
} from '@ant-design/icons';
import { TableActionButton, TableActionGroup } from '@/components/table/TableAction';

const WasteRecordApproval: React.FC = () => {
  const { message } = App.useApp();
  const { departments } = useProfileDropdownOptions();
  const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<WasteRecordStatus>(WasteRecordStatus.New);
  const [selectedRows, setSelectedRows] = useState<WasteRecord[]>([]);
  const actionRef = useRef<ActionType | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<WasteRecordStatus | null>(null);
  const [modalRecords, setModalRecords] = useState<WasteRecord[]>([]);

  const fetchData = async (filter: WasteRecordFilter) => {
    setLoading(true);
    try {
      const res = await getWasteRecordsPaginated({
        ...filter,
      });
      return {
        data: res.data,
        success: res.success,
        total: res.totalCount,
      };
    } catch {
      message.error('Failed to fetch waste records');
      return {
        data: [],
        success: false,
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    records: WasteRecord[],
    status: WasteRecordStatus,
    comment?: string,
  ) => {
    if (!records.length) return;
    try {
      const wasteRecordIds = records.map((record) => record.id);
      const res = await updateWasteRecordApprovalStatus({ wasteRecordIds, status, comment });
      if (res.success) {
        message.success(`Waste record status updated to ${wasteRecordStatusLabels[status]}`);
      } else {
        message.error(`Failed to update status to ${wasteRecordStatusLabels[status]}`);
      }
      setSelectedRows([]);
      actionRef.current?.reload();
    } catch {
      message.error(`Failed to update status to ${wasteRecordStatusLabels[status]}`);
    }
  };

  const columns: ProColumns<WasteRecord>[] = [
    ...getBaseColumns({ campuses, departments, disposalMethods, showUserColumn: true }),
    {
      title: 'Action',
      width: 300,
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        const openCommentModal = (status: WasteRecordStatus) => {
          setModalStatus(status);
          setModalRecords([record]);
          setModalOpen(true);
        };

        if (record.status === WasteRecordStatus.New) {
          return (
            <TableActionGroup>
              <TableActionButton
                tone="success"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
              >
                Verify
              </TableActionButton>
              <TableActionButton
                tone="danger"
                icon={<CloseOutlined />}
                onClick={() => openCommentModal(WasteRecordStatus.Rejected)}
              >
                Reject
              </TableActionButton>
              <TableActionButton
                tone="warning"
                icon={<ExclamationOutlined />}
                onClick={() => openCommentModal(WasteRecordStatus.RevisionRequired)}
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
                tone="warning"
                icon={<ExclamationOutlined />}
                onClick={() => openCommentModal(WasteRecordStatus.RevisionRequired)}
              >
                Revision
              </TableActionButton>
              <TableActionButton
                tone="danger"
                icon={<CloseOutlined />}
                onClick={() => openCommentModal(WasteRecordStatus.Rejected)}
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
                tone="success"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
              >
                Verify
              </TableActionButton>
              <TableActionButton
                tone="warning"
                icon={<ExclamationOutlined />}
                onClick={() => openCommentModal(WasteRecordStatus.RevisionRequired)}
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
                tone="success"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
              >
                Verify
              </TableActionButton>
              <TableActionButton
                tone="danger"
                icon={<CloseOutlined />}
                onClick={() => openCommentModal(WasteRecordStatus.Rejected)}
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
    actionRef.current?.reloadAndRest?.();
  }, [statusFilter]);

  return (
    <PageContainer
      title={'Waste Record Approval Management'}
      loading={isLoading}
      tabList={[
        {
          key: WasteRecordStatus.New.toString(),
          tab: wasteRecordStatusLabels[WasteRecordStatus.New],
        },
        {
          key: WasteRecordStatus.Verified.toString(),
          tab: wasteRecordStatusLabels[WasteRecordStatus.Verified],
        },
        {
          key: WasteRecordStatus.Rejected.toString(),
          tab: wasteRecordStatusLabels[WasteRecordStatus.Rejected],
        },
        {
          key: WasteRecordStatus.RevisionRequired.toString(),
          tab: wasteRecordStatusLabels[WasteRecordStatus.RevisionRequired],
        },
      ]}
      onTabChange={(key) => {
        setStatusFilter(parseInt(key) as WasteRecordStatus);
        setSelectedRows([]);
      }}
    >
      <ProTable<WasteRecord>
        rowKey="id"
        headerTitle="Waste Record List"
        actionRef={actionRef}
        loading={loading || isLoading}
        tableLayout="fixed"
        scroll={{ x: 2200 }}
        columnsState={{
          persistenceKey: 'waste-record-approval-columns',
          persistenceType: 'localStorage',
        }}
        columns={columns}
        pagination={{ showSizeChanger: true }}
        request={(params: { current?: number; pageSize?: number; [key: string]: unknown }) => {
          return fetchData({
            ...params,
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            status: statusFilter,
            isAdmin: true,
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
          >
            Batch Approve
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
        <ProFormTextArea
          name="comment"
          label="Comment"
          placeholder="Please enter a reason"
          rules={[{ required: true, message: 'Comment is required' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default WasteRecordApproval;
