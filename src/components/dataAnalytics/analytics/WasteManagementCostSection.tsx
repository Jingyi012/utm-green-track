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

  const monthlyData = data.monthlyExpenditureTrend
    .map((item) => ({
      ...item,
      monthLabel: monthLabel(item.month),
      landfillWeightTonnes: Number(item.landfillWeightTonnes) || 0,
      managementCostRm: Number(item.managementCostRm) || 0,
    }))
    .sort((a, b) => a.month - b.month);

  const dualAxesConfig = {
    title: 'Monthly Expenditure Trend',
    legend: { color: false },
    scale: { y: { independent: true, nice: true } },
    children: [
      {
        type: 'interval',
        data: monthlyData,
        xField: 'monthLabel',
        yField: 'landfillWeightTonnes',
        axis: {
          x: { title: 'Month' },
          y: { title: 'Landfill (tonnes)' },
        },
        legend: false,
        tooltip: {
          title: 'monthLabel',
          items: [
            (datum: { landfillWeightTonnes: number }) => ({
              name: 'Landfill (tonnes)',
              value: `${formatFixed(datum.landfillWeightTonnes)} tonnes`,
              color: METHOD_COLOR_MAP.Landfilling,
            }),
          ],
        },
        style: { fill: METHOD_COLOR_MAP.Landfilling },
      },
      {
        type: 'line',
        data: monthlyData,
        xField: 'monthLabel',
        yField: 'managementCostRm',
        axis: {
          y: { position: 'right', title: 'Cost (RM)' },
        },
        legend: false,
        tooltip: {
          title: 'monthLabel',
          items: [
            (datum: { managementCostRm: number }) => ({
              name: 'Management Cost',
              value: `RM ${formatFixed(datum.managementCostRm)}`,
              color: COLORS.yellow,
            }),
          ],
        },
        style: { lineWidth: 4, stroke: COLORS.yellow },
        smooth: true,
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
      </Space>
    </ProCard>
  );
}
