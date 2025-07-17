'use client'
import { useEffect, useState } from "react";
import InfoCardGrid from "./InfoCardGrid";
import { Card, Col, message, Row, Select, Skeleton, Spin } from "antd";
import { getMonthlyCampusWasteChartByYear } from "@/lib/services/wasteRecord";
import { Column } from "@ant-design/charts";
import { CampusMonthlyChart } from "@/lib/types/campusMonthlyChart";
import { DisposalMethod, DisposalMethodLabels } from "@/lib/enum/disposalMethod";
import { toPascalCase } from "@/lib/utils/formatter";
import { Campus, CampusLabels } from "@/lib/enum/campus";

const DashboardSection = () => {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: currentYear - 2025 + 1 },
        (_, i) => {
            const year = 2025 + i;
            return { label: year.toString(), value: year };
        }
    ).reverse();

    const [campus, setCampus] = useState(Campus.UTMJohorBahru);
    const [year, setYear] = useState(currentYear);
    const [chartLoading, setChartLoading] = useState<boolean>(false);
    const [summary, setSummary] = useState({
        totalWaste: 0,
        totalRecycled: 0,
        totalLandfilled: 0,
        totalGHGReduction: 0,
        totalLandfillSavings: 0
    });
    const [monthlyChartData, setMonthlyChartData] = useState<{ month: string; category: string; value: number; }[]>([]);

    const fecthMonthlyData = async () => {
        try {
            setChartLoading(true);

            const response = await getMonthlyCampusWasteChartByYear(campus, year);

            if (response.data.summary) {
                setSummary(response.data.summary);
            }

            if (response.data.monthlySummary) {

                const monthlyChartData = response.data.monthlySummary.flatMap((item: CampusMonthlyChart) => [
                    { month: toPascalCase(item.month), category: DisposalMethodLabels[DisposalMethod.Landfilling], value: item.landfilling },
                    { month: toPascalCase(item.month), category: DisposalMethodLabels[DisposalMethod.Recycling], value: item.recycling },
                    { month: toPascalCase(item.month), category: DisposalMethodLabels[DisposalMethod.Composting], value: item.composting },
                    { month: toPascalCase(item.month), category: DisposalMethodLabels[DisposalMethod.EnergyRecovery], value: item.energyRecovery },
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
        <Card title={"Dashboard"}>
            <Row gutter={16} wrap align="middle" justify="space-between" >
                <Col xs={24} sm={12} md={8}>
                    <label>UTM Campus</label>
                    <Select
                        placeholder="Choose a campus"
                        value={campus}
                        onChange={(value) => setCampus(value)}
                        options={Object.values(Campus).map((campus) => ({
                            label: CampusLabels[campus],
                            value: campus,
                        }))}
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
            <Skeleton loading={chartLoading}>
                <InfoCardGrid {...summary} />
                <br />
                <Card>
                    <Column {...config} />
                </Card>
            </Skeleton>
        </Card>
    )
}

export default DashboardSection;