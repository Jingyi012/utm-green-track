import { useMemo, useState } from 'react';
import { Alert, App, Button, Card, Col, Row, Space, Spin, Typography } from 'antd';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { ModalForm, PageContainer, ProCard, ProFormTextArea } from '@ant-design/pro-components';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import { WasteRecordStatus, wasteRecordStatusLabels } from '@/lib/enum/status';
import {
  useDeleteWasteRecord,
  useSaveWasteRecord,
  useUpdateWasteRecordApprovalStatus,
  useWasteRecordDetail,
} from '@/hook/wasteRecords';
import { useAuth } from '@/contexts/AuthContext';
import { useWasteRecordDropdownOptions, useProfileDropdownOptions } from '@/hook/options';
import WasteRecordForm from './WasteRecordForm';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationOutlined,
} from '@ant-design/icons';
import { WasteRecord } from '@/lib/types/wasteRecord';

const { Text, Title } = Typography;
export type WasteRecordSource = 'view-form' | 'management' | 'approval' | 'requests';

const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div style={{ marginBottom: 16 }}>
    <Text type="secondary">{label}</Text>
    <div style={{ marginTop: 4, fontWeight: 500, wordBreak: 'break-word' }}>{value || '-'}</div>
  </div>
);

interface WasteRecordDetailPageProps {
  source?: WasteRecordSource;
}

const WasteRecordDetailPage: React.FC<WasteRecordDetailPageProps> = ({ source = 'view-form' }) => {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<WasteRecordStatus | null>(null);
  const searchStr = useLocation({ select: (location) => location.searchStr });
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const wasteRecordId = searchParams.get('wasteRecordId') ?? undefined;
  const isEditRoute = searchParams.get('mode') === 'edit';
  const parentTab = searchParams.get('tab');
  const { departments } = useProfileDropdownOptions();
  const { campuses, disposalMethods } = useWasteRecordDropdownOptions();
  const { data: record, isLoading: loading } = useWasteRecordDetail(
    wasteRecordId ?? '',
    Boolean(wasteRecordId),
  );
  const { mutateAsync: saveWasteRecord } = useSaveWasteRecord();
  const { mutateAsync: deleteWasteRecord, isPending: isDeleting } = useDeleteWasteRecord();
  const { mutateAsync: updateApprovalStatus, isPending: isReviewing } =
    useUpdateWasteRecordApprovalStatus();
  const isAdmin = hasRole('Admin');
  const isApprovalSource = source === 'approval';
  const canEditRecord = Boolean(
    record && (isAdmin || record.status === WasteRecordStatus.RevisionRequired),
  );
  const canReviewRecord = Boolean(record && isAdmin && isApprovalSource);
  const isEditMode = isEditRoute && canEditRecord && !isApprovalSource;
  const pageContext = useMemo(() => {
    switch (source) {
      case 'management':
        return {
          parentPath: '/waste-data/management',
          detailPath: '/waste-data/management/record',
          parentTitle: 'Management',
          pageTitle: isEditMode ? 'Edit Waste Record' : 'Waste Record Details',
        };
      case 'approval':
        return {
          parentPath: '/waste-data/approval',
          detailPath: '/waste-data/approval/record',
          parentTitle: 'Approval',
          pageTitle: isEditMode ? 'Review Waste Record' : 'Waste Record Details',
        };
      case 'requests':
        return {
          parentPath: '/waste-data/requests',
          detailPath: '/waste-data/requests/record',
          parentTitle: 'Requests',
          pageTitle: isEditMode ? 'Edit Waste Record' : 'Waste Record Details',
        };
      default:
        return {
          parentPath: '/data-entry/view-form',
          detailPath: '/data-entry/view-form/record',
          parentTitle: 'View Form',
          pageTitle: isEditMode ? 'Edit Waste Record' : 'Waste Record Details',
        };
    }
  }, [isEditMode, source]);

  const parentHref = useMemo(() => {
    if (!parentTab) {
      return pageContext.parentPath;
    }

    return `${pageContext.parentPath}?tab=${parentTab}`;
  }, [pageContext.parentPath, parentTab]);

  const buildDetailHref = (mode?: 'edit') => {
    if (!wasteRecordId) {
      return pageContext.detailPath;
    }

    const params = new URLSearchParams({ wasteRecordId });
    if (parentTab) {
      params.set('tab', parentTab);
    }
    if (mode) {
      params.set('mode', mode);
    }

    return `${pageContext.detailPath}?${params.toString()}`;
  };

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

  const statusGuidance = useMemo(() => {
    if (!record) {
      return null;
    }

    if (record.status === WasteRecordStatus.RevisionRequired) {
      return {
        type: 'warning' as const,
        message: 'Revision required',
        description:
          'Admin approved the change request and expects this record to be updated. Review the comment below, edit the record, then submit it again.',
      };
    }

    if (record.status === WasteRecordStatus.Rejected) {
      return {
        type: 'error' as const,
        message: 'Record rejected',
        description:
          'This record was rejected and needs attention before it can move forward. Review the comment below to understand what went wrong.',
      };
    }

    if (record.status === WasteRecordStatus.New) {
      return {
        type: 'info' as const,
        message: 'Waiting for approval',
        description:
          'This record is currently in the approval queue. If it was revised recently, admin still needs to review the updated submission.',
      };
    }

    return {
      type: 'success' as const,
      message: 'Record verified',
      description: 'This record is complete and no further action is required right now.',
    };
  }, [record]);

  const handleWasteRecordUpdate = async (wasteRecord: Partial<WasteRecord>) => {
    if (!record?.id) {
      return false;
    }

    try {
      await saveWasteRecord({
        id: record.id,
        campusId: wasteRecord.campusId,
        departmentId: wasteRecord.departmentId,
        disposalMethodId: wasteRecord.disposalMethodId,
        wasteTypeId: wasteRecord.wasteTypeId,
        location: wasteRecord.location,
        unit: wasteRecord.unit,
        program: wasteRecord.program,
        programDate: wasteRecord.programDate,
        wasteWeight: wasteRecord.wasteWeight,
        status: wasteRecord.status,
        date: wasteRecord.date,
        comment: wasteRecord.comment,
        uploadedAttachments: wasteRecord.uploadedAttachments,
        originalAttachmentIds: record.attachments?.map((attachment) => attachment.id) ?? [],
        isAdmin,
      });

      return true;
    } catch {
      return false;
    }
  };

  const confirmDeletion = () => {
    if (!record?.id) {
      return;
    }

    modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this waste record?',
      okText: 'Yes',
      cancelText: 'Cancel',
      okButtonProps: { danger: true, loading: isDeleting },
      onOk: async () => {
        await deleteWasteRecord({ id: record.id });
        void navigate({ href: parentHref });
      },
    });
  };

  const goToViewMode = () => {
    void navigate({ href: buildDetailHref() });
  };

  const goToEditMode = () => {
    if (wasteRecordId && canEditRecord && !isApprovalSource) {
      void navigate({ href: buildDetailHref('edit') });
    }
  };

  const handleReviewUpdate = async (status: WasteRecordStatus, comment?: string) => {
    if (!record?.id) {
      return false;
    }

    try {
      await updateApprovalStatus({
        wasteRecordIds: [record.id],
        status,
        comment,
      });

      return true;
    } catch {
      return false;
    }
  };

  const openReviewModal = (status: WasteRecordStatus) => {
    setReviewStatus(status);
    setReviewModalOpen(true);
  };

  const modalSummary = useMemo(() => {
    if (reviewStatus === WasteRecordStatus.RevisionRequired) {
      return {
        type: 'warning' as const,
        message: 'Tell the requester exactly what to fix',
        description:
          'Explain the incorrect fields, the expected values, and any missing evidence so the user knows how to revise the record.',
      };
    }

    return {
      type: 'error' as const,
      message: 'Explain why the record is being rejected',
      description:
        'Use rejection for submissions that should not proceed, not for minor corrections.',
    };
  }, [reviewStatus]);

  let approvalActions: React.ReactNode[] | undefined;

  if (record && canReviewRecord) {
    if (record.status === WasteRecordStatus.New) {
      approvalActions = [
        <Button
          key="verify"
          type="primary"
          icon={<CheckOutlined />}
          loading={isReviewing}
          onClick={() => void handleReviewUpdate(WasteRecordStatus.Verified)}
        >
          Verify
        </Button>,
        <Button
          key="reject"
          danger
          icon={<CloseOutlined />}
          loading={isReviewing}
          onClick={() => openReviewModal(WasteRecordStatus.Rejected)}
        >
          Reject
        </Button>,
        <Button
          key="revision"
          icon={<ExclamationOutlined />}
          loading={isReviewing}
          onClick={() => openReviewModal(WasteRecordStatus.RevisionRequired)}
        >
          Request Revision
        </Button>,
      ];
    } else if (record.status === WasteRecordStatus.Verified) {
      approvalActions = [
        <Button
          key="revision"
          icon={<ExclamationOutlined />}
          loading={isReviewing}
          onClick={() => openReviewModal(WasteRecordStatus.RevisionRequired)}
        >
          Request Revision
        </Button>,
        <Button
          key="reject"
          danger
          icon={<CloseOutlined />}
          loading={isReviewing}
          onClick={() => openReviewModal(WasteRecordStatus.Rejected)}
        >
          Reject
        </Button>,
      ];
    } else if (record.status === WasteRecordStatus.Rejected) {
      approvalActions = [
        <Button
          key="verify"
          type="primary"
          icon={<CheckOutlined />}
          loading={isReviewing}
          onClick={() => void handleReviewUpdate(WasteRecordStatus.Verified)}
        >
          Verify
        </Button>,
        <Button
          key="revision"
          icon={<ExclamationOutlined />}
          loading={isReviewing}
          onClick={() => openReviewModal(WasteRecordStatus.RevisionRequired)}
        >
          Request Revision
        </Button>,
      ];
    } else if (record.status === WasteRecordStatus.RevisionRequired) {
      approvalActions = [
        <Button
          key="verify"
          type="primary"
          icon={<CheckOutlined />}
          loading={isReviewing}
          onClick={() => void handleReviewUpdate(WasteRecordStatus.Verified)}
        >
          Verify
        </Button>,
        <Button
          key="reject"
          danger
          icon={<CloseOutlined />}
          loading={isReviewing}
          onClick={() => openReviewModal(WasteRecordStatus.Rejected)}
        >
          Reject
        </Button>,
      ];
    }
  }

  return (
    <PageContainer
      title={pageContext.pageTitle}
      extra={
        isEditMode
          ? [
              <Button key="view" onClick={goToViewMode}>
                View Mode
              </Button>,
            ]
          : canReviewRecord
            ? approvalActions
            : canEditRecord
              ? [
                  <Button key="edit" type="primary" icon={<EditOutlined />} onClick={goToEditMode}>
                    Edit Record
                  </Button>,
                  <Button
                    key="delete"
                    danger
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    onClick={confirmDeletion}
                  >
                    Delete Record
                  </Button>,
                ]
              : undefined
      }
      breadcrumb={{
        items: [
          ...(source === 'view-form'
            ? [{ title: 'Data Entry', path: '/data-entry' }]
            : [{ title: 'Waste Data', path: '/waste-data' }]),
          { title: pageContext.parentTitle, path: pageContext.parentPath },
          { title: 'Waste Record Details' },
        ],
      }}
      onBack={() => void navigate({ href: parentHref })}
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
          {statusGuidance && (
            <Alert
              type={statusGuidance.type}
              showIcon
              message={statusGuidance.message}
              description={statusGuidance.description}
            />
          )}

          {isEditMode ? (
            <ProCard title="Edit Waste Record" bordered>
              <WasteRecordForm
                campuses={campuses}
                departments={departments}
                disposalMethods={disposalMethods}
                visible={isEditMode}
                initialValues={record ?? {}}
                isEditMode
                onCancel={goToViewMode}
                onSubmit={handleWasteRecordUpdate}
              />
            </ProCard>
          ) : (
            <>
              <ProCard title="Basic Information" bordered>
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
                    <DetailField
                      label="Program Date"
                      value={dateTimeFormatter(record.programDate)}
                    />
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
            </>
          )}

          <ModalForm<{ comment: string }>
            title={
              reviewStatus === WasteRecordStatus.Rejected ? 'Reject Record' : 'Request Revision'
            }
            modalProps={{
              destroyOnHidden: true,
            }}
            open={reviewModalOpen}
            onOpenChange={(open) => {
              setReviewModalOpen(open);
              if (!open) {
                setReviewStatus(null);
              }
            }}
            onFinish={async (values) => {
              if (!reviewStatus) {
                return false;
              }

              const success = await handleReviewUpdate(reviewStatus, values.comment);

              if (success) {
                setReviewModalOpen(false);
                setReviewStatus(null);
              }

              return success;
            }}
            submitter={{
              searchConfig: {
                submitText: 'Submit',
              },
            }}
          >
            <Alert
              type={modalSummary.type}
              showIcon
              message={modalSummary.message}
              description={modalSummary.description}
              style={{ marginBottom: 16 }}
            />
            <ProFormTextArea
              name="comment"
              label="Comment"
              placeholder={
                reviewStatus === WasteRecordStatus.Rejected
                  ? 'Explain why this record is being rejected'
                  : 'Explain exactly what must be revised'
              }
              rules={[
                { required: true, message: 'Comment is required' },
                { min: 10, message: 'Please provide at least 10 characters' },
              ]}
              fieldProps={{ showCount: true, maxLength: 500, autoSize: { minRows: 4, maxRows: 8 } }}
            />
          </ModalForm>
        </Space>
      )}
    </PageContainer>
  );
};

export default WasteRecordDetailPage;
