// components/dataAnalytics/analytics/WasteCompositionGrid.tsx
import React from 'react';
import { Col, Empty, Row } from 'antd';
import { Pie } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { WasteTypeWeightShare } from '@/lib/types/dataAnalytics';
import { buildCompositionPieConfig, COMPOSITION_CONTENT_HEIGHT } from './chartHelpers';

interface WasteCompositionGridProps {
  recycledWasteTypeComposition: WasteTypeWeightShare[];
  compostingWasteTypeComposition: WasteTypeWeightShare[];
  energyRecoveryWasteTypeComposition: WasteTypeWeightShare[];
}

const WasteCompositionGrid: React.FC<WasteCompositionGridProps> = ({
  recycledWasteTypeComposition,
  compostingWasteTypeComposition,
  energyRecoveryWasteTypeComposition,
}) => {
  const compositions = [
    {
      title: 'Recycled Waste Composition',
      data: recycledWasteTypeComposition.filter((item) => item.totalWeightTonnes > 0),
      emptyText: 'No data for Recycled Waste Composition',
    },
    {
      title: 'Composting Waste Composition',
      data: compostingWasteTypeComposition.filter((item) => item.totalWeightTonnes > 0),
      emptyText: 'No data for Composting Waste Composition',
    },
    {
      title: 'Energy Recovery Waste Composition',
      data: energyRecoveryWasteTypeComposition.filter((item) => item.totalWeightTonnes > 0),
      emptyText: 'No data for Energy Recovery Waste Composition',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {compositions.map((item) => (
        <Col xs={24} md={12} key={item.title}>
          <ProCard bordered>
            {item.data.length > 0 ? (
              <Pie {...buildCompositionPieConfig(item.title, item.data)} />
            ) : (
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
            )}
          </ProCard>
        </Col>
      ))}
    </Row>
  );
};

export default WasteCompositionGrid;
