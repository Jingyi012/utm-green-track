import { Department } from '@/lib/types/typing';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space } from 'antd';
import { useMemo, useState } from 'react';
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartmentList,
  useUpdateDepartment,
} from '@/hook/departments';

type ModalMode = 'create' | 'edit' | null;

type DepartmentFormValues = {
  id?: string;
  name: string;
};

export const DepartmentConfig: React.FC = () => {
  const { message } = App.useApp();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const { data: departments = [], isLoading: isFetching, refetch } = useDepartmentList();

  const { mutateAsync: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutateAsync: updateDepartment, isPending: isUpdating } = useUpdateDepartment();
  const { mutateAsync: deleteDepartment, isPending: isDeleting } = useDeleteDepartment();

  const loading = isFetching || isCreating || isUpdating || isDeleting;
  const isModalOpen = modalMode !== null;
  const isEditMode = modalMode === 'edit';

  const closeModal = () => {
    setModalMode(null);
    setSelectedDepartment(null);
  };

  const columns: ProColumns<Department>[] = useMemo(
    () => [
      {
        title: 'No.',
        dataIndex: 'index',
        width: 80,
        render: (_text, _record, index) => index + 1,
      },
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Action',
        valueType: 'option',
        width: 120,
        render: (_text, record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedDepartment(record);
                setModalMode('edit');
              }}
            />
            <Popconfirm
              title="Delete this department?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                try {
                  await deleteDepartment(record.id);
                } catch (error: any) {
                  message.error(error?.message || 'Failed to delete department');
                }
              }}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteDepartment, message],
  );

  return (
    <PageContainer title="Departments Configuration" style={{ minHeight: '500px' }}>
      <ProTable<Department>
        rowKey="id"
        headerTitle="Departments"
        loading={loading}
        columns={columns}
        dataSource={departments}
        search={false}
        pagination={false}
        options={{
          reload: () => refetch(),
        }}
        toolBarRender={() => [
          <Button
            key="add-department"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedDepartment(null);
              setModalMode('create');
            }}
          >
            Add Department
          </Button>,
        ]}
      />

      <ModalForm<DepartmentFormValues>
        title={isEditMode ? 'Edit Department' : 'Add Department'}
        open={isModalOpen}
        initialValues={
          isEditMode && selectedDepartment
            ? {
                id: selectedDepartment.id,
                name: selectedDepartment.name,
              }
            : {
                name: '',
              }
        }
        modalProps={{
          destroyOnHidden: true,
          onCancel: closeModal,
        }}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        onFinish={async (values) => {
          try {
            if (isEditMode) {
              if (!values.id) {
                message.error('Department id is missing');
                return false;
              }

              await updateDepartment({
                id: values.id,
                name: values.name,
              });
            } else {
              await createDepartment({
                name: values.name,
              });
            }

            closeModal();
            return true;
          } catch (error: any) {
            message.error(
              error?.message ||
                (isEditMode ? 'Failed to update department' : 'Failed to create department'),
            );
            return false;
          }
        }}
        submitter={{
          searchConfig: {
            submitText: isEditMode ? 'Update' : 'Create',
          },
        }}
      >
        <ProFormText
          label="Name"
          name="name"
          placeholder="Enter department name"
          rules={[{ required: true, message: 'Please enter department name' }]}
        />
        <ProFormText name="id" hidden />
      </ModalForm>
    </PageContainer>
  );
};
