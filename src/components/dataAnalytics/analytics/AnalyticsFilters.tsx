import { ProCard, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Space } from 'antd';

interface OptionValue {
  label: string;
  value: string | number;
}

interface AnalyticsFiltersProps {
  year: number;
  campusId?: string;
  yearOptions: OptionValue[];
  campusOptions: OptionValue[];
  onYearChange: (year: number) => void;
  onCampusChange: (campusId: string) => void;
}

export function AnalyticsFilters({
  year,
  campusId,
  yearOptions,
  campusOptions,
  onYearChange,
  onCampusChange,
}: AnalyticsFiltersProps) {
  return (
    <ProCard bordered>
      <ProForm submitter={false}>
        <Space wrap size="middle">
          <ProFormSelect
            name="year"
            label="Year"
            rules={[{ required: true, message: 'Year is required' }]}
            width={140}
            options={yearOptions}
            fieldProps={{
              value: year,
              onChange: (value) => onYearChange(Number(value)),
              optionFilterProp: 'label',
              showSearch: true,
              allowClear: false,
            }}
          />

          <ProFormSelect
            name="campus"
            label="UTM Campus"
            rules={[{ required: true, message: 'UTM Campus is required' }]}
            width={280}
            options={campusOptions}
            fieldProps={{
              value: campusId,
              onChange: (value) => onCampusChange(String(value)),
              optionFilterProp: 'label',
              showSearch: true,
              allowClear: false,
            }}
          />
        </Space>
      </ProForm>
    </ProCard>
  );
}
