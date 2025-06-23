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
    totalWaste: number;
    totalRecycled: number;
    totalLandfilled: number;
    totalGHGReduction: number;
    totalLandfillSavings: number;
}

export default function InfoCardGrid({
    totalWaste,
    totalRecycled,
    totalLandfilled,
    totalGHGReduction,
    totalLandfillSavings,
}: InfoCardGrid) {
    const format = (num: number | undefined) => (num ?? 0).toFixed(2);

    const cardData = [
        { icon: <FaFileAlt />, itemLabel: 'Total Waste Generated', value: `${format(totalWaste)} Tonnes` },
        { icon: <FaRecycle />, itemLabel: 'Total Waste Recycled', value: `${format(totalRecycled)} Tonnes` },
        { icon: <FaTrashAlt />, itemLabel: 'Total Waste to Landfill', value: `${format(totalLandfilled)} Tonnes` },
        { icon: <FaLeaf />, itemLabel: 'Total GHG Reduction', value: `${format(totalGHGReduction)} kg CO₂e` },
        { icon: <FaMoneyBillWave />, itemLabel: 'Landfill Cost Saving', value: `RM ${format(totalLandfillSavings)}` },
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