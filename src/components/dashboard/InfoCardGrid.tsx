'use client';

import { Col, Row } from 'antd';
import InfoCard from './InfoCard';
import Image from 'next/image';
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
    totalGhgReduction: number;
    totalLandfillCostSavings: number;
}

export default function InfoCardGrid({
    totalWasteGenerated,
    totalWasteRecycled,
    totalWasteToLandfill,
    totalGhgReduction,
    totalLandfillCostSavings,
}: InfoCardGrid) {
    const format = (num: number | undefined) => (num ?? 0).toFixed(2);

    const cardData = [
        {
            icon: (
                <Image
                    src="/icons/totalWasteGenerated.png"
                    alt="Total Waste Generated"
                    width={50}
                    height={50}
                    style={{ objectFit: 'contain' }}
                />
            ),
            itemLabel: 'Total Waste Generated',
            value: format(totalWasteGenerated),
            unit: 'Tonnes',
        },
        {
            icon: (
                <Image
                    src="/icons/totalWasteReduction.png"
                    alt="Total Waste Reduction"
                    width={50}
                    height={50}
                    style={{ objectFit: 'contain' }}
                />
            ),
            itemLabel: 'Total Waste Reduction',
            value: format(totalWasteRecycled),
            unit: 'Tonnes',
        },
        {
            icon: (
                <Image
                    src="/icons/totalWasteToLandfill.png"
                    alt="Total Waste to Landfill"
                    width={50}
                    height={50}
                    style={{ objectFit: 'contain' }}
                />
            ),
            itemLabel: 'Total Waste to Landfill',
            value: format(totalWasteToLandfill),
            unit: 'Tonnes',
        },
        {
            icon: (
                <Image
                    src="/icons/totalGHGReduction.png"
                    alt="Total GHG Reduction"
                    width={50}
                    height={50}
                    style={{ objectFit: 'contain' }}
                />
            ),
            itemLabel: 'Total GHG Reduction',
            value: format(totalGhgReduction),
            unit: 'kg CO₂e',
        },
        {
            icon: (
                <Image
                    src="/icons/landfillCostSaving.png"
                    alt="Landfill Cost Saving"
                    width={50}
                    height={50}
                    style={{ objectFit: 'contain' }}
                />
            ),
            itemLabel: 'Landfill Cost Saving',
            value: `${format(totalLandfillCostSavings)}`,
            unit: 'RM',
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            {cardData.map((item, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                    <InfoCard icon={item.icon} itemLabel={item.itemLabel} value={item.value} unit={item.unit} />
                </Col>
            ))}
        </Row>
    );
}