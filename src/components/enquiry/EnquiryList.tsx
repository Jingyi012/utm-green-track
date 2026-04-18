import { EnquiryStatus, enquiryStatusLabels } from '@/lib/enum/status';
import { Enquiry, EnquiryInput } from '@/lib/types/typing';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space } from 'antd';
import { useState, useRef } from 'react';
import { EnquiryDetailDrawer } from './EnquiryDetailDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { CreateEnquiryModal } from './CreateEnquiryModal';
import { PlusOutlined } from '@ant-design/icons';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import {
  useEnquiryList,
  useCreateEnquiry,
  useUpdateEnquiryStatus,
  useDeleteEnquiry,
  enquiryQueryKeys,
} from '@/hook/enquiry';
import { useQueryClient } from '@tanstack/react-query';

export const EnquiryList: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 20,
    status: undefined as number | undefined,
    subject: undefined as string | undefined,
  });
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { user, hasRole } = useAuth();

  const { data: enquiryData, isLoading, error, refetch } = useEnquiryList(filters);
  const { mutate: deleteEnquiryMutate, isPending: isDeleting } = useDeleteEnquiry();

  const columns: ProColumns<Enquiry>[] = [
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
        <Space size="middle">
          <Button type="link" onClick={() => setSelectedId(record.id)}>
            View{' '}
          </Button>

          {record.status === EnquiryStatus.Open && hasRole('Admin') && (
            <Button
              variant="link"
              color="cyan"
              onClick={() => handleEnquiryStatusUpdate(record.id, EnquiryStatus.Closed)}
            >
              {' '}
              Close{' '}
            </Button>
          )}

          {record.status === EnquiryStatus.Closed && hasRole('Admin') && (
            <Button
              variant="link"
              color="orange"
              onClick={() => handleEnquiryStatusUpdate(record.id, EnquiryStatus.Open)}
            >
              {' '}
              Reopen{' '}
            </Button>
          )}

          <Popconfirm
            title="Are you sure you want to delete this enquiry?"
            onConfirm={() => handleDeleteEnquiry(record.id)}
          >
            <Button type="link" danger loading={isDeleting}>
              {' '}
              Delete{' '}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const { mutate: createEnquiryMutate, isPending: isCreating } = useCreateEnquiry();
  const { mutate: updateStatusMutate, isPending: isUpdatingStatus } = useUpdateEnquiryStatus();

  const handleDeleteEnquiry = (id: string) => {
    deleteEnquiryMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: enquiryQueryKeys.lists() });
      },
    });
  };

  const handleCreateEnquiry = async (values: EnquiryInput) => {
    return new Promise<boolean>((resolve) => {
      createEnquiryMutate(values, {
        onSuccess: () => {
          setCreateModalOpen(false);
          resolve(true);
        },
        onError: () => {
          resolve(false);
        },
      });
    });
  };

  const handleEnquiryStatusUpdate = (id: string, status: number) => {
    updateStatusMutate(
      { enquiryId: id, status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: enquiryQueryKeys.lists() });
        },
      },
    );
  };

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
