import { Empty, Tabs } from 'antd';
import { YearlyDataAnalyticsResponse } from '@/lib/types/dataAnalytics';
import { YearlySummarySection } from './YearlySummarySection';
import { WasteGenerationSection } from './WasteGenerationSection';
import { WasteDiversionSection } from './WasteDiversionSection';
import { WasteManagementCostSection } from './WasteManagementCostSection';

export const YEARLY_ANALYTICS_SECTION_KEYS = [
  'summary',
  'waste-generation',
  'waste-diversion',
  'waste-management-cost',
] as const;

export type YearlyAnalyticsSectionKey = (typeof YEARLY_ANALYTICS_SECTION_KEYS)[number];

interface YearlyAnalyticsPanelProps {
  data?: YearlyDataAnalyticsResponse;
  activeSection: YearlyAnalyticsSectionKey;
  onSectionChange: (section: YearlyAnalyticsSectionKey) => void;
}

export function YearlyAnalyticsPanel({
  data,
  activeSection,
  onSectionChange,
}: YearlyAnalyticsPanelProps) {
  if (!data) {
    return <Empty description="No yearly analytics data available." />;
  }

  return (
    <Tabs
      activeKey={activeSection}
      destroyOnHidden
      animated={false}
      onChange={(key) => onSectionChange(key as YearlyAnalyticsSectionKey)}
      items={[
        {
          key: 'summary',
          label: 'Summary',
          children: <YearlySummarySection data={data.summary} />,
        },
        {
          key: 'waste-generation',
          label: 'Waste Generation Analysis',
          children: <WasteGenerationSection data={data.wasteGeneration} />,
        },
        {
          key: 'waste-diversion',
          label: 'Waste Diversion Analysis',
          children: <WasteDiversionSection data={data.wasteDiversion} />,
        },
        {
          key: 'waste-management-cost',
          label: 'Waste Management Cost Analysis',
          children: <WasteManagementCostSection data={data.wasteManagementCost} />,
        },
      ]}
    />
  );
}
