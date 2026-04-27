import { Empty, Space } from 'antd';
import { Column } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { LifetimeDataAnalyticsResponse } from '@/lib/types/dataAnalytics';
import {
  DEFAULT_WASTE_BAR_COLOR,
  DISPOSAL_METHOD_COLOR_SCALE,
} from '@/lib/utils/disposalMethodChart';
import { formatFixed } from './helpers';

interface LifetimeSummarySectionProps {
  data: LifetimeDataAnalyticsResponse;
}

export function LifetimeSummarySection({ data }: LifetimeSummarySectionProps) {
  const hasData =
    data.totalWasteGenerationByYear.length > 0 ||
    data.totalWasteDiversionByYear.length > 0 ||
    data.totalWasteManagementCostByYear.length > 0;

  if (!hasData) {
    return <Empty description="No lifetime data available." />;
  }

  const generationConfig = {
    title: 'UTM Total Waste Generation by Year',
    data: data.totalWasteGenerationByYear,
    xField: 'year',
    yField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    stack: true,
    axis: {
      x: { title: 'Year' },
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
    annotations: Object.entries(
      data.totalWasteGenerationByYear.reduce((acc: Record<string, number>, curr) => {
        acc[curr.year] = (acc[curr.year] || 0) + curr.totalWeightTonnes;
        return acc;
      }, {}),
    ).map(([year, total]) => ({
      type: 'text',
      data: [{ year: Number(year), totalWeightTonnes: total }],
      encode: { x: 'year', y: 'totalWeightTonnes' },
      style: {
        text: `${total.toFixed(2)}`,
        textBaseline: 'bottom',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#000',
        dy: -2,
      },
      tooltip: false,
    })),
  };

  const diversionConfig = {
    title: 'UTM Total Waste Diversion by Year',
    data: data.totalWasteDiversionByYear,
    xField: 'year',
    yField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    stack: true,
    axis: {
      x: { title: 'Year' },
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
    annotations: Object.entries(
      data.totalWasteDiversionByYear.reduce((acc: Record<string, number>, curr) => {
        acc[curr.year] = (acc[curr.year] || 0) + curr.totalWeightTonnes;
        return acc;
      }, {}),
    ).map(([year, total]) => ({
      type: 'text',
      data: [{ year: Number(year), totalWeightTonnes: total }],
      encode: { x: 'year', y: 'totalWeightTonnes' },
      style: {
        text: `${total.toFixed(2)}`,
        textBaseline: 'bottom',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#000',
        dy: -2,
      },
      tooltip: false,
    })),
  };

  const costConfig = {
    title: 'UTM Total Waste Management Cost by Year',
    data: data.totalWasteManagementCostByYear,
    xField: 'year',
    yField: 'totalCostRm',
    color: DEFAULT_WASTE_BAR_COLOR,
    axis: {
      x: { title: 'Year' },
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
    annotations: data.totalWasteManagementCostByYear.map((item) => ({
      type: 'text',
      data: [{ year: item.year, totalCostRm: item.totalCostRm }],
      encode: { x: 'year', y: 'totalCostRm' },
      style: {
        text: `RM ${item.totalCostRm.toFixed(2)}`,
        textBaseline: 'bottom',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#000',
        dy: -2,
      },
      tooltip: false,
    })),
  };

  return (
    <ProCard direction="column" ghost>
      <Space
        direction="vertical"
        size={16}
        style={{ width: '100%' }}
        styles={{ item: { width: '100%' } }}
      >
        <ProCard bordered>
          <Column {...generationConfig} />
        </ProCard>
        <ProCard bordered>
          <Column {...diversionConfig} />
        </ProCard>
        <ProCard bordered>
          <Column {...costConfig} />
        </ProCard>
      </Space>
    </ProCard>
  );
}
