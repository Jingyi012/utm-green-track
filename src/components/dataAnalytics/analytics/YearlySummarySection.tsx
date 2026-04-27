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
    data.totalWasteManagementCostByCampus.length > 0 ||
    data.totalEstimatedSavingsFromWasteDiversionByCampus.length > 0;

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
    annotations: Object.entries(
      data.totalWasteGenerationByCampus.reduce((acc: Record<string, number>, curr) => {
        acc[curr.campusName] = (acc[curr.campusName] || 0) + curr.totalWeightTonnes;
        return acc;
      }, {}),
    ).map(([campusName, total]) => ({
      type: 'text',
      data: [{ campusName, totalWeightTonnes: total }],
      encode: { x: 'campusName', y: 'totalWeightTonnes' },
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
    annotations: Object.entries(
      data.totalWasteDiversionByCampus.reduce((acc: Record<string, number>, curr) => {
        acc[curr.campusName] = (acc[curr.campusName] || 0) + curr.totalWeightTonnes;
        return acc;
      }, {}),
    ).map(([campusName, total]) => ({
      type: 'text',
      data: [{ campusName, totalWeightTonnes: total }],
      encode: { x: 'campusName', y: 'totalWeightTonnes' },
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
    annotations: data.totalWasteManagementCostByCampus.map((item) => ({
      type: 'text',
      data: [{ campusName: item.campusName, totalCostRm: item.totalCostRm }],
      encode: { x: 'campusName', y: 'totalCostRm' },
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

  const savingsConfig = {
    title: 'UTM Est. Savings From Waste Diversion',
    height: 320,
    data: data.totalEstimatedSavingsFromWasteDiversionByCampus,
    xField: 'campusName',
    yField: 'totalCostRm',
    color: DEFAULT_WASTE_BAR_COLOR,
    axis: {
      x: { title: 'Campus' },
      y: { title: 'Savings (RM)' },
    },
    legend: false,
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { totalCostRm: number }) => ({
          name: 'Est. Savings',
          value: `RM ${formatFixed(datum.totalCostRm)}`,
        }),
      ],
    },
    annotations: data.totalEstimatedSavingsFromWasteDiversionByCampus.map((item) => ({
      type: 'text',
      data: [{ campusName: item.campusName, totalCostRm: item.totalCostRm }],
      encode: { x: 'campusName', y: 'totalCostRm' },
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
          <Column {...wasteGenerationConfig} />
        </ProCard>
        <ProCard bordered>
          <Column {...wasteDiversionConfig} />
        </ProCard>
        <ProCard bordered>
          <Column {...costConfig} />
        </ProCard>
        <ProCard bordered>
          <Column {...savingsConfig} />
        </ProCard>
      </Space>
    </ProCard>
  );
}
