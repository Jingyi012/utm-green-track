import { Col, Empty, Row, Space } from 'antd';
import { Pie } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { WasteGenerationAnalysisSection as WasteGenerationData } from '@/lib/types/dataAnalytics';
import { DISPOSAL_METHOD_COLOR_SCALE } from '@/lib/utils/disposalMethodChart';
import { MetricCardGrid } from './MetricCardGrid';
import { formatFixed, formatPopulation } from './helpers';
import { WasteGenerationTrendChart } from './charts/WasteGenerationTrendChart';

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
      position: 'outside',
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

  return (
    <ProCard direction="column" ghost>
      <Space
        direction="vertical"
        size={16}
        style={{ width: '100%' }}
        styles={{ item: { width: '100%' } }}
      >
        <MetricCardGrid items={metrics} />

        <ProCard bordered>
          <WasteGenerationTrendChart
            data={data.wasteGenerationTrend}
            title="Waste Generation Trend (By Month)"
          />
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
