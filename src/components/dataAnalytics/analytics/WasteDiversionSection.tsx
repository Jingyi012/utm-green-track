import dayjs from 'dayjs';
import { Empty, Space } from 'antd';
import { Line, Pie } from '@ant-design/charts';
import { ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import {
  RankedDiversionItem,
  RankedProgrammeDiversionItem,
  WasteDiversionAnalysisSection as WasteDiversionData,
} from '@/lib/types/dataAnalytics';
import { DIVERSION_METHOD_COLOR_SCALE } from '@/lib/utils/disposalMethodChart';
import { MetricCardGrid } from './MetricCardGrid';
import { formatFixed, formatKilograms, formatTonnes, monthLabel } from './helpers';
const COMPOSITION_CONTENT_HEIGHT = 340;

interface WasteDiversionSectionProps {
  data: WasteDiversionData;
}

export function WasteDiversionSection({ data }: WasteDiversionSectionProps) {
  const metrics = [
    {
      key: 'diversion-rate',
      title: 'Waste Diversion Rate',
      value: formatFixed(data.wasteDiversionRatePercent),
      unit: '%',
    },
    {
      key: 'recycling-rate',
      title: 'Recycling Rate',
      value: formatFixed(data.recyclingRatePercent),
      unit: '%',
    },
    {
      key: 'composting-rate',
      title: 'Composting Rate',
      value: formatFixed(data.compostingRatePercent),
      unit: '%',
    },
    {
      key: 'energy-recovery-rate',
      title: 'Energy Recovery Rate',
      value: formatFixed(data.energyRecoveryRatePercent),
      unit: '%',
    },
    {
      key: 'ghg-reduction',
      title: 'Est. GHG Reduction',
      value: formatFixed(data.estimatedGhgReductionKgCo2e),
      unit: 'kg CO2e',
    },
  ];

  const topPtjColumns: ProColumns<RankedDiversionItem>[] = [
    { title: 'Rank', dataIndex: 'rank', width: 80 },
    { title: 'Name of Dept/PTJ', dataIndex: 'name' },
    {
      title: 'Diversion (kg)',
      dataIndex: 'diversionKg',
      renderText: (value) => formatKilograms(Number(value)),
      width: 180,
    },
  ];

  const topProgrammeColumns: ProColumns<RankedProgrammeDiversionItem>[] = [
    { title: 'Rank', dataIndex: 'rank', width: 80 },
    { title: 'Programme', dataIndex: 'programmeName' },
    {
      title: 'Date',
      dataIndex: 'programmeDate',
      width: 150,
      renderText: (value) => (value ? dayjs(value).format('DD MMM YYYY') : '-'),
    },
    { title: 'Dept/PTJ', dataIndex: 'departmentOrPtj' },
    {
      title: 'Diversion (kg)',
      dataIndex: 'diversionKg',
      width: 180,
      renderText: (value) => formatKilograms(Number(value)),
    },
  ];

  const trendData = data.diversionTrend.map((item) => ({
    ...item,
    monthLabel: monthLabel(item.month),
  }));

  const trendConfig = {
    title: 'Recycling, Composting, Energy Recovery Trend (By Month)',
    data: trendData,
    xField: 'monthLabel',
    yField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DIVERSION_METHOD_COLOR_SCALE,
    point: { shapeField: 'circle', sizeField: 3 },
    axis: {
      x: { title: 'Month' },
      y: { title: 'Weight (tonnes)' },
    },
    legend: { position: 'top' },
  };

  const buildCompositionConfig = (
    chartTitle: string,
    values: { name: string; totalWeightTonnes: number; percentage: number }[],
  ) => ({
    title: chartTitle,
    data: values,
    height: COMPOSITION_CONTENT_HEIGHT,
    angleField: 'totalWeightTonnes',
    colorField: 'name',
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
          value: formatTonnes(datum.totalWeightTonnes),
        }),
      ],
    },
  });

  const recycledCompositionData = data.recycledWasteComposition.filter(
    (item) => item.totalWeightTonnes > 0,
  );
  const compostingCompositionData = data.compostingWasteComposition.filter(
    (item) => item.totalWeightTonnes > 0,
  );
  const energyRecoveryCompositionData = data.energyRecoveryWasteComposition.filter(
    (item) => item.totalWeightTonnes > 0,
  );

  const compositions = [
    {
      title: 'Recycled Waste Composition',
      data: recycledCompositionData,
      emptyText: 'No data for Recycled Waste Composition',
    },
    {
      title: 'Composting Waste Composition',
      data: compostingCompositionData,
      emptyText: 'No data for Composting Waste Composition',
    },
    {
      title: 'Energy Recovery Waste Composition',
      data: energyRecoveryCompositionData,
      emptyText: 'No data for Energy Recovery Waste Composition',
    },
  ];

  const renderComposition = (item: (typeof compositions)[number]) => {
    if (item.data.length > 0) {
      return <Pie {...buildCompositionConfig(item.title, item.data)} />;
    }

    return (
      <div
        style={{
          height: COMPOSITION_CONTENT_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty description={item.emptyText} />
      </div>
    );
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

        <ProCard bordered>{trendData.length > 0 ? <Line {...trendConfig} /> : <Empty />}</ProCard>

        <ProCard title="Top Performing PTJs" bordered>
          <ProTable<RankedDiversionItem>
            rowKey="rank"
            search={false}
            options={false}
            pagination={false}
            columns={topPtjColumns}
            dataSource={data.topPerformingPtjs}
            toolBarRender={false}
          />
        </ProCard>

        <ProCard title="Top Performing Programmes" bordered>
          <ProTable<RankedProgrammeDiversionItem>
            rowKey={(record) =>
              `${record.rank}-${record.programmeName}-${record.programmeDate ?? 'na'}`
            }
            search={false}
            options={false}
            pagination={false}
            columns={topProgrammeColumns}
            dataSource={data.topPerformingProgrammes}
            toolBarRender={false}
          />
        </ProCard>

        <ProCard bordered split="vertical">
          {compositions.map((item) => (
            <ProCard key={item.title}>{renderComposition(item)}</ProCard>
          ))}
        </ProCard>
      </Space>
    </ProCard>
  );
}
