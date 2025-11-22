'use client';

import { Card, Col, Row, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text, Title } = Typography;

type InfoCardProps = {
    icon: ReactNode;        // Pass a React icon element here
    itemLabel: string;      // e.g. "Total Notes"
    value: string | number; // e.g. "128"
    unit: string;
};

export default function InfoCard({ icon, itemLabel, value, unit }: InfoCardProps) {
    const isPrefixUnit = unit === 'RM';

    return (
        <Card style={{ width: '100%' }}>
            <Row align="middle" gutter={16}>
                <Col>
                    <div style={{
                        width: 50,
                        height: 50,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 8,
                    }}>
                        {icon}
                    </div>
                </Col>
                <Col flex="auto">
                    <Text type="secondary" style={{ fontSize: 15 }}>
                        {itemLabel}
                    </Text>
                    <br />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        {isPrefixUnit && (
                            <Text style={{ fontSize: 14 }}>{unit}</Text>
                        )}
                        <Title level={3} style={{ margin: 0 }}>
                            {value}
                        </Title>
                        {!isPrefixUnit && (
                            <Text style={{ fontSize: 16 }}>{unit}</Text>
                        )}
                    </div>
                </Col>

            </Row>
        </Card>
    );
}
