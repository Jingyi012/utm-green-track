import { useProfileDropdownOptions } from '@/hook/options';
import { UserStatus, userStatusLabels } from '@/lib/enum/status';
import { UserDetails } from '@/lib/types/typing';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FooterToolbar } from '@ant-design/pro-layout/es/components/FooterToolbar';
import { Button } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { getBaseUserColumns } from './columns';
import { useUserList, useUpdateUserApprovalStatus } from '@/hook/users';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { TableActionButton, TableActionGroup } from '@/components/table/TableAction';

const UserApproval: React.FC = () => {
  const { positions, departments, roles, isLoading } = useProfileDropdownOptions();
  const [statusFilter, setStatusFilter] = useState<UserStatus>(UserStatus.Pending);
  const [selectedRows, setSelectedRows] = useState<UserDetails[]>([]);
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 20,
    status: statusFilter,
  });
  const actionRef = useRef<ActionType | undefined>(undefined);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingUsers, setRejectingUsers] = useState<UserDetails[]>([]);
  const [activeStatusUpdate, setActiveStatusUpdate] = useState<{
    userIds: string[];
    status: UserStatus;
  } | null>(null);

  const { data: userData, isLoading: isFetching, refetch } = useUserList(filters);
  const { mutateAsync: updateApprovalStatus, isPending: isUpdating } =
    useUpdateUserApprovalStatus();

  const openRejectModal = (users: UserDetails[]) => {
    setRejectingUsers(users);
    setRejectModalOpen(true);
  };

  // Batch or single approve/reject
  const handleStatusUpdate = (
    users: UserDetails[],
    status: UserStatus,
    rejectedReason?: string,
  ) => {
    if (!users.length) return;
    setActiveStatusUpdate({
      userIds: users.map((user) => user.id),
      status,
    });
    return updateApprovalStatus({
      userIds: users.map((user) => user.id),
      status,
      rejectedReason,
    })
      .then(() => {
        setSelectedRows([]);
      })
      .catch(() => undefined)
      .finally(() => {
        setActiveStatusUpdate(null);
      });
  };

  const isRowActionLoading = (userId: string, status: UserStatus) =>
    isUpdating &&
    activeStatusUpdate?.status === status &&
    activeStatusUpdate.userIds.length === 1 &&
    activeStatusUpdate.userIds[0] === userId;

  const isBatchActionLoading = (status: UserStatus) =>
    isUpdating && activeStatusUpdate?.status === status && activeStatusUpdate.userIds.length > 1;

  const columns: ProColumns<UserDetails>[] = [
    ...getBaseUserColumns({ positions, departments, roles }),
    {
      title: 'Action',
      width: 230,
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        if (record.status === UserStatus.Pending) {
          return (
            <TableActionGroup>
              <TableActionButton
                tone="success"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate([record], UserStatus.Approved)}
                loading={isRowActionLoading(record.id, UserStatus.Approved)}
              >
                Approve
              </TableActionButton>

              <TableActionButton
                tone="danger"
                icon={<CloseOutlined />}
                onClick={() => openRejectModal([record])}
              >
                Reject
              </TableActionButton>
            </TableActionGroup>
          );
        }

        if (record.status === UserStatus.Approved) {
          return (
            <TableActionButton
              tone="danger"
              icon={<CloseOutlined />}
              onClick={() => openRejectModal([record])}
            >
              Reject
            </TableActionButton>
          );
        }

        if (record.status === UserStatus.Rejected) {
          return (
            <TableActionButton
              tone="success"
              icon={<CheckOutlined />}
              onClick={() => handleStatusUpdate([record], UserStatus.Approved)}
              loading={isRowActionLoading(record.id, UserStatus.Approved)}
            >
              Approve
            </TableActionButton>
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
      title={'User Approval Management'}
      loading={isLoading}
      tabList={[
        {
          key: UserStatus.Pending.toString(),
          tab: userStatusLabels[UserStatus.Pending],
        },
        {
          key: UserStatus.Approved.toString(),
          tab: userStatusLabels[UserStatus.Approved],
        },
        {
          key: UserStatus.Rejected.toString(),
          tab: userStatusLabels[UserStatus.Rejected],
        },
      ]}
      onTabChange={(key) => {
        setStatusFilter(parseInt(key) as UserStatus);
        setSelectedRows([]);
      }}
    >
      <ProTable<UserDetails>
        rowKey="id"
        headerTitle="User List"
        actionRef={actionRef}
        loading={isFetching || isLoading}
        tableLayout="fixed"
        scroll={{ x: 1600 }}
        columnsState={{
          persistenceKey: 'user-approval-columns',
          persistenceType: 'localStorage',
        }}
        columns={columns}
        pagination={{
          current: filters.pageNumber,
          pageSize: filters.pageSize,
          total: userData?.totalCount,
          showSizeChanger: true,
        }}
        dataSource={userData?.data ?? []}
        request={(params: { current?: number; pageSize?: number; [key: string]: unknown }) => {
          setFilters((prev) => ({
            ...prev,
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
          }));
          return Promise.resolve({
            data: userData?.data ?? [],
            success: true,
            total: userData?.totalCount ?? 0,
          });
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={{
          reload: () => refetch(),
        }}
        rowSelection={
          statusFilter === UserStatus.Pending
            ? {
                onChange: (_, selectedRows) => setSelectedRows(selectedRows),
              }
            : undefined
        }
      />

      {/* Batch approve toolbar */}
      {statusFilter === UserStatus.Pending && selectedRows.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Chosen <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> item
            </div>
          }
        >
          <Button
            onClick={async () => handleStatusUpdate(selectedRows, UserStatus.Approved)}
            loading={isBatchActionLoading(UserStatus.Approved)}
          >
            Batch Approve
          </Button>
        </FooterToolbar>
      )}

      <ModalForm
        title="Reject User"
        open={rejectModalOpen}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => setRejectModalOpen(false),
        }}
        onOpenChange={setRejectModalOpen}
        onFinish={async (values) => {
          await handleStatusUpdate(rejectingUsers, UserStatus.Rejected, values.rejectedReason);
          return true;
        }}
        submitter={{
          searchConfig: {
            submitText: 'Submit',
            resetText: 'Cancel',
          },
        }}
      >
        <ProFormTextArea
          name="rejectedReason"
          label="Reject Reason"
          placeholder="Enter reason for rejection"
          rules={[{ required: true, message: 'Reject reason is required' }]}
          fieldProps={{ rows: 4 }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default UserApproval;
