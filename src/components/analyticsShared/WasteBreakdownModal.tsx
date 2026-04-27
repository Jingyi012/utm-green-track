import { Collapse, Divider, Modal, Table, Typography } from 'antd';
import { useMemo } from 'react';

const { Title } = Typography;

export interface WasteBreakdownItem {
  disposalMethod: string;
  wasteType: string;
  totalWeightTonnes: number;
}

interface WasteBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  items: WasteBreakdownItem[];
  totalWasteGenerated: number;
  displayMode?: 'weight' | 'rate';
}

export function WasteBreakdownModal({
  open,
  onClose,
  title,
  items,
  totalWasteGenerated,
  displayMode = 'weight',
}: WasteBreakdownModalProps) {
  const modalData = useMemo(() => {
    const grouped = items.reduce<Record<string, WasteBreakdownItem[]>>((acc, item) => {
      if (!acc[item.disposalMethod]) {
        acc[item.disposalMethod] = [];
      }

      acc[item.disposalMethod].push(item);
      return acc;
    }, {});

    const summary = Object.entries(grouped).map(([disposalMethod, groupItems]) => ({
      disposalMethod,
      weight: groupItems.reduce((sum, item) => sum + item.totalWeightTonnes, 0),
    }));

    const renderValue = (value: number) => {
      if (displayMode === 'rate') {
        if (!totalWasteGenerated) {
          return '0.00%';
        }

        return `${((value / totalWasteGenerated) * 100).toFixed(2)}%`;
      }

      return value.toFixed(2);
    };

    const detailColumns = [
      { title: 'Waste Type', dataIndex: 'wasteType' },
      {
        title: displayMode === 'rate' ? 'Rate' : 'Weight (Tonnes)',
        dataIndex: 'totalWeightTonnes',
        render: (value: number) => renderValue(value),
      },
    ];

    const summaryColumns = [
      { title: 'Disposal Method', dataIndex: 'disposalMethod' },
      {
        title: displayMode === 'rate' ? 'Total Rate' : 'Total (Tonnes)',
        dataIndex: 'weight',
        render: (value: number) => renderValue(value),
      },
    ];

    const collapseItems = Object.entries(grouped).map(([disposalMethod, groupItems]) => ({
      key: disposalMethod,
      label: disposalMethod,
      children: (
        <Table
          dataSource={groupItems}
          pagination={false}
          columns={detailColumns}
          rowKey={(row) => `${disposalMethod}-${row.wasteType}`}
        />
      ),
    }));

    return { summary, summaryColumns, collapseItems };
  }, [displayMode, items, totalWasteGenerated]);

  return (
    <Modal title={title} open={open} onCancel={onClose} footer={null} width={700}>
      <Title level={4}>Summary by Disposal Method</Title>
      <Table
        dataSource={modalData.summary}
        pagination={false}
        columns={modalData.summaryColumns}
        rowKey={(row) => row.disposalMethod}
        style={{ marginBottom: 20 }}
      />

      <Divider />

      <Title level={4}>Detailed Breakdown</Title>
      <Collapse accordion items={modalData.collapseItems} />
    </Modal>
  );
}
