'use client';

import { Select, Space } from 'antd';

const { Option } = Select;

interface YearMonthPickerProps {
  year?: number;
  month?: number; // 0 = yearly, >0 = monthly
  onChange?: (value: { year: number; month: number }) => void;
}

const YearMonthPicker: React.FC<YearMonthPickerProps> = ({ year, month = 0, onChange }) => {
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const months = [
    { label: 'All', value: 0 }, // yearly
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  return (
    <Space>
      {/* Year selection */}
      <Select
        value={year}
        placeholder="Year"
        style={{ width: 120 }}
        onChange={(val) => onChange?.({ year: val, month })}
      >
        {years.map((y) => (
          <Option key={y} value={y}>
            {y}
          </Option>
        ))}
      </Select>

      {/* Month selection */}
      <Select
        value={month}
        placeholder="Month"
        style={{ width: 140 }}
        onChange={(val) => onChange?.({ year: year!, month: val })}
        showSearch
        optionFilterProp="label"
      >
        {months.map((m) => (
          <Option key={m.value} value={m.value}>
            {m.label}
          </Option>
        ))}
      </Select>
    </Space>
  );
};

export default YearMonthPicker;
