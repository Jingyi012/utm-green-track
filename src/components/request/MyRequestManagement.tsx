import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { RequestStatus, requestStatusLabels } from '@/lib/enum/status';
import { ChangeRequest } from '@/lib/types/typing';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { useDeleteMyRequest, useMyRequestList } from '@/hook/requests';
import { DeleteOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { TableActionButton } from '@/components/table/TableAction';
import { getRequestFlowSummary, getWasteRecordStatusMeta } from '@/lib/utils/requestFlow';

const renderEllipsisText = (value: string | undefined, maxWidth = 220) => {
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

const MyRequestManagement: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = useRef<ActionType | undefined>(undefined);

  const [statusFilter, setStatusFilter] = useState<RequestStatus>(RequestStatus.Pending);
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 20,
    status: RequestStatus.Pending,
  });

  const { data: requestData, isLoading } = useMyRequestList(filters);
  const { mutateAsync: deleteMyRequest, isPending: isDeleting } = useDeleteMyRequest();

  const tabList = useMemo(
    () => [
      {
        key: RequestStatus.Pending.toString(),
        tab: renderTabWithTooltip(
          requestStatusLabels[RequestStatus.Pending],
          'Your request is waiting for admin review. You can still delete it while it remains pending.',
        ),
      },
      {
        key: RequestStatus.Approved.toString(),
        tab: renderTabWithTooltip(
          requestStatusLabels[RequestStatus.Approved],
          'Open the linked waste record, review the admin comment if present, then update and resubmit the record.',
        ),
      },
      {
        key: RequestStatus.Rejected.toString(),
        tab: renderTabWithTooltip(
          requestStatusLabels[RequestStatus.Rejected],
          'Rejected requests do not change the waste record. Review the request details before submitting a new one.',
        ),
      },
    ],
    [],
  );

  const handleDeletePending = async (requestId: string) => {
    try {
      await deleteMyRequest(requestId);
    } catch {
      return;
    }
  };

  const columns = useMemo<ProColumns<ChangeRequest>[]>(
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
        search: false,
      },
      {
        title: 'Submitted At',
        dataIndex: 'createdAt',
        width: 180,
        align: 'center',
        search: false,
        render: (_: unknown, record: ChangeRequest) => dateTimeFormatter(record.createdAt),
      },
      {
        title: 'Message',
        dataIndex: 'message',
        width: 420,
        align: 'left',
        search: false,
        render: (_: unknown, record: ChangeRequest) => renderEllipsisText(record.message, 390),
      },
      {
        title: 'Related Record',
        dataIndex: 'wasteRecordId',
        width: 160,
        align: 'center',
        search: false,
        render: (_: unknown, record: ChangeRequest) =>
          record.wasteRecordId ? (
            <TableActionButton
              tone="view"
              icon={<EyeOutlined />}
              onClick={() =>
                void navigate({
                  href: `/data-entry/view-form/record?wasteRecordId=${record.wasteRecordId}`,
                })
              }
            >
              Open Record
            </TableActionButton>
          ) : (
            '-'
          ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 130,
        align: 'center',
        search: false,
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
        search: false,
        render: (_: unknown, record: ChangeRequest) => {
          const statusMeta = getWasteRecordStatusMeta(record.wasteRecord?.status);

          return statusMeta ? <Tag color={statusMeta.tone}>{statusMeta.label}</Tag> : '-';
        },
      },
      {
        title: 'Next Step',
        width: 280,
        search: false,
        render: (_: unknown, record: ChangeRequest) => {
          const flowSummary = getRequestFlowSummary(record);

          return (
            <Space direction="vertical" size={2}>
              <Tag color={flowSummary.tone}>{flowSummary.label}</Tag>
              <Typography.Text type="secondary">{flowSummary.description}</Typography.Text>
            </Space>
          );
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: 140,
        align: 'center',
        search: false,
        render: (_: unknown, record: ChangeRequest) =>
          record.status === RequestStatus.Pending ? (
            <Popconfirm
              title="Delete this pending request?"
              description="You can only delete requests that are still pending."
              onConfirm={() => handleDeletePending(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <TableActionButton tone="danger" icon={<DeleteOutlined />} loading={isDeleting}>
                Delete
              </TableActionButton>
            </Popconfirm>
          ) : (
            '-'
          ),
      },
    ],
    [handleDeletePending, isDeleting, navigate],
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
      title="My Request Changes"
      subTitle="Track your submitted requests and delete only pending ones."
      breadcrumb={{
        items: [
          { title: 'Data Entry', path: '/data-entry' },
          { title: 'View Form', path: '/data-entry/view-form' },
          { title: 'My Request Changes' },
        ],
      }}
      tabList={tabList}
      onTabChange={(key) => setStatusFilter(parseInt(key, 10) as RequestStatus)}
    >
      <ProTable<ChangeRequest>
        rowKey="id"
        headerTitle="Request List"
        actionRef={actionRef}
        loading={isLoading}
        tableLayout="fixed"
        scroll={{ x: 1550 }}
        columns={columns}
        search={false}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 20,
        }}
        dataSource={requestData?.data ?? []}
        request={(params: { current?: number; pageSize?: number }) => {
          setFilters({
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            status: statusFilter,
          });

          return Promise.resolve({
            data: requestData?.data ?? [],
            success: true,
            total: requestData?.totalCount ?? 0,
          });
        }}
      />
    </PageContainer>
  );
};

export default MyRequestManagement;
