'use client'
import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import {
    DashboardOutlined,
    FileTextOutlined,
    BulbOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function HomeSection() {
    const router = useRouter();
    const features = [
        {
            icon: <DashboardOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
            title: 'Dashboard',
            path: '/dashboard',
        },
        {
            icon: <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
            title: 'Data Entry',
            path: '/data-entry/new-form',
        },
        {
            icon: <BulbOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
            title: 'Waste Info',
            path: '/waste-info',
        },
        {
            icon: <SettingOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
            title: 'Settings',
            path: '/settings/edit-profile',
        },
    ];

    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>About GREENTRACK SYSTEM</Title>}
        >
            <Paragraph style={{ fontSize: 18, lineHeight: 1.6 }}>
                UTM GreenTrack is a user-friendly system designed to help UTM track and monitor
                campus-generated waste. All data entered into the system, including waste generation,
                recycling, composting, and disposal methods, is sourced exclusively from within UTM,
                ensuring accurate and reliable internal reporting. This system enables the university
                to monitor its sustainability progress effectively and strengthen its commitment to
                a greener future.
            </Paragraph>

            <Title level={1} style={{ textAlign: 'center', margin: '30px' }}>Get Started!</Title>

            <Row gutter={[16, 16]} justify="center" style={{ margin: '30px 0' }}>
                {features.map((f, i) => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <Card
                            hoverable
                            onClick={() => router.push(f.path)}
                            style={{ textAlign: 'center', borderRadius: 12 }}>
                            {f.icon}
                            <div style={{ marginTop: 10, fontWeight: 500, fontSize: 18 }}>{f.title}</div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Card>
    );
}
