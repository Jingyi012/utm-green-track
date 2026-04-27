import { Col, Row } from 'antd';
import { useMemo, useState } from 'react';
import { WasteBreakdownItem, WasteBreakdownModal } from '@/components/analyticsShared/WasteBreakdownModal';
import InfoCard from './InfoCard';

interface InfoCardGridProps {
  totalWasteGenerated: number;
  totalWasteDiverted: number;
  totalWasteToLandfill: number;
  wasteDiversionRate: number;
  wasteRecyclingRate: number;
  totalGhgReduction: number;
  wasteTypeBreakdownByDisposalMethod: WasteBreakdownItem[];
}

type BreakdownType = 'generated' | 'diverted' | 'landfill' | 'diversionRate' | 'recyclingRate' | null;

export default function InfoCardGrid({
  totalWasteGenerated,
  totalWasteDiverted,
  totalWasteToLandfill,
  wasteDiversionRate,
  wasteRecyclingRate,
  totalGhgReduction,
  wasteTypeBreakdownByDisposalMethod,
}: InfoCardGridProps) {
  const [activeBreakdown, setActiveBreakdown] = useState<BreakdownType>(null);

  const format = (n: number) => n.toFixed(2);

  const getBreakdownData = (type: Exclude<BreakdownType, null>) => {
    const allowedMethods = ['Recycling', 'Composting', 'Energy Recovery'];

    switch (type) {
      case 'generated':
        return {
          title: 'Breakdown: Total Waste Generated',
          items: wasteTypeBreakdownByDisposalMethod,
          isRate: false,
        };

      case 'diverted':
        return {
          title: 'Breakdown: Total Waste Diverted',
          items: wasteTypeBreakdownByDisposalMethod.filter((x) =>
            allowedMethods.includes(x.disposalMethod),
          ),
          isRate: false,
        };

      case 'landfill':
        return {
          title: 'Breakdown: Total Waste to Landfill',
          items: wasteTypeBreakdownByDisposalMethod.filter((x) => x.disposalMethod === 'Landfilling'),
          isRate: false,
        };

      case 'diversionRate':
        return {
          title: 'Breakdown: Waste Diversion Rate',
          items: wasteTypeBreakdownByDisposalMethod.filter((x) =>
            allowedMethods.includes(x.disposalMethod),
          ),
          isRate: true,
        };

      case 'recyclingRate':
        return {
          title: 'Breakdown: Waste Recycling Rate',
          items: wasteTypeBreakdownByDisposalMethod.filter((x) => x.disposalMethod === 'Recycling'),
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

    return getBreakdownData(activeBreakdown);
  }, [activeBreakdown, wasteTypeBreakdownByDisposalMethod]);

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
      value: format(totalWasteDiverted),
      unit: 'Tonnes',
      showMore: true,
      onShowMore: () => setActiveBreakdown('diverted'),
    },
    {
      icon: <img src="/icons/totalWasteToLandfill.png" alt="" width={50} height={50} />,
      itemLabel: 'Total Waste to Landfill',
      value: format(totalWasteToLandfill),
      unit: 'Tonnes',
      showMore: true,
      onShowMore: () => setActiveBreakdown('landfill'),
    },
    {
      icon: <img src="/icons/totalWasteReduction.png" alt="" width={50} height={50} />,
      itemLabel: 'Waste Diversion Rate',
      value: format(wasteDiversionRate),
      unit: '%',
      showMore: true,
      onShowMore: () => setActiveBreakdown('diversionRate'),
    },
    {
      icon: <img src="/icons/totalWasteReduction.png" alt="" width={50} height={50} />,
      itemLabel: 'Waste Recycling Rate',
      value: format(wasteRecyclingRate),
      unit: '%',
      showMore: true,
      onShowMore: () => setActiveBreakdown('recyclingRate'),
    },
    {
      icon: <img src="/icons/totalGHGReduction.png" alt="" width={50} height={50} />,
      itemLabel: 'Est. GHG Reduction',
      value: format(totalGhgReduction),
      unit: 'kg CO2e',
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

      <WasteBreakdownModal
        open={!!activeBreakdown}
        onClose={() => setActiveBreakdown(null)}
        title={modalData?.title ?? ''}
        items={(modalData?.items ?? []) as WasteBreakdownItem[]}
        totalWasteGenerated={totalWasteGenerated}
        displayMode={modalData?.isRate ? 'rate' : 'weight'}
      />
    </>
  );
}
