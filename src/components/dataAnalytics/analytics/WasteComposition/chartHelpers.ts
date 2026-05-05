import { PieConfig } from '@ant-design/charts';
import { formatTonnes } from '../helpers';

export const COMPOSITION_CONTENT_HEIGHT = 340;

export const buildCompositionPieConfig = (
  chartTitle: string,
  values: { wasteType: string; totalWeightTonnes: number; percentage: number }[],
): PieConfig => {
  const totalTonnes = values.reduce((sum, item) => sum + item.totalWeightTonnes, 0);
  return {
    title: chartTitle,
    data: values,
    height: COMPOSITION_CONTENT_HEIGHT,
    angleField: 'totalWeightTonnes',
    colorField: 'wasteType',
    radius: 0.8,
    innerRadius: 0.55,
    legend: { position: 'bottom' },
    label: {
      text: (datum) => `${datum.wasteType} (${datum.percentage.toFixed(2)}%)`,
      position: 'spider',
    },
    annotations: [
      {
        type: 'text',
        style: {
          text: `Total\n${formatTonnes(totalTonnes)}`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 'bold',
        },
        tooltip: false,
      },
    ],
    tooltip: {
      items: [
        (datum: any) => ({
          value: formatTonnes(datum.totalWeightTonnes),
        }),
      ],
    },
  };
};
