'use client';

import { useWasteRecordDropdownOptions } from '@/hook/options';
import { getAllConfig, updateConfig } from '@/lib/services/config';
import { Config } from '@/lib/types/typing';
import { EditOutlined } from '@ant-design/icons';
import { ModalForm, ProColumns, ProFormText, ProTable } from '@ant-design/pro-components';
import { App, Button, Select, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const LANDFILLING_COST_PREFIX = 'LandfillingCost';
const UTM_POPULATION_PREFIX = 'UTMPopulation';
const CONFIG_START_YEAR = 2020;

type YearFilterValue = number | 'all';

interface CampusYearConfigRow {
  key: string;
  campus: string;
  year: number;
  value: string;
}

interface CampusYearConfigDefinition {
  title: string;
  prefix: string;
  defaultValue: string;
  valueLabel: string;
}

const CONFIG_DEFINITIONS: Record<'landfilling' | 'population', CampusYearConfigDefinition> = {
  landfilling: {
    title: 'Landfilling Cost by Campus and Year',
    prefix: LANDFILLING_COST_PREFIX,
    defaultValue: '146',
    valueLabel: 'Cost',
  },
  population: {
    title: 'UTM Population by Campus and Year',
    prefix: UTM_POPULATION_PREFIX,
    defaultValue: '0',
    valueLabel: 'Population',
  },
};

const toCampusToken = (campusName: string): string =>
  campusName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

const buildCampusYearKey = (prefix: string, campusName: string, year: number): string =>
  `${prefix}_${toCampusToken(campusName)}_${year}`;

const buildYearOptions = (currentYear: number): number[] =>
  Array.from({ length: currentYear - CONFIG_START_YEAR + 1 }, (_, index) => CONFIG_START_YEAR + index).sort(
    (a, b) => b - a,
  );

const CampusYearConfigTable: React.FC<{ definition: CampusYearConfigDefinition }> = ({ definition }) => {
  const { message } = App.useApp();
  const { campuses, isLoading: isCampusLoading } = useWasteRecordDropdownOptions();

  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<CampusYearConfigRow[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<YearFilterValue>(new Date().getFullYear());
  const [selectedConfig, setSelectedConfig] = useState<Config>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [refreshSeed, setRefreshSeed] = useState<number>(0);

  const currentYear = new Date().getFullYear();
  const campusSignature = useMemo(
    () => campuses.map((campus) => campus.name).join('|'),
    [campuses],
  );

  useEffect(() => {
    const campusNames = campusSignature ? campusSignature.split('|') : [];
    const availableYears = buildYearOptions(currentYear);
    setYearOptions(availableYears);

    if (campusNames.length === 0) {
      setRows([]);
      return;
    }

    let cancelled = false;

    const fetchConfigs = async () => {
      setLoading(true);
      try {
        const response = await getAllConfig({
          prefix: definition.prefix,
          year: selectedYear === 'all' ? undefined : selectedYear,
        });

        if (cancelled) return;
        if (!response.success) {
          setRows([]);
          return;
        }

        const configMap = new Map(response.data.map((item) => [item.key, item.value]));
        const yearsToDisplay = selectedYear === 'all' ? availableYears : [selectedYear];

        const nextRows = campusNames.flatMap((campusName) =>
          yearsToDisplay.map((year) => {
            const key = buildCampusYearKey(definition.prefix, campusName, year);
            return {
              key,
              campus: campusName,
              year,
              value: configMap.get(key) ?? definition.defaultValue,
            };
          }),
        );

        setRows(nextRows);
      } catch {
        if (!cancelled) {
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchConfigs();

    return () => {
      cancelled = true;
    };
  }, [
    campusSignature,
    currentYear,
    definition.defaultValue,
    definition.prefix,
    refreshSeed,
    selectedYear,
  ]);

  const handleEditConfig = async (key: string, value: string) => {
    try {
      setLoading(true);
      const response = await updateConfig({ key, value });

      if (!response.success) {
        message.error(response.message || 'Failed to update config');
        return false;
      }

      message.success('Configuration updated successfully');
      setRefreshSeed((prev) => prev + 1);
      return true;
    } catch {
      message.error('Failed to update config');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumns<CampusYearConfigRow>[] = [
    {
      title: 'Campus',
      dataIndex: 'campus',
      width: 280,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      width: 120,
      align: 'center',
    },
    {
      title: definition.valueLabel,
      dataIndex: 'value',
      align: 'center',
    },
    {
      title: 'Action',
      valueType: 'option',
      align: 'center',
      render: (_: unknown, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedConfig({ key: record.key, value: record.value });
            setModalOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <ProTable<CampusYearConfigRow>
        headerTitle={definition.title}
        loading={loading || isCampusLoading}
        rowKey="key"
        dataSource={rows}
        columns={columns}
        search={false}
        pagination={false}
        toolBarRender={() => [
          <Space key="year-filter" align="center">
            <Typography.Text type="secondary">Year</Typography.Text>
            <Select<YearFilterValue>
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ minWidth: 140 }}
              options={[
                { label: 'All Years', value: 'all' },
                ...yearOptions.map((year) => ({ label: String(year), value: year })),
              ]}
            />
          </Space>,
        ]}
      />

      <ModalForm
        title={`Edit ${definition.valueLabel}`}
        open={modalOpen}
        initialValues={selectedConfig || {}}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setSelectedConfig(undefined);
            setModalOpen(false);
          },
        }}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedConfig(undefined);
            setModalOpen(false);
          }
        }}
        onFinish={async (values) => handleEditConfig(values.key, values.value)}
        submitter={{
          searchConfig: {
            submitText: 'Submit',
          },
        }}
      >
        <ProFormText label="Key" name="key" rules={[{ required: true }]} disabled />
        <ProFormText
          label={definition.valueLabel}
          name="value"
          rules={[{ required: true, message: `${definition.valueLabel} is required` }]}
          placeholder={`Please enter ${definition.valueLabel.toLowerCase()}`}
        />
      </ModalForm>
    </>
  );
};

export const LandfillingCostConfig: React.FC = () => (
  <CampusYearConfigTable definition={CONFIG_DEFINITIONS.landfilling} />
);

export const UtmPopulationConfig: React.FC = () => (
  <CampusYearConfigTable definition={CONFIG_DEFINITIONS.population} />
);
