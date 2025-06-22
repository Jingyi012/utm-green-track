'use client';

import { Row, Col, Select } from 'antd';
import { useState } from 'react';

export default function CampusYearSelector() {
    const [campus, setCampus] = useState(null);
    const [year, setYear] = useState(null);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: currentYear - 2020 + 1 },
        (_, i) => {
            const year = 2020 + i;
            return { label: year.toString(), value: year };
        }
    ).reverse();

    return (
        <Row gutter={16} wrap align="middle" justify="space-between" >
            <Col xs={24} sm={12} md={8}>
                <label>UTM Campus</label>
                <Select
                    placeholder="Choose a campus"
                    value={campus}
                    onChange={(value) => setCampus(value)}
                    options={[
                        { label: "UTM Johor Bahru", value: "UTM Johor Bahru" },
                        { label: "UTM Kuala Lumpur", value: "UTM Kuala Lumpur" },
                        { label: "UTM Pagoh", value: "UTM Pagoh" },
                    ]}
                    style={{ width: '100%' }}
                />
            </Col>
            <Col xs={24} sm={12} md={8}>
                <label>Year</label>
                <Select
                    placeholder="Choose a year"
                    value={year}
                    onChange={(value) => setYear(value)}
                    options={yearOptions}
                    style={{ width: '100%' }}
                />
            </Col>
        </Row>
    );
}
