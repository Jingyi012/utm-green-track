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
export default function InfoCardGrid() {
    const cardData = [
        { icon: <FaFileAlt />, itemLabel: 'Total Waste Generated', value: `${500} Tonnes` },
        { icon: <FaRecycle />, itemLabel: 'Total Waste Recycled', value: `${50} Tonnes` },
        { icon: <FaTrashAlt />, itemLabel: 'Total Waste to Landfill', value: `${450} Tonnes` },
        { icon: <FaLeaf />, itemLabel: 'Total GHG Reduction', value: `${70000} kgCO2eq` },
        { icon: <FaMoneyBillWave />, itemLabel: 'Landfill Cost Saving', value: `RM ${150000}` },
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
