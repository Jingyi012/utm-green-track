import { Col, Empty, Row, Space } from 'antd';
import { useMemo, useState } from 'react';
import { Pie } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { WasteGenerationAnalysisSection as WasteGenerationData } from '@/lib/types/dataAnalytics';
import { DISPOSAL_METHOD_COLOR_SCALE } from '@/lib/utils/disposalMethodChart';
import { MetricCardGrid } from './MetricCardGrid';
import { formatFixed, formatPopulation } from './helpers';
import { WasteGenerationTrendChart } from './charts/WasteGenerationTrendChart';
import { WasteBreakdownModal } from '@/components/analyticsShared/WasteBreakdownModal';

interface WasteGenerationSectionProps {
  data: WasteGenerationData;
}

type BreakdownType = 'generated' | 'diverted' | 'landfill' | null;

export function WasteGenerationSection({ data }: WasteGenerationSectionProps) {
  const [activeBreakdown, setActiveBreakdown] = useState<BreakdownType>(null);

  const metrics = [
    {
      key: 'total-generated',
      title: 'Total Waste Generated',
      value: formatFixed(data.totalWasteGeneratedTonnes),
      unit: 'tonnes',
      showMore: true,
      onShowMore: () => setActiveBreakdown('generated'),
    },
    {
      key: 'total-diverted',
      title: 'Total Waste Diverted',
      value: formatFixed(data.totalWasteDivertedTonnes),
      unit: 'tonnes',
      showMore: true,
      onShowMore: () => setActiveBreakdown('diverted'),
    },
    {
      key: 'total-landfill',
      title: 'Total Waste to Landfill',
      value: formatFixed(data.totalWasteToLandfillTonnes),
      unit: 'tonnes',
      showMore: true,
      onShowMore: () => setActiveBreakdown('landfill'),
    },
    {
      key: 'waste-per-capita',
      title: 'Est. Waste Per Capita',
      value: formatFixed(data.estimatedWastePerCapitaKgPerPersonPerDay),
      unit: 'kg/person/day',
    },
    {
      key: 'population',
      title: 'Campus Population',
      value: formatPopulation(data.campusPopulation),
      unit: 'persons',
    },
  ];

  const disposalMethodBreakdownData = data.disposalMethodBreakdown.filter(
    (item) => item.totalWeightTonnes > 0,
  );

  const disposalMethodBreakdownConfig = {
    title: 'Disposal Method Breakdown',
    data: disposalMethodBreakdownData,
    angleField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    radius: 0.8,
    innerRadius: 0.55,
    legend: { position: 'bottom' },
    label: {
      text: (datum: { disposalMethod: string; percentage: number }) =>
        `${datum.disposalMethod} (${datum.percentage.toFixed(2)}%)`,
      position: 'spider',
    },
    annotations: [
      {
        type: 'text',
        style: {
          text: `Total\n${formatFixed(disposalMethodBreakdownData.reduce((sum, item) => sum + item.totalWeightTonnes, 0))} Tonnes`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 16,
          fontStyle: 'bold',
        },
        tooltip: false,
      },
    ],
    tooltip: {
      items: [
        (datum: { totalWeightTonnes: number }) => ({
          value: `${formatFixed(datum.totalWeightTonnes)} tonnes`,
        }),
      ],
    },
  };

  const breakdownData = useMemo(() => {
    if (!activeBreakdown) {
      return null;
    }

    const diversionMethods = ['Recycling', 'Composting', 'Energy Recovery'];

    switch (activeBreakdown) {
      case 'generated':
        return {
          title: 'Breakdown: Total Waste Generated',
          items: data.wasteTypeBreakdownByDisposalMethod,
        };
      case 'diverted':
        return {
          title: 'Breakdown: Total Waste Diverted',
          items: data.wasteTypeBreakdownByDisposalMethod.filter((item) =>
            diversionMethods.includes(item.disposalMethod),
          ),
        };
      case 'landfill':
        return {
          title: 'Breakdown: Total Waste to Landfill',
          items: data.wasteTypeBreakdownByDisposalMethod.filter(
            (item) => item.disposalMethod === 'Landfilling',
          ),
        };
      default:
        return null;
    }
  }, [activeBreakdown, data.wasteTypeBreakdownByDisposalMethod]);

  return (
    <>
      <ProCard direction="column" ghost>
        <Space
          direction="vertical"
          size={16}
          style={{ width: '100%' }}
          styles={{ item: { width: '100%' } }}
        >
          <div data-analytics-export-section="waste-generation-metrics">
            <MetricCardGrid items={metrics} />
          </div>

          <div data-analytics-export-section="waste-generation-trend">
            <ProCard bordered>
              <WasteGenerationTrendChart
                data={data.wasteGenerationTrend}
                title="Waste Generation Trend (By Month)"
              />
            </ProCard>
          </div>

          <div data-analytics-export-section="waste-generation-breakdown">
            <ProCard bordered>
              {disposalMethodBreakdownData.length > 0 ? (
                <Pie {...disposalMethodBreakdownConfig} />
              ) : (
                <Empty />
              )}
            </ProCard>
          </div>
        </Space>
      </ProCard>

      <WasteBreakdownModal
        open={!!activeBreakdown}
        onClose={() => setActiveBreakdown(null)}
        title={breakdownData?.title ?? ''}
        items={breakdownData?.items ?? []}
        totalWasteGenerated={data.totalWasteGeneratedTonnes}
      />
    </>
  );
}
