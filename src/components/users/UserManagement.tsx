import { useProfileDropdownOptions } from '@/hook/options';
import { UserDetails } from '@/lib/types/typing';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { App, Button, Modal, Popconfirm } from 'antd';
import { useState, useRef } from 'react';
import UserDetailsDrawerForm from './UserDetailsDrawerForm';
import {
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { getBaseUserColumns } from './columns';
import { downloadFile } from '@/lib/utils/downloadFile';
import { exportExcelUsers, exportPdfUsers } from '@/lib/services/user';
import { useUserList, useUpdateUser, useDeleteUser } from '@/hook/users';
import { TableActionButton, TableActionGroup } from '@/components/table/TableAction';

const UserManagement: React.FC = () => {
  const { message } = App.useApp();
  const { positions, departments, roles, isLoading } = useProfileDropdownOptions();
  const [selectedUser, setSelectedUser] = useState<UserDetails>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [excelLoading, setExcelLoading] = useState<boolean>(false);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 20,
  });

  const actionRef = useRef<ActionType | undefined>(undefined);

  const { data: userData, isLoading: isFetching, refetch } = useUserList(filters);
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();

  const handleUserUpdate = async (user: UserDetails) => {
    try {
      await updateUser({
        userId: user.id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        staffMatricNo: user.staffMatricNo,
        departmentId: user.departmentId,
        positionId: user.positionId,
        roleIds: user.roleIds,
        status: user.status,
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteUser = (userId: string) => {
    return deleteUser(userId);
  };

  const columns: ProColumns<UserDetails>[] = [
    ...getBaseUserColumns({ positions, departments, roles }),
    {
      title: 'Action',
      width: 210,
      fixed: 'right',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <TableActionGroup>
            <TableActionButton
              tone="edit"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setModalOpen(true);
                setEditMode(true);
              }}
              loading={isUpdating}
            >
              Edit
            </TableActionButton>
            <Popconfirm
              title="Delete this user?"
              onConfirm={async () => {
                handleDeleteUser(record.id);
              }}
            >
              <TableActionButton
                tone="danger"
                icon={<DeleteOutlined />}
                loading={isDeleting}
              >
                Delete
              </TableActionButton>
            </Popconfirm>
          </TableActionGroup>
        );
      },
    },
  ];

  const handleExportExcel = async () => {
    const hide = message.loading('Generating Excel...', 0);
    try {
      setExcelLoading(true);
      const response = await exportExcelUsers();
      const contentDisposition = response.headers['content-disposition'];
      downloadFile(response.data, contentDisposition, 'User_Records.xlsx');
    } catch {
      message.error('Failed to generate Excel');
    } finally {
      setExcelLoading(false);
      hide();
    }
  };

  const handleExportPDF = async () => {
    const hide = message.loading('Generating Pdf...', 0);
    try {
      setPdfLoading(true);
      const response = await exportPdfUsers();
      const contentDisposition = response.headers['content-disposition'];
      downloadFile(response.data, contentDisposition, 'User_Records.pdf');
    } catch {
      message.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
      hide();
    }
  };

  return (
    <PageContainer title={'User Management'}>
      <ProTable<UserDetails>
        rowKey="id"
        headerTitle="User List"
        actionRef={actionRef}
        loading={isFetching || isLoading}
        tableLayout="fixed"
        scroll={{ x: 1600 }}
        columnsState={{
          persistenceKey: 'user-management-columns',
          persistenceType: 'localStorage',
        }}
        columns={columns}
        pagination={{}}
        dataSource={userData?.data ?? []}
        request={(params: { current?: number; pageSize?: number; [key: string]: unknown }) => {
          setFilters({
            ...params,
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
          });
          return Promise.resolve({
            data: userData?.data ?? [],
            success: true,
            total: userData?.totalCount ?? 0,
          });
        }}
        options={{
          reload: () => refetch(),
        }}
        toolbar={{
          actions: [
            <Button
              key="excel"
              loading={excelLoading}
              icon={<FileExcelOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Export to Excel',
                  content: 'Are you sure you want to export all user as Excel?',
                  okText: 'Yes, Export',
                  cancelText: 'Cancel',
                  onOk: handleExportExcel,
                });
              }}
            >
              Excel
            </Button>,

            <Button
              key="pdf"
              loading={pdfLoading}
              icon={<FilePdfOutlined />}
              danger
              onClick={() => {
                Modal.confirm({
                  title: 'Export to PDF',
                  content: 'Are you sure you want to export all user as PDF?',
                  okText: 'Yes, Export',
                  cancelText: 'Cancel',
                  onOk: handleExportPDF,
                });
              }}
            >
              PDF
            </Button>,
          ],
        }}
        search={{
          labelWidth: 'auto',
        }}
      />

      <UserDetailsDrawerForm
        departments={departments}
        positions={positions}
        roles={roles}
        onCancel={() => {
          setModalOpen(false);
          setEditMode(false);
          setTimeout(() => setSelectedUser(undefined), 300);
        }}
        onSubmit={async (value) => {
          const success = await handleUserUpdate(value as UserDetails);
          return success;
        }}
        visible={modalOpen}
        initialValues={selectedUser || {}}
        isEditMode={editMode}
      />
    </PageContainer>
  );
};

export default UserManagement;
