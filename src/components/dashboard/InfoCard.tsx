'use client';

import { Card, Col, Row, Typography, Button } from 'antd';
import type { ReactNode } from 'react';

const { Text, Title } = Typography;

type InfoCardProps = {
    icon: ReactNode;
    itemLabel: string;
    value: string | number;
    unit: string;
    showMore?: boolean;
    onShowMore?: () => void;
};

export default function InfoCard({ icon, itemLabel, value, unit, showMore, onShowMore }: InfoCardProps) {
    const isPrefixUnit = unit === 'RM';

    return (
        <Card style={{ width: '100%' }}>
            <Row gutter={16} align="middle">
                <Col>
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 8,
                        }}
                    >
                        {icon}
                    </div>
                </Col>

                <Col flex="auto" style={{ position: 'relative' }}>
                    <Text type="secondary" style={{ fontSize: 15 }}>
                        {itemLabel}
                    </Text>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        {isPrefixUnit && <Text style={{ fontSize: 14 }}>{unit}</Text>}
                        <Title level={3} style={{ margin: 0 }}>
                            {value}
                        </Title>
                        {!isPrefixUnit && <Text style={{ fontSize: 16 }}>{unit}</Text>}
                    </div>

                    <div style={{ position: 'absolute', height: 20, textAlign: 'right', marginTop: 8, right: '5px', bottom: '-10px' }}>
                        {showMore ? (
                            <Button
                                type="link"
                                size="small"
                                style={{ padding: 0 }}
                                onClick={onShowMore}
                            >
                                Show More
                            </Button>
                        ) : (
                            <div />
                        )}
                    </div>
                </Col>
            </Row>
        </Card>
    );
}
