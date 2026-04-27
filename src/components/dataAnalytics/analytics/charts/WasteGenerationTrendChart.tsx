import { Column } from '@ant-design/charts';
import { Empty } from 'antd';
import { MonthlyMethodValue } from '@/lib/types/dataAnalytics';
import { DISPOSAL_METHOD_COLOR_SCALE } from '@/lib/utils/disposalMethodChart';
import { formatFixed, monthLabel } from '../helpers';

interface WasteGenerationTrendChartProps {
  data: MonthlyMethodValue[];
  title: string;
}

export function WasteGenerationTrendChart({
  data,
  title,
}: WasteGenerationTrendChartProps) {
  const trendData = data.map((item) => ({
    ...item,
    monthLabel: monthLabel(item.month),
  }));

  if (trendData.length === 0) {
    return <Empty />;
  }

  const totalsByMonth = trendData.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.monthLabel] = (acc[curr.monthLabel] || 0) + curr.totalWeightTonnes;
    return acc;
  }, {});

  const config = {
    title,
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
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    legend: { position: 'top' },
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { totalWeightTonnes: number }) => ({
          value: `${formatFixed(datum.totalWeightTonnes)} tonnes`,
        }),
      ],
    },
    annotations: Object.entries(totalsByMonth).map(([monthLabel, total]) => ({
      type: 'text',
      data: [{ monthLabel, totalWeightTonnes: total }],
      encode: { x: 'monthLabel', y: 'totalWeightTonnes' },
      style: {
        text: formatFixed(total),
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

  return <Column {...config} />;
}
