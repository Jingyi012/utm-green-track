import { Button, Card, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import { WasteRecordDraftInput } from '@/lib/types/wasteRecord';

const { Text } = Typography;

type Props = {
  tableData: WasteRecordDraftInput[];
  totalWeight: number;
  selectedRowKeys: Key[];
  columns: ColumnsType<WasteRecordDraftInput>;
  onSelectionChange: (keys: Key[]) => void;
  onSubmitAll: () => void;
  onSubmitSelected: () => void;
  onDeleteSelected: () => void;
};

export default function WasteEntryRecordsCard({
  tableData,
  totalWeight,
  selectedRowKeys,
  columns,
  onSelectionChange,
  onSubmitAll,
  onSubmitSelected,
  onDeleteSelected,
}: Props) {
  return (
    <Card>
      <div
        style={{
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Space wrap>
          <Text strong>{`Records: ${tableData.length}`}</Text>
          <Text strong>{`Total Weight: ${totalWeight.toFixed(2)} kg`}</Text>
        </Space>
        {selectedRowKeys.length > 0 && (
          <Space wrap>
            <Button type="primary" onClick={onSubmitSelected}>
              Submit Selected ({selectedRowKeys.length})
            </Button>
            <Button danger onClick={onDeleteSelected}>
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </Space>
        )}
      </div>

      <Table<WasteRecordDraftInput>
        dataSource={tableData}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => onSelectionChange(keys),
        }}
        pagination={false}
        bordered
        scroll={{ x: 1500 }}
        style={{ marginBottom: 16 }}
      />

      <div className="flex justify-center">
        <Button type="primary" onClick={onSubmitAll} disabled={tableData.length === 0}>
          Submit All Records
        </Button>
      </div>
    </Card>
  );
}
