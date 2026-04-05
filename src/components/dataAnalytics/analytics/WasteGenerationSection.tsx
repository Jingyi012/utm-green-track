import { Col, Empty, Row, Space } from 'antd';
import { Column, Pie } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { WasteGenerationAnalysisSection as WasteGenerationData } from '@/lib/types/dataAnalytics';
import { DISPOSAL_METHOD_COLOR_SCALE } from '@/lib/utils/disposalMethodChart';
import { MetricCardGrid } from './MetricCardGrid';
import { formatFixed, formatPopulation, monthLabel } from './helpers';

interface WasteGenerationSectionProps {
  data: WasteGenerationData;
}

export function WasteGenerationSection({ data }: WasteGenerationSectionProps) {
  const metrics = [
    {
      key: 'total-generated',
      title: 'Total Waste Generated',
      value: formatFixed(data.totalWasteGeneratedTonnes),
      unit: 'tonnes',
    },
    {
      key: 'total-diverted',
      title: 'Total Waste Diverted',
      value: formatFixed(data.totalWasteDivertedTonnes),
      unit: 'tonnes',
    },
    {
      key: 'total-landfill',
      title: 'Total Waste to Landfill',
      value: formatFixed(data.totalWasteToLandfillTonnes),
      unit: 'tonnes',
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

  const trendData = data.wasteGenerationTrend.map((item) => ({
    ...item,
    monthLabel: monthLabel(item.month),
  }));

  const disposalMethodBreakdownData = data.disposalMethodBreakdown.filter(
    (item) => item.totalWeightTonnes > 0,
  );

  const wasteGenerationTrendConfig = {
    title: 'Waste Generation Trend (By Month)',
    data: trendData,
    xField: 'monthLabel',
    yField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    stack: true,
    axis: {
      x: { title: 'Month' },
      y: { title: 'Weight (tonnes)' },
    },
    legend: { position: 'top' },
  };

  const disposalMethodBreakdownConfig = {
    title: 'Disposal Method Breakdown',
    data: disposalMethodBreakdownData,
    angleField: 'totalWeightTonnes',
    colorField: 'name',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    radius: 0.8,
    innerRadius: 0.55,
    legend: { position: 'bottom' },
    label: {
      text: (datum: { name: string; percentage: number }) =>
        `${datum.name} (${formatFixed(datum.percentage)}%)`,
      position: 'outside',
    },
    tooltip: {
      items: [
        (datum: { totalWeightTonnes: number }) => ({
          value: `${formatFixed(datum.totalWeightTonnes)} tonnes`,
        }),
      ],
    },
  };

  return (
    <ProCard direction="column" ghost>
      <Space direction="vertical" size={16} style={{ width: '100%' }} styles={{ item: { width: '100%' } }}>
        <MetricCardGrid items={metrics} />

        <ProCard bordered>
          {trendData.length > 0 ? <Column {...wasteGenerationTrendConfig} /> : <Empty />}
        </ProCard>

        <ProCard bordered>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
            {disposalMethodBreakdownData.length > 0 ? (
              <Pie {...disposalMethodBreakdownConfig} />
            ) : (
              <Empty />
              )}
            </Col>
          </Row>
        </ProCard>
      </Space>
    </ProCard>
  );
}
