'use client';

import { Col, Row } from 'antd';
import InfoCard from './InfoCard';
import {
    FaFileAlt,
    FaRecycle,
    FaTrashAlt,
    FaLeaf,
    FaMoneyBillWave,
} from 'react-icons/fa';

interface InfoCardGrid {
    totalWasteGenerated: number;
    totalWasteRecycled: number;
    totalWasteToLandfill: number;
    totalGHGReduction: number;
    totalLandfillCostSavings: number;
}

export default function InfoCardGrid({
    totalWasteGenerated,
    totalWasteRecycled,
    totalWasteToLandfill,
    totalGHGReduction,
    totalLandfillCostSavings,
}: InfoCardGrid) {
    const format = (num: number | undefined) => (num ?? 0).toFixed(2);

    const cardData = [
        { icon: <FaFileAlt />, itemLabel: 'Total Waste Generated', value: `${format(totalWasteGenerated)} Tonnes` },
        { icon: <FaRecycle />, itemLabel: 'Total Waste Recycled', value: `${format(totalWasteRecycled)} Tonnes` },
        { icon: <FaTrashAlt />, itemLabel: 'Total Waste to Landfill', value: `${format(totalWasteToLandfill)} Tonnes` },
        { icon: <FaLeaf />, itemLabel: 'Total GHG Reduction', value: `${format(totalGHGReduction)} kg CO₂e` },
        { icon: <FaMoneyBillWave />, itemLabel: 'Landfill Cost Saving', value: `RM ${format(totalLandfillCostSavings)}` },
    ];

    return (
        <Row gutter={[16, 16]}>
            {cardData.map((item, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                    <InfoCard icon={item.icon} itemLabel={item.itemLabel} value={item.value} />
                </Col>
            ))}
        </Row>
    );
}