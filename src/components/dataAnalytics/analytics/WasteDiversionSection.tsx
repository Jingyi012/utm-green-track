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
import WasteCompositionGrid from './WasteComposition/WasteCompositionGrid';

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
      helperText: `${formatTonnes(data.totalWasteDivertedTonnes)} diverted`,
    },
    {
      key: 'recycling-rate',
      title: 'Recycling Rate',
      value: formatFixed(data.recyclingRatePercent),
      unit: '%',
      helperText: `${formatTonnes(data.totalRecycledWasteTonnes)} recycled`,
    },
    {
      key: 'composting-rate',
      title: 'Composting Rate',
      value: formatFixed(data.compostingRatePercent),
      unit: '%',
      helperText: `${formatTonnes(data.totalCompostingWasteTonnes)} composted`,
    },
    {
      key: 'energy-recovery-rate',
      title: 'Energy Recovery Rate',
      value: formatFixed(data.energyRecoveryRatePercent),
      unit: '%',
      helperText: `${formatTonnes(data.totalEnergyRecoveryWasteTonnes)} recovered`,
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
    tooltip: {
      items: [
        (datum: { totalWeightTonnes: number }) => ({
          value: `${datum.totalWeightTonnes.toFixed(2)} tonnes`,
        }),
      ],
    },
    legend: { position: 'top' },
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

        <WasteCompositionGrid
          recycledWasteTypeComposition={data.recycledWasteTypeComposition}
          compostingWasteTypeComposition={data.compostingWasteTypeComposition}
          energyRecoveryWasteTypeComposition={data.energyRecoveryWasteTypeComposition}
        />
      </Space>
    </ProCard>
  );
}
