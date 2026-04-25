import { Col, Row, Typography, Table, Divider, Collapse } from 'antd';
import { useMemo, useState } from 'react';
import InfoCard from './InfoCard';
import { BreakdownModal } from './BreakdownModal';

const { Title } = Typography;

interface WasteBreakdown {
  disposalMethod: string;
  wasteType: string;
  totalWeight: number;
}

interface InfoCardGridProps {
  totalWasteGenerated: number;
  totalWasteRecycled: number;
  totalWasteToLandfill: number;
  totalGhgReduction: number;
  totalLandfillCostSavings: number;
  wasteTypeTotals: WasteBreakdown[];
}

type BreakdownType = 'generated' | 'diverted' | 'diversionRate' | null;

interface BreakdownSummary {
  disposalMethod: string;
  weight: number;
}

export default function InfoCardGrid({
  totalWasteGenerated,
  totalWasteRecycled,
  totalWasteToLandfill,
  totalGhgReduction,
  wasteTypeTotals,
}: InfoCardGridProps) {
  const [activeBreakdown, setActiveBreakdown] = useState<BreakdownType>(null);

  const format = (n: number) => n.toFixed(2);

  const formatRate = (n: number, divider: number) => {
    if (!divider) return '0.00';
    return ((n / divider) * 100).toFixed(2);
  };

  const groupByDisposalMethod = (items: WasteBreakdown[]) => {
    return items.reduce<Record<string, WasteBreakdown[]>>((acc, item) => {
      if (!acc[item.disposalMethod]) {
        acc[item.disposalMethod] = [];
      }
      acc[item.disposalMethod].push(item);
      return acc;
    }, {});
  };

  const getBreakdownData = (type: Exclude<BreakdownType, null>) => {
    const allowedMethods = ['Recycling', 'Composting', 'Energy Recovery'];

    switch (type) {
      case 'generated':
        return {
          title: 'Breakdown: Total Waste Generated',
          items: wasteTypeTotals,
          isRate: false,
        };

      case 'diverted':
        return {
          title: 'Breakdown: Total Waste Diverted',
          items: wasteTypeTotals.filter((x) => allowedMethods.includes(x.disposalMethod)),
          isRate: false,
        };

      case 'diversionRate':
        return {
          title: 'Breakdown: Waste Diversion Rate',
          items: wasteTypeTotals.filter((x) => allowedMethods.includes(x.disposalMethod)),
          isRate: true,
        };

      default:
        return {
          title: '',
          items: [],
          isRate: false,
        };
    }
  };

  const modalData = useMemo(() => {
    if (!activeBreakdown) return null;

    const { title, items, isRate } = getBreakdownData(activeBreakdown);
    const grouped = groupByDisposalMethod(items);

    const summary: BreakdownSummary[] = Object.entries(grouped).map(([method, list]) => ({
      disposalMethod: method,
      weight: list.reduce((sum, x) => sum + x.totalWeight, 0),
    }));

    const renderValue = (value: number) =>
      isRate ? `${formatRate(value, totalWasteGenerated)}%` : format(value);

    const detailColumns = [
      { title: 'Waste Type', dataIndex: 'wasteType' },
      {
        title: isRate ? 'Rate' : 'Weight (Tonnes)',
        dataIndex: 'totalWeight',
        render: (value: number) => renderValue(value),
      },
    ];

    const summaryColumns = [
      { title: 'Disposal Method', dataIndex: 'disposalMethod' },
      {
        title: isRate ? 'Total Rate' : 'Total (Tonnes)',
        dataIndex: 'weight',
        render: (value: number) => renderValue(value),
      },
    ];

    const collapseItems = Object.entries(grouped).map(([method, list]) => ({
      key: method,
      label: method,
      children: (
        <Table
          dataSource={list}
          pagination={false}
          columns={detailColumns}
          rowKey={(row) => `${method}-${row.wasteType}`}
        />
      ),
    }));

    return {
      title,
      content: (
        <div>
          <Title level={4}>Summary by Disposal Method</Title>
          <Table
            dataSource={summary}
            pagination={false}
            columns={summaryColumns}
            rowKey={(row) => row.disposalMethod}
            style={{ marginBottom: 20 }}
          />

          <Divider />

          <Title level={4}>Detailed Breakdown</Title>
          <Collapse accordion items={collapseItems} />
        </div>
      ),
    };
  }, [activeBreakdown, totalWasteGenerated, wasteTypeTotals]);

  const cardData = [
    {
      icon: <img src="/icons/totalWasteGenerated.png" alt="" width={50} height={50} />,
      itemLabel: 'Total Waste Generated',
      value: format(totalWasteGenerated),
      unit: 'Tonnes',
      showMore: true,
      onShowMore: () => setActiveBreakdown('generated'),
    },
    {
      icon: <img src="/icons/totalWasteReduction.png" alt="" width={50} height={50} />,
      itemLabel: 'Total Waste Diverted',
      value: format(totalWasteRecycled),
      unit: 'Tonnes',
      showMore: true,
      onShowMore: () => setActiveBreakdown('diverted'),
    },
    {
      icon: <img src="/icons/totalWasteToLandfill.png" alt="" width={50} height={50} />,
      itemLabel: 'Total Waste to Landfill',
      value: format(totalWasteToLandfill),
      unit: 'Tonnes',
    },
    {
      icon: <img src="/icons/totalWasteReduction.png" alt="" width={50} height={50} />,
      itemLabel: 'Waste Diversion Rate',
      value: formatRate(totalWasteRecycled, totalWasteGenerated),
      unit: '%',
      showMore: true,
      onShowMore: () => setActiveBreakdown('diversionRate'),
    },
    {
      icon: <img src="/icons/totalGHGReduction.png" alt="" width={50} height={50} />,
      itemLabel: 'Est. GHG Reduction',
      value: format(totalGhgReduction),
      unit: 'kg CO₂e',
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]}>
        {cardData.map((item) => (
          <Col xs={24} sm={12} md={8} key={item.itemLabel}>
            <InfoCard {...item} />
          </Col>
        ))}
      </Row>

      <BreakdownModal
        open={!!activeBreakdown}
        onClose={() => setActiveBreakdown(null)}
        title={modalData?.title ?? ''}
      >
        {modalData?.content}
      </BreakdownModal>
    </>
  );
}
