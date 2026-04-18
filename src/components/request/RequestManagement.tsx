import { RequestStatus, requestStatusLabels } from '@/lib/enum/status';
import { ChangeRequest } from '@/lib/types/typing';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { FooterToolbar } from '@ant-design/pro-layout/es/components/FooterToolbar';
import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRequestList, useUpdateRequestStatus } from '@/hook/requests';
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { TableActionButton, TableActionGroup } from '@/components/table/TableAction';
import { getWasteRecordStatusMeta } from '@/lib/utils/requestFlow';

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

const RequestManagement: React.FC = () => {
  const navigate = useNavigate();
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
  const { mutateAsync: updateRequestStatus, isPending: isUpdating } = useUpdateRequestStatus();

  const tabList = useMemo(
    () => [
      {
        key: RequestStatus.Pending.toString(),
        tab: renderTabWithTooltip(
          requestStatusLabels[RequestStatus.Pending],
          'Approve when the requester should update the linked record. Reject when no record revision should happen.',
        ),
      },
      {
        key: RequestStatus.Approved.toString(),
        tab: renderTabWithTooltip(
          requestStatusLabels[RequestStatus.Approved],
          'Approved requests should send the requester back to the linked waste record so they can revise and resubmit it.',
        ),
      },
      {
        key: RequestStatus.Rejected.toString(),
        tab: renderTabWithTooltip(
          requestStatusLabels[RequestStatus.Rejected],
          'Rejected requests close the loop without changing the waste record unless you move them back to Pending.',
        ),
      },
    ],
    [],
  );

  const handleStatusUpdate = async (requests: ChangeRequest[], status: RequestStatus) => {
    if (!requests.length) return;
    try {
      await updateRequestStatus({
        requestIds: requests.map((request) => request.id),
        status,
      });
      setSelectedRows([]);
    } catch {
      return;
    }
  };

  const columns: ProColumns<ChangeRequest>[] = useMemo(
    () => [
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
            <TableActionButton
              tone="view"
              icon={<EyeOutlined />}
              onClick={() =>
                void navigate({
                  href: `/waste-data/requests/record?wasteRecordId=${record.wasteRecordId}`,
                })
              }
            >
              View Record
            </TableActionButton>
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
        title: 'Record Status',
        width: 150,
        align: 'center',
        hideInSearch: true,
        render: (_: unknown, record: ChangeRequest) => {
          const statusMeta = getWasteRecordStatusMeta(record.wasteRecord?.status);

          return statusMeta ? <Tag color={statusMeta.tone}>{statusMeta.label}</Tag> : '-';
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
              <TableActionGroup>
                <Popconfirm
                  title="Approve this request?"
                  description="This should send the linked waste record into Revision Required so the requester can update it."
                  onConfirm={() => handleStatusUpdate([record], RequestStatus.Approved)}
                >
                  <TableActionButton
                    tone="success"
                    icon={<CheckOutlined />}
                    loading={isUpdating}
                  >
                    Approve
                  </TableActionButton>
                </Popconfirm>
                <Popconfirm
                  title="Reject this request?"
                  description="This will reject the request without asking the requester to revise the waste record."
                  onConfirm={() => handleStatusUpdate([record], RequestStatus.Rejected)}
                >
                  <TableActionButton
                    tone="danger"
                    icon={<CloseOutlined />}
                    loading={isUpdating}
                  >
                    Reject
                  </TableActionButton>
                </Popconfirm>
              </TableActionGroup>
            );
          }

          return (
            <Popconfirm
              title="Move this request back to Pending?"
              description="Use this when the request should return to the admin review queue."
              onConfirm={() => handleStatusUpdate([record], RequestStatus.Pending)}
            >
              <TableActionButton
                tone="warning"
                icon={<ClockCircleOutlined />}
                loading={isUpdating}
              >
                Pending
              </TableActionButton>
            </Popconfirm>
          );
        },
      },
    ],
    [handleStatusUpdate, isUpdating, navigate],
  );

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
      tabList={tabList}
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
        scroll={{ x: 1750 }}
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
