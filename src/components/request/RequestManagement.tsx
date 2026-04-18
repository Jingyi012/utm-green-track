import { RequestStatus, requestStatusLabels } from '@/lib/enum/status';
import { ChangeRequest } from '@/lib/types/typing';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { FooterToolbar } from '@ant-design/pro-layout/es/components/FooterToolbar';
import { App, Button, Popconfirm, Tooltip } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRequestList, useUpdateRequestStatus, requestQueryKeys } from '@/hook/requests';
import { useQueryClient } from '@tanstack/react-query';

const renderEllipsisText = (value: string | undefined, maxWidth = 180) => {
  const text = value?.trim() || '-';
  if (text === '-') return text;

  return (
    <Tooltip title={text}>
      <span
        style={{
          display: 'inline-block',
          maxWidth,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          verticalAlign: 'bottom',
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
};

const RequestManagement: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<ChangeRequest[]>([]);
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<RequestStatus>(RequestStatus.Pending);
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 20,
    status: statusFilter,
    matricNo: undefined as string | undefined,
  });

  const { data: requestData, isLoading, refetch } = useRequestList(filters);
  const { mutate: updateStatusMutate, isPending: isUpdating } = useUpdateRequestStatus();

  const handleStatusUpdate = (requests: ChangeRequest[], status: RequestStatus) => {
    if (!requests.length) return;
    const requestIds = requests.map((u) => u.id);
    updateStatusMutate(
      { requestIds, status },
      {
        onSuccess: () => {
          message.success(`Request status updated to ${requestStatusLabels[status]}`);
          setSelectedRows([]);
          queryClient.invalidateQueries({ queryKey: requestQueryKeys.lists() });
        },
        onError: () => {
          message.error(`Failed to update status to ${requestStatusLabels[status]}`);
        },
      },
    );
  };

  const columns: ProColumns<ChangeRequest>[] = [
    {
      title: 'No.',
      render: (_: unknown, __: ChangeRequest, index: number, action?: ActionType) => {
        const current = action?.pageInfo?.current ?? 1;
        const pageSize = action?.pageInfo?.pageSize ?? 10;
        return (current - 1) * pageSize + index + 1;
      },
      width: 60,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: 'User',
      dataIndex: 'user',
      width: 180,
      ellipsis: true,
      align: 'center',
      render: (_: unknown, record: ChangeRequest) => renderEllipsisText(record.user, 160),
      hideInSearch: true,
    },
    {
      title: 'Staff / Matric No.',
      dataIndex: 'matricNo',
      width: 170,
      ellipsis: true,
      align: 'center',
      render: (_: unknown, record: ChangeRequest) => renderEllipsisText(record.matricNo, 150),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      width: 260,
      ellipsis: true,
      align: 'center',
      render: (_: unknown, record: ChangeRequest) => renderEllipsisText(record.message, 240),
      hideInSearch: true,
    },
    {
      title: 'Related Waste Record',
      dataIndex: 'wasteRecord',
      width: 180,
      align: 'center',
      hideInSearch: true,
      render: (_: unknown, record: ChangeRequest) => {
        if (!record.wasteRecordId) return '-';

        return (
          <Button
            type="link"
            onClick={() =>
              void navigate({
                href: `/data-entry/view-form/record?wasteRecordId=${record.wasteRecordId}`,
              })
            }
          >
            View Record
          </Button>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      align: 'center',
      hideInSearch: true,
      valueEnum: {
        [RequestStatus.Pending]: {
          text: requestStatusLabels[RequestStatus.Pending],
          status: 'Default',
        },
        [RequestStatus.Approved]: {
          text: requestStatusLabels[RequestStatus.Approved],
          status: 'Success',
        },
        [RequestStatus.Rejected]: {
          text: requestStatusLabels[RequestStatus.Rejected],
          status: 'Error',
        },
      },
    },
    {
      title: 'Action',
      width: 170,
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        if (record.status === RequestStatus.Pending) {
          return (
            <>
              <Button
                type="link"
                onClick={() => handleStatusUpdate([record], RequestStatus.Approved)}
                loading={isUpdating}
              >
                Approve
              </Button>
              <Popconfirm
                title="Reject this request?"
                onConfirm={() => handleStatusUpdate([record], RequestStatus.Rejected)}
              >
                <Button type="link" danger loading={isUpdating}>
                  Reject
                </Button>
              </Popconfirm>
            </>
          );
        } else {
          return (
            <>
              <Button
                type="link"
                onClick={() => handleStatusUpdate([record], RequestStatus.Pending)}
                loading={isUpdating}
              >
                Pending
              </Button>
            </>
          );
        }
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
      title={'Request Management'}
      tabList={[
        {
          key: RequestStatus.Pending.toString(),
          tab: requestStatusLabels[RequestStatus.Pending],
        },
        {
          key: RequestStatus.Approved.toString(),
          tab: requestStatusLabels[RequestStatus.Approved],
        },
        {
          key: RequestStatus.Rejected.toString(),
          tab: requestStatusLabels[RequestStatus.Rejected],
        },
      ]}
      onTabChange={(key) => {
        setStatusFilter(parseInt(key) as RequestStatus);
        setSelectedRows([]);
      }}
    >
      <ProTable<ChangeRequest>
        rowKey="id"
        headerTitle="Request List"
        actionRef={actionRef}
        loading={isLoading}
        tableLayout="fixed"
        scroll={{ x: 1300 }}
        columnsState={{
          persistenceKey: 'request-management-columns',
          persistenceType: 'localStorage',
        }}
        columns={columns}
        pagination={{
          current: 1,
          pageSize: 20,
        }}
        dataSource={requestData?.data ?? []}
        request={(params: { current?: number; pageSize?: number; matricNo?: string }) => {
          setFilters((prev) => ({
            ...prev,
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            matricNo: params.matricNo,
          }));
          return Promise.resolve({
            data: requestData?.data ?? [],
            success: true,
            total: requestData?.totalCount ?? 0,
          });
        }}
        options={{
          reload: () => refetch(),
        }}
        search={{
          labelWidth: 'auto',
        }}
        rowSelection={
          statusFilter === RequestStatus.Pending
            ? {
                onChange: (_, selectedRows) => setSelectedRows(selectedRows),
              }
            : undefined
        }
      />

      {statusFilter === RequestStatus.Pending && selectedRows.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Chosen <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> item
            </div>
          }
        >
          <Button
            onClick={async () => handleStatusUpdate(selectedRows, RequestStatus.Approved)}
            loading={isUpdating}
          >
            Batch Approved
          </Button>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

export default RequestManagement;
