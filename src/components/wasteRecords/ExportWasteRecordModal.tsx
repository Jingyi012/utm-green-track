import { Modal, Space } from 'antd';
import dayjs from 'dayjs';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';

interface ExportWasteRecordModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (year: number, month: number) => void;
  type: 'excel' | 'pdf';
}

export const ExportWasteRecordModal = ({
  open,
  onCancel,
  onConfirm,
  type,
}: ExportWasteRecordModalProps) => {
  const startYear = 2020;
  const currentYear = dayjs().year();
  const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
    const year = startYear + index;
    return { label: year, value: year };
  }).reverse();

  const handleFinish = (values: any) => {
    onConfirm(values.year, values.month);
    onCancel();
  };

  return (
    <Modal
      title={`Select Year & Month for ${type.toUpperCase()} Export`}
      open={open}
      footer={null}
      onCancel={onCancel}
    >
      <ProForm
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ year: currentYear, month: 0 }}
        submitter={{
          searchConfig: { submitText: 'Export' },
          render: (props, dom) => (
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <div style={{ display: 'inline-block' }}>
                <Space size="small">{dom}</Space>
              </div>
            </div>
          ),
        }}
      >
        <ProFormSelect
          name="year"
          label="Year"
          rules={[{ required: true }]}
          options={yearOptions}
        />

        <ProFormSelect
          name="month"
          label="Month"
          rules={[{ required: true }]}
          options={[
            { label: 'All Months', value: 0 },
            ...Array.from({ length: 12 }, (_, i) => ({
              label: dayjs().month(i).format('MMMM'),
              value: i + 1,
            })),
          ]}
        />
      </ProForm>
    </Modal>
  );
};
