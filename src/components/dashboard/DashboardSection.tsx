'use client'
import { useEffect, useState } from "react";
import InfoCardGrid from "./InfoCardGrid";
import { Card, Col, message, Row, Select, Skeleton } from "antd";
import { getCampusYearlySummary } from "@/lib/services/wasteRecord";
import { Column } from "@ant-design/charts";
import { MonthlyWasteSummary, TotalSummary } from "@/lib/types/wasteSummary";
import { useWasteRecordDropdownOptions } from "@/hook/options";
import { MONTH_LABELS_SHORT } from "@/lib/enum/monthName";

export interface ChartDataItem {
    month: string;
    disposalMethod: string;
    //wasteType: string;
    totalWeight: number;
}

export function transformMonthlyChartData(
    rawData: MonthlyWasteSummary[],
    disposalMethods: string[],
): ChartDataItem[] {
    const monthLabels = MONTH_LABELS_SHORT;

    // Initialize all months × disposalMethods with 0
    const chartData: ChartDataItem[] = monthLabels.flatMap((monthName, monthIndex) =>
        disposalMethods.map(method => ({
            month: monthName,
            disposalMethod: method,
            totalWeight: 0,
        }))
    );

    // Build a lookup for quick update
    const lookup = new Map<string, ChartDataItem>();
    chartData.forEach(item => {
        lookup.set(`${item.month}_${item.disposalMethod}`, item);
    });

    // Apply actual rawData if any
    rawData.forEach(summary => {
        const monthName = monthLabels[summary.month - 1];

        summary.wasteTypeTotals.forEach(total => {
            const key = `${monthName}_${total.disposalMethod}`;
            const existing = lookup.get(key);
            if (existing) {
                existing.totalWeight += total.totalWeight;
            }
        });
    });

    return chartData;
}

const DashboardSection: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: currentYear - 2023 + 1 },
        (_, i) => {
            const year = 2023 + i;
            return { label: year.toString(), value: year };
        }
    ).reverse();
    const { campuses, disposalMethods } = useWasteRecordDropdownOptions();
    const [selectedCampus, setSelectedCampus] = useState<string>();
    const [year, setYear] = useState(currentYear);
    const [chartLoading, setChartLoading] = useState<boolean>(false);
    const [summary, setSummary] = useState<TotalSummary>({
        totalWasteGenerated: 0,
        totalWasteRecycled: 0,
        totalWasteToLandfill: 0,
        totalGhgReduction: 0,
        totalLandfillCostSavings: 0
    });
    const [monthlyChartData, setMonthlyChartData] = useState<ChartDataItem[]>([]);

    const fecthMonthlyData = async () => {
        try {
            setChartLoading(true);

            const response = await getCampusYearlySummary(selectedCampus!, year);

            if (response.data.totalSummary) {
                setSummary(response.data.totalSummary);
            }

            if (response.data.monthlyWasteSummary) {
                const disposalMethodNames = disposalMethods.map(method => method.name);
                const chartData = transformMonthlyChartData(response.data.monthlyWasteSummary, disposalMethodNames);
                setMonthlyChartData(chartData);
            }

        } catch {
            message.error("Failed to fetch monthly data")
        } finally {
            setChartLoading(false);
        }
    };

    useEffect(() => {
        if (campuses && campuses.length > 0) {
            const defaultCampus = campuses.find((c) => c.name === "UTM Johor Bahru");
            setSelectedCampus(defaultCampus?.name);
        }
    }, [campuses]);

    useEffect(() => {
        if (year && selectedCampus)
            fecthMonthlyData();
    }, [year, selectedCampus]);

    const config = {
        title: "UTM Solid Waste Generation Trends",
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
                        value={selectedCampus}
                        onChange={(value) => setSelectedCampus(value)}
                        options={(campuses).map((campus) => ({
                            label: campus.name,
                            value: campus.name,
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