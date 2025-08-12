'use client'
import { useEffect, useState } from "react";
import InfoCardGrid from "./InfoCardGrid";
import { Card, Col, message, Row, Select, Skeleton } from "antd";
import { getCampusYearlySummary } from "@/lib/services/wasteRecord";
import { Column } from "@ant-design/charts";
import { DisposalMethod, DisposalMethodLabels } from "@/lib/enum/disposalMethod";
import { Campus, CampusLabels } from "@/lib/enum/campus";
import { MonthlyDisposalSummary, TotalSummary } from "@/lib/types/wasteSummary";

export function transformMonthlyChartData(
    rawData: MonthlyDisposalSummary[],
    year = 2025
): MonthlyDisposalSummary[] {
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(year, i).toLocaleString("default", { month: "short" })
    );

    const disposalMethods = Object.values(DisposalMethod);

    const dataMap = new Map<string, MonthlyDisposalSummary>();

    // Initialize all months × disposal methods to 0
    for (const month of allMonths) {
        for (const method of disposalMethods) {
            const label = DisposalMethodLabels[method];
            const key = `${month}_${label}`;
            dataMap.set(key, {
                month,
                disposalMethod: label,
                wasteType: '',
                totalWeight: 0,
            });
        }
    }

    // Overwrite with actual values
    rawData.forEach((item) => {
        const month = new Date(year, Number(item.month) - 1).toLocaleString("default", { month: "short" });
        const methodLabel = DisposalMethodLabels[item.disposalMethod as DisposalMethod];
        const key = `${month}_${methodLabel}`;

        if (dataMap.has(key)) {
            dataMap.set(key, {
                month,
                disposalMethod: methodLabel,
                wasteType: '',
                totalWeight: Number(item.totalWeight.toFixed(2)),
            });
        }
    });

    return Array.from(dataMap.values());
}

const DashboardSection: React.FC = () => {
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
    const [summary, setSummary] = useState<TotalSummary>({
        totalWasteGenerated: 0,
        totalWasteRecycled: 0,
        totalWasteToLandfill: 0,
        totalGHGReduction: 0,
        totalLandfillCostSavings: 0
    });
    const [monthlyChartData, setMonthlyChartData] = useState<MonthlyDisposalSummary[]>([]);

    const fecthMonthlyData = async () => {
        try {
            setChartLoading(true);

            const response = await getCampusYearlySummary(campus, year);

            if (response.data.summary) {
                setSummary(response.data.summary);
            }

            if (response.data.monthlySummary) {
                const chartData = transformMonthlyChartData(response.data.monthlySummary);
                setMonthlyChartData(chartData);
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
        yField: 'totalWeight',
        stack: true,
        colorField: 'disposalMethod',
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