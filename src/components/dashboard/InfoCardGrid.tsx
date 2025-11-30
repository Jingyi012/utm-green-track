'use client';

import { Col, Row, Card, Typography, Table, Divider, Collapse, Tag } from 'antd';
import InfoCard from './InfoCard';
import Image from 'next/image';
import { useState } from 'react';
import { BreakdownModal } from './BreakdownModal';

const { Title, Text } = Typography;

interface WasteBreakdown {
    disposalMethod: string;
    wasteType: string;
    totalWeight: number;
}

interface InfoCardGridProps {
    totalWasteGenerated: number;
    totalWasteRecycled: number;
    totalWasteToLandfill: number;
    totalGhgReduction: number;
    totalLandfillCostSavings: number;
    wasteTypeTotals: WasteBreakdown[];
}

export default function InfoCardGrid(props: InfoCardGridProps) {
    const {
        totalWasteGenerated,
        totalWasteRecycled,
        totalWasteToLandfill,
        totalGhgReduction,
        totalLandfillCostSavings,
        wasteTypeTotals,
    } = props;

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const format = (n: number) => n.toFixed(2);

    const showWasteGenerated = () => {
        setModalTitle('Breakdown: Total Waste Generated');

        const grouped = Object.groupBy(wasteTypeTotals, (x) => x.disposalMethod);

        const summary = Object.entries(grouped).map(([method, list]) => ({
            disposalMethod: method,
            weight: list!.reduce((sum, x) => sum + x.totalWeight, 0),
        }));

        const collapseItems = Object.entries(grouped).map(([method, list]) => ({
            key: method,
            label: method,
            children: (
                <Table
                    dataSource={list}
                    pagination={false}
                    columns={[
                        { title: 'Waste Type', dataIndex: 'wasteType' },
                        {
                            title: 'Weight (Tonnes)',
                            dataIndex: 'totalWeight',
                            render: (v) => format(v),
                        },
                    ]}
                    rowKey={(r) => `${method}-${r.wasteType}`}
                />
            ),
        }));

        setModalContent(
            <div>
                <Title level={4}>Summary by Disposal Method</Title>
                <Table
                    dataSource={summary}
                    pagination={false}
                    columns={[
                        { title: 'Disposal Method', dataIndex: 'disposalMethod' },
                        {
                            title: 'Total (Tonnes)',
                            dataIndex: 'weight',
                            render: (v) => format(v),
                        },
                    ]}
                    rowKey={(r) => r.disposalMethod}
                    style={{ marginBottom: 20 }}
                />

                <Divider />

                <Title level={4}>Detailed Breakdown</Title>
                <Collapse accordion items={collapseItems} />
            </div>
        );

        setModalOpen(true);
    };

    const showWasteReduction = () => {
        setModalTitle("Breakdown: Total Waste Reduced");

        const allowedMethods = ["Recycling", "Composting", "Energy Recovery"];
        const filtered = wasteTypeTotals.filter(x =>
            allowedMethods.includes(x.disposalMethod)
        );

        const grouped = Object.groupBy(filtered, (x) => x.disposalMethod);

        const summary = Object.entries(grouped).map(([method, list]) => ({
            disposalMethod: method,
            weight: list!.reduce((sum, x) => sum + x.totalWeight, 0),
        }));

        const collapseItems = Object.entries(grouped).map(([method, list]) => ({
            key: method,
            label: method,
            children: (
                <Table
                    dataSource={list}
                    pagination={false}
                    columns={[
                        { title: "Waste Type", dataIndex: "wasteType" },
                        {
                            title: "Weight (Tonnes)",
                            dataIndex: "totalWeight",
                            render: (v) => format(v),
                        },
                    ]}
                    rowKey={(r) => `${method}-${r.wasteType}`}
                />
            ),
        }));

        setModalContent(
            <div>
                <Title level={4}>Summary by Disposal Method</Title>
                <Table
                    dataSource={summary}
                    pagination={false}
                    columns={[
                        { title: "Disposal Method", dataIndex: "disposalMethod" },
                        {
                            title: "Total (Tonnes)",
                            dataIndex: "weight",
                            render: (v) => format(v),
                        },
                    ]}
                    rowKey={(r) => r.disposalMethod}
                    style={{ marginBottom: 20 }}
                />

                <Divider />

                <Title level={4}>Detailed Breakdown</Title>
                <Collapse accordion items={collapseItems} />
            </div>
        );

        setModalOpen(true);
    };

    const cardData = [
        {
            icon: <Image src="/icons/totalWasteGenerated.png" alt="" width={50} height={50} />,
            itemLabel: 'Total Waste Generated',
            value: format(totalWasteGenerated),
            unit: 'Tonnes',
            showMore: true,
            onShowMore: showWasteGenerated,
        },
        {
            icon: <Image src="/icons/totalWasteReduction.png" alt="" width={50} height={50} />,
            itemLabel: 'Total Waste Reduction',
            value: format(totalWasteRecycled),
            unit: 'Tonnes',
            showMore: true,
            onShowMore: showWasteReduction,
        },
        {
            icon: <Image src="/icons/totalWasteToLandfill.png" alt="" width={50} height={50} />,
            itemLabel: 'Total Waste to Landfill',
            value: format(totalWasteToLandfill),
            unit: 'Tonnes',
        },
        {
            icon: <Image src="/icons/totalGHGReduction.png" alt="" width={50} height={50} />,
            itemLabel: 'Total GHG Reduction',
            value: format(totalGhgReduction),
            unit: 'kg CO₂e',
        },
        {
            icon: <Image src="/icons/landfillCostSaving.png" alt="" width={50} height={50} />,
            itemLabel: 'Landfill Cost Saving',
            value: format(totalLandfillCostSavings),
            unit: 'RM',
        },
    ];

    return (
        <>
            <Row gutter={[16, 16]}>
                {cardData.map((item, index) => (
                    <Col xs={24} sm={12} md={8} key={index}>
                        <InfoCard {...item} />
                    </Col>
                ))}
            </Row>

            <BreakdownModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
            >
                {modalContent}
            </BreakdownModal>
        </>
    );
}
