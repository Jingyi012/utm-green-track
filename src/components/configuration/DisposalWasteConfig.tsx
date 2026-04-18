import { useState } from 'react';
import {
  ProCard,
  ProTable,
  ModalForm,
  ProFormDigit,
  PageContainer,
} from '@ant-design/pro-components';
import { Alert, App, Button, Form } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { WasteTypeWithEmissionFactor } from '@/lib/types/typing';
import { useDisposalMethodList } from '@/hook/disposalMethods';
import { useUpdateWasteType } from '@/hook/configurations';

export default function DisposalWasteConfig() {
  const { message } = App.useApp();
  const [editingWaste, setEditingWaste] = useState<WasteTypeWithEmissionFactor | null>(null);
  const [wasteTypeModalFormOpen, setWasteTypeModalFormOpen] = useState(false);

  const {
    data: disposalMethods = [],
    isLoading: isFetching,
    error: disposalError,
  } = useDisposalMethodList();

  const { mutateAsync: updateWasteTypeMutation, isPending: isUpdating } = useUpdateWasteType();

  const loading = isFetching || isUpdating;

  const closeModal = () => {
    setEditingWaste(null);
    setWasteTypeModalFormOpen(false);
  };

  const handleUpdateWasteType = async (emissionFactor: number) => {
    if (!editingWaste) {
      message.error('No waste type selected');
      return false;
    }

    try {
      await updateWasteTypeMutation({
        id: editingWaste.id,
        name: editingWaste.name,
        emissionFactor,
      });

      closeModal();
      return true;
    } catch (err: any) {
      message.error(err?.message || 'Failed to update waste type');
      return false;
    }
  };

  return (
    <PageContainer
      title="Disposal Methods & Waste Types Configuration"
      style={{ minHeight: '500px' }}
    >
      <div className="grid gap-4">
        {disposalError && (
          <Alert
            type="error"
            showIcon
            message="Unable to load disposal methods"
            description={
              disposalError instanceof Error
                ? disposalError.message
                : 'Error fetching disposal methods and waste types'
            }
          />
        )}

        {disposalMethods.map((method) => (
          <ProCard key={method.id} title={method.name} loading={loading} bordered collapsible>
            <ProTable<WasteTypeWithEmissionFactor>
              rowKey="id"
              dataSource={method.wasteTypes}
              pagination={false}
              search={false}
              toolBarRender={false}
              columns={[
                {
                  title: 'Waste Type',
                  dataIndex: 'name',
                  width: 350,
                },
                {
                  title: 'Emission Factor (kg CO₂eq/ton)',
                  dataIndex: 'emissionFactor',
                },
                {
                  title: 'Actions',
                  valueType: 'option',
                  render: (_, record) => [
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingWaste(record);
                        setWasteTypeModalFormOpen(true);
                      }}
                    />,
                  ],
                },
              ]}
            />
          </ProCard>
        ))}

        <ModalForm<{ emissionFactor: number }>
          title={`Edit Emission Factor: ${editingWaste?.name ?? ''}`}
          open={wasteTypeModalFormOpen}
          initialValues={{
            emissionFactor: editingWaste?.emissionFactor,
          }}
          modalProps={{
            destroyOnHidden: true,
            onCancel: closeModal,
          }}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
          onFinish={async (values) => {
            return await handleUpdateWasteType(values.emissionFactor);
          }}
          submitter={{
            searchConfig: {
              submitText: 'Submit',
            },
          }}
        >
          <Form.Item label="Waste Type Name" className="mb-4">
            <span className="font-medium text-gray-700">{editingWaste?.name}</span>
          </Form.Item>

          <ProFormDigit
            name="emissionFactor"
            label="Emission Factor (kg CO₂eq/ton)"
            rules={[{ required: true, message: 'Please enter emission factor' }]}
            min={0}
          />
        </ModalForm>
      </div>
    </PageContainer>
  );
}
