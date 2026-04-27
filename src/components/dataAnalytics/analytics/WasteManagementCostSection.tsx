import { Empty, Space } from 'antd';
import { DualAxes } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { WasteManagementCostAnalysisSection as WasteManagementCostData } from '@/lib/types/dataAnalytics';
import { MetricCardGrid } from './MetricCardGrid';
import { formatFixed, monthLabel } from './helpers';
import { COLORS, METHOD_COLOR_MAP } from '@/lib/utils/disposalMethodChart';

interface WasteManagementCostSectionProps {
  data: WasteManagementCostData;
}

export function WasteManagementCostSection({ data }: WasteManagementCostSectionProps) {
  const metrics = [
    {
      key: 'cost-ytd',
      title: 'Total Management Cost YTD',
      value: formatFixed(data.totalManagementCostYtdRm),
      unit: 'RM',
      unitPosition: 'prefix' as const,
    },
    {
      key: 'savings-ytd',
      title: 'Est. Savings From Waste Diversion',
      value: formatFixed(data.estimatedSavingsFromWasteDiversionRm),
      unit: 'RM',
      unitPosition: 'prefix' as const,
    },
    {
      key: 'cost-per-tonne',
      title: 'Landfilling Cost Per Tonne',
      value: formatFixed(data.landfillingCostPerTonneRm),
      unit: 'RM/tonne',
      unitPosition: 'prefix' as const,
    },
  ];

  const monthlyData = (data?.monthlyExpenditureTrend || [])
    .map((item) => ({
      ...item,
      monthLabel: monthLabel(item.month),
      landfillWeightTonnes: Number(item.landfillWeightTonnes) || 0,
      managementCostRm: Number(item.managementCostRm) || 0,
    }))
    .sort((a, b) => a.month - b.month);

  const monthlySavingsData = (data?.monthlyEstimatedSavingsFromWasteDiversionTrend || [])
    .map((item) => ({
      ...item,
      monthLabel: monthLabel(item.month),
      totalWasteDivertedTonnes: Number(item.totalWasteDivertedTonnes) || 0,
      estimatedSavingsRm: Number(item.estimatedSavingsRm) || 0,
    }))
    .sort((a, b) => a.month - b.month);

  // 2. Optimized Config for Expenditure Chart
  const dualAxesConfig = {
    xField: 'monthLabel',
    legend: false,
    children: [
      {
        type: 'interval',
        data: monthlyData,
        yField: 'landfillWeightTonnes',
        scale: { y: { nice: true } },
        axis: { y: { title: 'Landfill (tonnes)' } },
        style: { fill: METHOD_COLOR_MAP.Landfilling },
        tooltip: {
          items: [
            (datum: any) => ({
              name: 'Landfill',
              value: `${formatFixed(datum.landfillWeightTonnes)} tonnes`,
              color: METHOD_COLOR_MAP.Landfilling,
            }),
          ],
        },
      },
      {
        type: 'line',
        data: monthlyData,
        yField: 'managementCostRm',
        scale: { y: { nice: true } },
        axis: { y: { position: 'right', title: 'Cost (RM)' } },
        style: { lineWidth: 4, stroke: COLORS.yellow },
        smooth: true,
        tooltip: {
          items: [
            (datum: any) => ({
              name: 'Management Cost',
              value: `RM ${formatFixed(datum.managementCostRm)}`,
              color: COLORS.yellow,
            }),
          ],
        },
      },
    ],
  };

  // 3. Optimized Config for Savings Chart
  const monthlySavingsConfig = {
    xField: 'monthLabel',
    legend: false,
    children: [
      {
        type: 'interval',
        data: monthlySavingsData,
        yField: 'totalWasteDivertedTonnes',
        scale: { y: { nice: true } },
        axis: { y: { title: 'Waste Diverted (tonnes)' } },
        style: { fill: COLORS.green },
        tooltip: {
          items: [
            (datum: any) => ({
              name: 'Waste Diverted',
              value: `${formatFixed(datum.totalWasteDivertedTonnes)} tonnes`,
              color: COLORS.green,
            }),
          ],
        },
      },
      {
        type: 'line',
        data: monthlySavingsData,
        yField: 'estimatedSavingsRm',
        scale: { y: { nice: true } },
        axis: { y: { position: 'right', title: 'Savings (RM)' } },
        style: { lineWidth: 4, stroke: COLORS.orange },
        smooth: true,
        tooltip: {
          items: [
            (datum: any) => ({
              name: 'Est. Savings',
              value: `RM ${formatFixed(datum.estimatedSavingsRm)}`,
              color: COLORS.orange,
            }),
          ],
        },
      },
    ],
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
          {monthlyData.length > 0 ? <DualAxes {...dualAxesConfig} /> : <Empty />}
        </ProCard>

        <ProCard bordered>
          {monthlySavingsData.length > 0 ? <DualAxes {...monthlySavingsConfig} /> : <Empty />}
        </ProCard>
      </Space>
    </ProCard>
  );
}
