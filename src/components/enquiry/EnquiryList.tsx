import { EnquiryStatus, enquiryStatusLabels } from '@/lib/enum/status';
import { Enquiry, EnquiryInput } from '@/lib/types/typing';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, Space } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { EnquiryDetailDrawer } from './EnquiryDetailDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { CreateEnquiryModal } from './CreateEnquiryModal';
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  RedoOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import {
  useEnquiryList,
  useCreateEnquiry,
  useUpdateEnquiryStatus,
  useDeleteEnquiry,
} from '@/hook/enquiry';
import { TableActionButton, TableActionGroup } from '@/components/table/TableAction';

export const EnquiryList: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeStatusUpdate, setActiveStatusUpdate] = useState<{
    enquiryId: string;
    status: number;
  } | null>(null);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 20,
    status: undefined as number | undefined,
    subject: undefined as string | undefined,
  });
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { user, hasRole } = useAuth();

  const { data: enquiryData, isLoading, refetch } = useEnquiryList(filters);
  const { mutateAsync: deleteEnquiry, isPending: isDeleting } = useDeleteEnquiry();
  const { mutateAsync: createEnquiry, isPending: isCreating } = useCreateEnquiry();
  const { mutateAsync: updateEnquiryStatus, isPending: isUpdatingStatus } =
    useUpdateEnquiryStatus();

  const handleDeleteEnquiry = (id: string) => {
    setActiveDeleteId(id);
    return deleteEnquiry(id).finally(() => {
      setActiveDeleteId(null);
    });
  };

  const handleCreateEnquiry = async (values: EnquiryInput) => {
    try {
      await createEnquiry(values);
      setCreateModalOpen(false);
      return true;
    } catch {
      return false;
    }
  };

  const handleEnquiryStatusUpdate = async (id: string, status: number) => {
    setActiveStatusUpdate({ enquiryId: id, status });
    try {
      await updateEnquiryStatus({ enquiryId: id, status });
    } catch {
      return;
    } finally {
      setActiveStatusUpdate(null);
    }
  };

  const columns: ProColumns<Enquiry>[] = useMemo(
    () => [
      {
        title: 'No',
        render: (_: any, __: any, index: number, action) => {
          const current = action?.pageInfo?.current ?? 1;
          const pageSize = action?.pageInfo?.pageSize ?? 10;
          return (current - 1) * pageSize + index + 1;
        },
        width: 60,
        align: 'center' as const,
        hideInSearch: true,
      },
      {
        title: 'User',
        dataIndex: 'userName',
        align: 'center' as const,
        hideInSearch: true,
        hideInTable: !hasRole('Admin'),
      },
      {
        title: 'Subject',
        dataIndex: 'subject',
        align: 'center' as const,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        align: 'center' as const,
        valueType: 'select',
        valueEnum: {
          [EnquiryStatus.Open]: {
            text: enquiryStatusLabels[EnquiryStatus.Open],
            status: 'Processing',
          },
          [EnquiryStatus.Closed]: {
            text: enquiryStatusLabels[EnquiryStatus.Closed],
            status: 'Default',
          },
        },
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        align: 'center' as const,
        hideInSearch: true,
        render(_, record) {
          return dateTimeFormatter(record.createdAt);
        },
      },
      {
        title: 'Action',
        hideInSearch: true,
        align: 'center' as const,
        render: (_, record: Enquiry) => (
          <TableActionGroup>
            <TableActionButton
              tone="view"
              icon={<EyeOutlined />}
              onClick={() => setSelectedId(record.id)}
            >
              View
            </TableActionButton>

            {record.status === EnquiryStatus.Open && hasRole('Admin') && (
              <TableActionButton
                tone="warning"
                icon={<StopOutlined />}
                loading={
                  isUpdatingStatus &&
                  activeStatusUpdate?.enquiryId === record.id &&
                  activeStatusUpdate.status === EnquiryStatus.Closed
                }
                onClick={() => handleEnquiryStatusUpdate(record.id, EnquiryStatus.Closed)}
              >
                Close
              </TableActionButton>
            )}

            {record.status === EnquiryStatus.Closed && hasRole('Admin') && (
              <TableActionButton
                tone="success"
                icon={<RedoOutlined />}
                loading={
                  isUpdatingStatus &&
                  activeStatusUpdate?.enquiryId === record.id &&
                  activeStatusUpdate.status === EnquiryStatus.Open
                }
                onClick={() => handleEnquiryStatusUpdate(record.id, EnquiryStatus.Open)}
              >
                Reopen
              </TableActionButton>
            )}

            <Popconfirm
              title="Are you sure you want to delete this enquiry?"
              onConfirm={() => handleDeleteEnquiry(record.id)}
            >
              <TableActionButton
                tone="danger"
                icon={<DeleteOutlined />}
                loading={isDeleting && activeDeleteId === record.id}
              >
                Delete
              </TableActionButton>
            </Popconfirm>
          </TableActionGroup>
        ),
      },
    ],
    [
      handleDeleteEnquiry,
      handleEnquiryStatusUpdate,
      hasRole,
      isDeleting,
      isUpdatingStatus,
      activeDeleteId,
      activeStatusUpdate,
    ],
  );

  return (
    <PageContainer title={'Enquiry'}>
      <ProTable<Enquiry>
        rowKey="id"
        headerTitle="Enquiry List"
        actionRef={actionRef}
        loading={isLoading}
        columns={columns}
        dataSource={enquiryData?.data ?? []}
        pagination={{
          pageSize: 20,
        }}
        request={(params: any) => {
          setFilters({
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            status: params.status,
            subject: params.subject,
          });
          return Promise.resolve({
            data: enquiryData?.data ?? [],
            success: true,
            total: enquiryData?.totalCount ?? 0,
          });
        }}
        options={{
          reload: () => refetch(),
        }}
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalOpen(true);
            }}
          >
            <PlusOutlined /> New
          </Button>,
        ]}
      />

      <EnquiryDetailDrawer
        enquiryId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        currentUserId={user?.id ?? ''}
        updateStatus={handleEnquiryStatusUpdate}
      />

      <CreateEnquiryModal
        onCancel={() => {
          setCreateModalOpen(false);
        }}
        onSubmit={handleCreateEnquiry}
        visible={createModalOpen}
      />
    </PageContainer>
  );
};
