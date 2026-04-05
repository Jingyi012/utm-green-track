import { Empty, Space } from 'antd';
import { Column } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { YearlySummarySection as YearlySummaryData } from '@/lib/types/dataAnalytics';
import {
  DEFAULT_WASTE_BAR_COLOR,
  DISPOSAL_METHOD_COLOR_SCALE,
} from '@/lib/utils/disposalMethodChart';
import { formatFixed } from './helpers';

interface YearlySummarySectionProps {
  data: YearlySummaryData;
}

export function YearlySummarySection({ data }: YearlySummarySectionProps) {
  const hasAnyData =
    data.totalWasteGenerationByCampus.length > 0 ||
    data.totalWasteDiversionByCampus.length > 0 ||
    data.totalWasteManagementCostByCampus.length > 0;

  if (!hasAnyData) {
    return <Empty description="No yearly summary data available." />;
  }

  const wasteGenerationConfig = {
    title: 'UTM Total Waste Generation by Campus',
    height: 320,
    data: data.totalWasteGenerationByCampus,
    xField: 'campusName',
    yField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    stack: true,
    axis: {
      x: { title: 'Campus' },
      y: { title: 'Weight (tonnes)' },
    },
    legend: { position: 'top' },
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { disposalMethod: string; totalWeightTonnes: number }) => ({
          name: datum.disposalMethod,
          value: `${formatFixed(datum.totalWeightTonnes)} tonnes`,
        }),
      ],
    },
  };

  const wasteDiversionConfig = {
    title: 'UTM Total Waste Diversion by Campus',
    height: 320,
    data: data.totalWasteDiversionByCampus,
    xField: 'campusName',
    yField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    stack: true,
    axis: {
      x: { title: 'Campus' },
      y: { title: 'Weight (tonnes)' },
    },
    legend: { position: 'top' },
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { disposalMethod: string; totalWeightTonnes: number }) => ({
          name: datum.disposalMethod,
          value: `${formatFixed(datum.totalWeightTonnes)} tonnes`,
        }),
      ],
    },
  };

  const costConfig = {
    title: 'UTM Total Waste Management Cost by Campus',
    height: 320,
    data: data.totalWasteManagementCostByCampus,
    xField: 'campusName',
    yField: 'totalCostRm',
    color: DEFAULT_WASTE_BAR_COLOR,
    axis: {
      x: { title: 'Campus' },
      y: { title: 'Cost (RM)' },
    },
    legend: false,
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { totalCostRm: number }) => ({
          name: 'Management Cost',
          value: `RM ${formatFixed(datum.totalCostRm)}`,
        }),
      ],
    },
  };

  return (
    <ProCard direction="column" ghost>
      <Space direction="vertical" size={16} style={{ width: '100%' }} styles={{ item: { width: '100%' } }}>
        <ProCard bordered>
          <Column {...wasteGenerationConfig} />
        </ProCard>
        <ProCard bordered>
          <Column {...wasteDiversionConfig} />
        </ProCard>
        <ProCard bordered>
          <Column {...costConfig} />
        </ProCard>
      </Space>
    </ProCard>
  );
}
