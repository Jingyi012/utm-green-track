import { Col, Row, Space, Typography } from 'antd';

const { Text, Title } = Typography;

export interface MetricCardItem {
  key: string;
  title: string;
  value: string | number;
  unit?: string;
  unitPosition?: 'prefix' | 'suffix';
}

interface MetricCardGridProps {
  items: MetricCardItem[];
}

export function MetricCardGrid({ items }: MetricCardGridProps) {
  return (
    <Row gutter={[16, 16]} align="stretch">
      {items.map((item) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={item.key} style={{ display: 'flex' }}>
          <Space
            direction="vertical"
            size={4}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              padding: 24,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              backgroundColor: '#fff',
            }}
          >
            <Text
              type="secondary"
              style={{ fontSize: 14, display: 'block', whiteSpace: 'nowrap' }}
              ellipsis={{ tooltip: item.title }}
              title={item.title}
            >
              {item.title}
            </Text>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              {item.unit && item.unitPosition === 'prefix' ? (
                <Text style={{ fontSize: 16 }}>{item.unit}</Text>
              ) : null}

              <Title level={3} style={{ margin: 0 }}>
                {item.value}
              </Title>

              {item.unit && item.unitPosition !== 'prefix' ? (
                <Text style={{ fontSize: 16 }}>{item.unit}</Text>
              ) : null}
            </div>
          </Space>
        </Col>
      ))}
    </Row>
  );
}
