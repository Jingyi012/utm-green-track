'use client';

import { useEffect, useMemo, useState } from 'react';
import { App, Card, Col, Row, Space, Spin, Typography } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { WasteRecord } from '@/lib/types/wasteRecord';
import { getWasteRecordById } from '@/lib/services/wasteRecord';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import { WasteRecordStatus, wasteRecordStatusLabels } from '@/lib/enum/status';

const { Text, Title } = Typography;

const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div style={{ marginBottom: 16 }}>
    <Text type="secondary">{label}</Text>
    <div style={{ marginTop: 4, fontWeight: 500, wordBreak: 'break-word' }}>{value || '-'}</div>
  </div>
);

const WasteRecordDetailPage: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasteRecordId = searchParams.get('wasteRecordId') ?? undefined;

  const [loading, setLoading] = useState<boolean>(false);
  const [record, setRecord] = useState<WasteRecord | null>(null);

  useEffect(() => {
    if (!wasteRecordId) {
      message.error('Waste record id is missing');
      return;
    }

    const fetchRecord = async () => {
      setLoading(true);
      try {
        const res = await getWasteRecordById(wasteRecordId);
        if (res.success) {
          setRecord(res.data);
        } else {
          message.error(res.message || 'Failed to load waste record');
        }
      } catch {
        message.error('Failed to load waste record');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [wasteRecordId, message]);

  const attachmentContent = useMemo(() => {
    if (!record?.attachments?.length) {
      return '-';
    }

    return (
      <Space direction="vertical" size={4}>
        {record.attachments.map((file) => (
          <a key={file.id} href={file.filePath} target="_blank" rel="noopener noreferrer">
            {file.fileName}
          </a>
        ))}
      </Space>
    );
  }, [record]);

  return (
    <PageContainer
      title="Waste Record Details"
      breadcrumb={{
        items: [
          { title: 'Data Entry', path: '/data-entry' },
          { title: 'View Form', path: '/data-entry/view-form' },
          { title: 'Waste Record Details' },
        ],
      }}
      onBack={() => router.push('/data-entry/view-form')}
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      )}

      {!loading && !record && (
        <Card>
          <Text type="secondary">No waste record found.</Text>
        </Card>
      )}

      {!loading && record && (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <ProCard title="Basic Information" bordered>
            <Title level={5}>Record Context</Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <DetailField label="Date" value={dateTimeFormatter(record.date)} />
              </Col>
              <Col xs={24} md={12}>
                <DetailField label="UTM Campus" value={record.campus} />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <DetailField
                  label="Faculty / Department / College / PTJ"
                  value={record.department}
                />
              </Col>
              <Col xs={24} md={12}>
                <DetailField label="Unit" value={record.unit} />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <DetailField label="Location" value={record.location} />
              </Col>
              <Col xs={24} md={12}>
                <DetailField label="Status" value={wasteRecordStatusLabels[record.status]} />
              </Col>
            </Row>
          </ProCard>

          <ProCard title="Waste Diversion Initiative" bordered>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <DetailField label="Program" value={record.program} />
              </Col>
              <Col xs={24} md={12}>
                <DetailField label="Program Date" value={dateTimeFormatter(record.programDate)} />
              </Col>
            </Row>
          </ProCard>

          <ProCard title="Waste Information" bordered>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <DetailField label="Disposal Method" value={record.disposalMethod} />
              </Col>
              <Col xs={24} md={12}>
                <DetailField label="Waste Type" value={record.wasteType} />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <DetailField label="Waste Weight (kg)" value={record.wasteWeight?.toString()} />
              </Col>
              <Col xs={24} md={12}>
                <DetailField label="Attachments" value={attachmentContent} />
              </Col>
            </Row>
          </ProCard>

          {(record.status === WasteRecordStatus.RevisionRequired ||
            record.status === WasteRecordStatus.Rejected) && (
            <ProCard title="Comment" bordered>
              <DetailField label="Comment" value={record.comment} />
            </ProCard>
          )}
        </Space>
      )}
    </PageContainer>
  );
};

export default WasteRecordDetailPage;
