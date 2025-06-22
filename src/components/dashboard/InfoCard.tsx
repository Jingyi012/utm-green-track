'use client';

import { Card, Col, Row, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text, Title } = Typography;

type InfoCardProps = {
    icon: ReactNode;        // Pass a React icon element here
    itemLabel: string;      // e.g. "Total Notes"
    value: string | number; // e.g. "128"
};

export default function InfoCard({ icon, itemLabel, value }: InfoCardProps) {
    return (
        <Card style={{ width: '100%' }}>
            <Row align="middle" gutter={16}>
                <Col>
                    <div style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: 24,
                        background: '#f0f2f5',
                        borderRadius: 8,
                    }}>
                        {icon}
                    </div>
                </Col>
                <Col flex="auto">
                    <Text type="secondary" style={{ fontSize: 14 }}>{itemLabel}</Text>
                    <br />
                    <Title level={5} style={{ margin: 0 }}>{value}</Title>
                </Col>
            </Row>
        </Card>
    );
}
