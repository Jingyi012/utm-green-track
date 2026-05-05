import { ProCard, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Flex } from 'antd';
import type { ReactNode } from 'react';

interface OptionValue {
  label: string;
  value: string | number;
}

interface AnalyticsFiltersProps {
  campusId?: string;
  campusOptions: OptionValue[];
  onCampusChange: (campusId: string) => void;
  year?: number;
  yearOptions?: OptionValue[];
  onYearChange?: (year: number) => void;
  startYear?: number;
  endYear?: number;
  rangeYearOptions?: OptionValue[];
  onStartYearChange?: (year: number) => void;
  onEndYearChange?: (year: number) => void;
  actionNode?: ReactNode;
}

export function AnalyticsFilters({
  campusId,
  campusOptions,
  onCampusChange,
  year,
  yearOptions,
  onYearChange,
  startYear,
  endYear,
  rangeYearOptions,
  onStartYearChange,
  onEndYearChange,
  actionNode,
}: AnalyticsFiltersProps) {
  return (
    <ProCard bordered>
      <ProForm submitter={false}>
        <Flex gap={16} align="flex-end" style={{ width: '100%', flexWrap: 'wrap' }}>
          <ProFormSelect
            name="campus"
            label="UTM Campus"
            rules={[{ required: true, message: 'UTM Campus is required' }]}
            width="md"
            options={campusOptions}
            fieldProps={{
              value: campusId,
              onChange: (value) => onCampusChange(String(value)),
              optionFilterProp: 'label',
              showSearch: true,
              allowClear: false,
            }}
          />
          {yearOptions && onYearChange ? (
            <ProFormSelect
              name="year"
              label="Year"
              rules={[{ required: true, message: 'Year is required' }]}
              width="md"
              options={yearOptions}
              fieldProps={{
                value: year,
                onChange: (value) => onYearChange(Number(value)),
                optionFilterProp: 'label',
                showSearch: true,
                allowClear: false,
              }}
            />
          ) : null}

          {rangeYearOptions && onStartYearChange ? (
            <ProFormSelect
              name="startYear"
              label="Start Year"
              width="sm"
              options={rangeYearOptions}
              fieldProps={{
                value: startYear,
                onChange: (value) => onStartYearChange(Number(value)),
                optionFilterProp: 'label',
                showSearch: true,
                allowClear: false,
              }}
            />
          ) : null}

          {rangeYearOptions && onEndYearChange ? (
            <ProFormSelect
              name="endYear"
              label="End Year"
              width="sm"
              options={rangeYearOptions}
              fieldProps={{
                value: endYear,
                onChange: (value) => onEndYearChange(Number(value)),
                optionFilterProp: 'label',
                showSearch: true,
                allowClear: false,
              }}
            />
          ) : null}

          {actionNode ? <div style={{ marginLeft: 'auto' }}>{actionNode}</div> : null}
        </Flex>
      </ProForm>
    </ProCard>
  );
}
