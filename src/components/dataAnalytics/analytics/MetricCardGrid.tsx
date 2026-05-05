import { Button, Col, Row, Space, Typography } from 'antd';

const { Text, Title, Paragraph } = Typography;

export interface MetricCardItem {
  key: string;
  title: string;
  value: string | number;
  unit?: string;
  unitPosition?: 'prefix' | 'suffix';
  helperText?: string;
  showMore?: boolean;
  onShowMore?: () => void;
}

interface MetricCardGridProps {
  items: MetricCardItem[];
}

export function MetricCardGrid({ items }: MetricCardGridProps) {
  return (
    <Row gutter={[16, 16]} align="stretch">
      {items.map((item) => (
        <Col xs={24} sm={12} lg={8} xl={8} key={item.key} style={{ display: 'flex' }}>
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
              position: 'relative',
            }}
          >
            <Paragraph
              type="secondary"
              style={{
                fontSize: 14,
                lineHeight: '28px',
                minHeight: 28,
                margin: 0,
                paddingBottom: 2,
              }}
              ellipsis={{ rows: 1, tooltip: item.title }}
              title={item.title}
            >
              {item.title}
            </Paragraph>

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

            {item.helperText ? (
              <Text type="secondary" style={{ fontSize: 13 }}>
                {item.helperText}
              </Text>
            ) : null}

            {item.showMore ? (
              <div style={{ marginTop: 'auto', textAlign: 'right' }}>
                <Button type="link" size="small" style={{ padding: 0 }} onClick={item.onShowMore}>
                  Show More
                </Button>
              </div>
            ) : null}
          </Space>
        </Col>
      ))}
    </Row>
  );
}
