'use client'
import { useEffect, useState } from "react";
import InfoCardGrid from "./InfoCardGrid";
import { Card, Col, message, Row, Select, Spin } from "antd";
import { getMonthlyCampusWasteChartByYear } from "@/lib/api/wasteRecord";
import { Column } from "@ant-design/charts";
import { CampusMonthlyChart } from "@/lib/types/campusMonthlyChart";

const DashboardSection = () => {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: currentYear - 2025 + 1 },
        (_, i) => {
            const year = 2025 + i;
            return { label: year.toString(), value: year };
        }
    ).reverse();

    const [campus, setCampus] = useState("UTM Johor Bahru");
    const [year, setYear] = useState(currentYear);
    const [chartLoading, setChartLoading] = useState<boolean>(false);
    const [summary, setSummary] = useState({
        totalWaste: 0,
        totalRecycled: 0,
        totalLandfilled: 0,
        totalGHGReduction: 0,
        totalLandfillSavings: 0
    });
    const [monthlyChartData, setMonthlyChartData] = useState([]);

    const fecthMonthlyData = async () => {
        try {
            setChartLoading(true);

            const response = await getMonthlyCampusWasteChartByYear(campus, year);

            if (response.data.summary) {
                setSummary(response.data.summary);
            }

            if (response.data.monthlySummary) {

                const monthlyChartData = response.data.monthlySummary.flatMap((item: CampusMonthlyChart) => [
                    { month: item.month, category: 'Landfilling', value: item.landfilling },
                    { month: item.month, category: 'Recycling', value: item.recycling },
                    { month: item.month, category: 'Composting', value: item.composting },
                    { month: item.month, category: 'Energy Recovery', value: item.energyRecovery },
                ]);
                setMonthlyChartData(monthlyChartData);
            }

        } catch {
            message.error("Failed to fetch monthly data")
        } finally {
            setChartLoading(false);
        }
    };

    useEffect(() => {
        fecthMonthlyData();
    }, [year, campus]);

    const config = {
        data: monthlyChartData,
        xField: 'month',
        yField: 'value',
        stack: true,
        colorField: 'category',
        legend: {
            position: 'top',
        },
        xAxis: {
            label: {
                autoRotate: false,
            },
        },
        axis: {
            x: { title: 'MONTHS', tickCount: 24 },
            y: { title: 'WEIGHT (TONNES)', grid: true },
        },
        interactions: [
            {
                type: 'active-region',
                enable: false,
            },
        ],
    };

    return (
        <>
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
            <br />
            <Spin spinning={chartLoading}>
                <InfoCardGrid {...summary} />
                <br />
                <Card>
                    <Column {...config} />
                </Card>
            </Spin>
        </>
    )
}

export default DashboardSection;