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
import { App, Button } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { getBaseUserColumns } from './columns';
import { useUserList, useUpdateUserApprovalStatus, userQueryKeys } from '@/hook/users';
import { useQueryClient } from '@tanstack/react-query';

const UserApproval: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
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

  const { data: userData, isLoading: isFetching } = useUserList(filters);
  const { mutate: updateApprovalMutate, isPending: isUpdating } = useUpdateUserApprovalStatus();

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
    const userIds = users.map((u) => u.id);
    updateApprovalMutate(
      { userIds, status, rejectedReason },
      {
        onSuccess: () => {
          message.success(`User status updated to ${userStatusLabels[status]}`);
          setSelectedRows([]);
          queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
        },
        onError: () => {
          message.error(`Failed to update status to ${userStatusLabels[status]}`);
        },
      },
    );
  };

  const columns: ProColumns<UserDetails>[] = [
    ...getBaseUserColumns({ positions, departments, roles }),
    {
      title: 'Action',
      width: 170,
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        if (record.status === UserStatus.Pending) {
          return (
            <>
              <Button
                type="link"
                onClick={() => handleStatusUpdate([record], UserStatus.Approved)}
                loading={isUpdating}
              >
                Approve
              </Button>

              <Button
                type="link"
                danger
                onClick={() => openRejectModal([record])}
                loading={isUpdating}
              >
                Reject
              </Button>
            </>
          );
        }

        if (record.status === UserStatus.Approved) {
          return (
            <Button
              type="link"
              danger
              onClick={() => openRejectModal([record])}
              loading={isUpdating}
            >
              Reject
            </Button>
          );
        }

        if (record.status === UserStatus.Rejected) {
          return (
            <Button
              type="link"
              onClick={() => handleStatusUpdate([record], UserStatus.Approved)}
              loading={isUpdating}
            >
              Approve
            </Button>
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
            loading={isUpdating}
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
          await new Promise<void>((resolve) => {
            handleStatusUpdate(rejectingUsers, UserStatus.Rejected, values.rejectedReason);
            // Give mutation time to complete
            setTimeout(resolve, 100);
          });
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
