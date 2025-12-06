'use client';

import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from "@/hook/options";
import { WasteRecordStatus, wasteRecordStatusLabels } from "@/lib/enum/status";
import { ActionType, ModalForm, PageContainer, ProColumns, ProFormText, ProTable } from "@ant-design/pro-components";
import { App, Button, Tooltip } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useRef } from "react";
import WasteRecordDrawerForm from "./WasteRecordDrawerForm";
import { WasteRecord, WasteRecordFilter } from "@/lib/types/wasteRecord";
import { deleteAttachment, deleteWasteRecord, exportExcelWasteRecords, exportPdfWasteRecords, getWasteRecordsPaginated, updateWasteRecord, uploadAttachments } from "@/lib/services/wasteRecord";
import { useAuth } from "@/contexts/AuthContext";
import { createRequest } from "@/lib/services/requestService";
import { downloadFile } from "@/lib/utils/downloadFile";
import { DeleteOutlined, EditOutlined, FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { ExportWasteRecordModal } from "./ExportWasteRecordModal";
import { getBaseColumns } from './columns';

interface WasteRecordManagementProps {
    isViewForm?: boolean;
}

const WasteRecordManagement: React.FC<WasteRecordManagementProps> = ({ isViewForm = false }) => {
    const { message, modal } = App.useApp();
    const { hasRole } = useAuth();
    const { departments } = useProfileDropdownOptions();
    const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
    const [loading, setLoading] = useState<boolean>(false);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<WasteRecord>();
    const [modalDrawerOpen, setModalDrawerOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

    const actionRef = useRef<ActionType | undefined>(undefined);
    const isAdmin = hasRole('Admin');
    const [modalOpen, setModalOpen] = useState<false | "excel" | "pdf">(false);

    const [changeRequestModalOpen, setChangeRequestModalOpen] = useState<boolean>(false);

    const fetchData = async (filter: WasteRecordFilter) => {
        setLoading(true);
        try {
            const res = await getWasteRecordsPaginated({
                ...filter,
            });
            return {
                data: res.data,
                success: res.success,
                total: res.totalCount
            }
        } catch (err) {
            message.error("Failed to fetch waste records");
            return {
                data: [],
                success: false,
                total: 0
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWasteRecordUpdate = async (wasteRecord: WasteRecord) => {
        try {
            setLoading(true);
            const fileList = wasteRecord.uploadedAttachments ?? [];

            const newAttachments = fileList.filter(f => f.originFileObj);

            const initialAttachmentIds = selectedRecord?.attachments?.map(f => f.id) ?? [];

            const currentIds = fileList.filter(f => !f.originFileObj).map(f => f.uid);

            const fileToRemove = initialAttachmentIds.filter(id => !currentIds.includes(id));

            // if is not admin user submit update record, change status from required revision to new
            if (!isAdmin) {
                wasteRecord.status = WasteRecordStatus.New
            }
            const res = await updateWasteRecord(wasteRecord.id, {
                ...wasteRecord,
                id: wasteRecord.id,
            });

            if (!res.success) {
                message.error(res.message || "Failed to update wasteRecord");
                return false;
            }

            if (newAttachments.length > 0) {
                await uploadAttachments(newAttachments, wasteRecord.id);
            }

            if (fileToRemove.length > 0) {
                await Promise.all(fileToRemove.map(id => deleteAttachment(id)));
            }

            message.success("Waste record updated successfully");
            return true;
        } catch (err) {
            message.error("Failed to update wasteRecord");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const confirmDeletion = async (wasteRecord: WasteRecord) => {
        modal.confirm({
            title: 'Confirm Deletion',
            content: 'Are you sure you want to delete this waste record?',
            okText: 'Yes',
            cancelText: 'Cancel',
            onOk: async () => handleWasteRecordDelete(wasteRecord),
        });
    }

    const handleWasteRecordDelete = async (wasteRecord: WasteRecord) => {
        try {
            setLoading(true);

            const res = await deleteWasteRecord(wasteRecord.id);

            if (res.success) {
                message.success("Waste record deleted successfully");
                actionRef.current?.reload();
            }
            else {
                message.error("Failed to delete waste record, please try again");
            }
        } catch (err) {
            message.error("Failed to delete waste record, please try again");
        } finally {
            setLoading(false);
        }
    }

    const handleExportExcel = async (year: number, month: number) => {

        const hide = message.loading("Generating Excel...");
        try {
            setExcelLoading(true);
            const response = await exportExcelWasteRecords({ year, month });
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, "Waste_Records.xlsx");
        } catch (err: any) {
            message.error('Failed to generate Excel');
        } finally {
            setExcelLoading(false);
            hide();
        }
    };

    const handleExportPDF = async (year: number, month: number) => {
        const hide = message.loading("Generating Pdf...");
        try {
            setPdfLoading(true);
            const response = await exportPdfWasteRecords({ year, month });
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, "Waste_Records.pdf");
        } catch (err: any) {
            message.error('Failed to generate PDF');
        } finally {
            setPdfLoading(false);
            hide();
        }
    };

    const handleChangeRequest = async (wasteRecordId: string | undefined, reqMessage: string) => {
        const hide = message.loading("Sending request...", 0);
        try {
            const res = await createRequest({
                wasteRecordId: wasteRecordId,
                message: reqMessage,
            });
            if (res.success) {
                if (actionRef.current) {
                    actionRef.current.reload();
                }
                message.success("Request created successfully");
                return true;
            } else {
                message.error("Failed to send request");
                return false;
            }
        } catch (err) {
            message.error("Failed to send request")
        } finally {
            hide();
        }
    };

    const columns: ProColumns<WasteRecord>[] = [
        ...getBaseColumns({ campuses, departments, disposalMethods }),
        {
            title: "Action",
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                return <>
                    {
                        (isAdmin || record.status == WasteRecordStatus.RevisionRequired) && (
                            <>
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setSelectedRecord(record);
                                        setModalDrawerOpen(true);
                                        setEditMode(true);
                                    }}
                                />
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        confirmDeletion(record);
                                    }}
                                />
                            </>
                        )
                    }
                    {!isAdmin && record.status != WasteRecordStatus.Verified && record.status != WasteRecordStatus.RevisionRequired &&
                        (
                            <Button
                                type="link"
                                onClick={() => {
                                    setSelectedRecord(record);
                                    setChangeRequestModalOpen(true);
                                }}>
                                Request Changes
                            </Button>
                        )
                    }
                </>
            }
        }
    ];

    return (
        <PageContainer
            title={!isViewForm ? 'Waste Record Management' : "View Form"}
        >
            <ProTable<WasteRecord>
                rowKey="id"
                headerTitle="Waste Record List"
                actionRef={actionRef}
                loading={loading || isLoading}
                columns={columns}
                pagination={{
                    showSizeChanger: true
                }}
                request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                    return fetchData({
                        ...params,
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
                        isAdmin: isAdmin
                    });
                }}
                toolbar={{
                    actions: [
                        <Button
                            key="excel"
                            loading={excelLoading}
                            icon={<FileExcelOutlined />}
                            onClick={() => setModalOpen("excel")}
                        >
                            Excel
                        </Button>,
                        <Button
                            key="pdf"
                            loading={pdfLoading}
                            icon={<FilePdfOutlined />}
                            danger
                            onClick={() => setModalOpen("pdf")}
                        >
                            PDF
                        </Button>,
                    ],
                }}
                search={{
                    layout: 'vertical',
                    labelWidth: 'auto',
                }}
            />

            <WasteRecordDrawerForm
                campuses={campuses}
                departments={departments}
                disposalMethods={disposalMethods}
                onCancel={() => {
                    setModalDrawerOpen(false);
                    setEditMode(false);
                    setTimeout(() => setSelectedRecord(undefined), 300);
                }
                }
                onSubmit={async (value) => {
                    const success = await handleWasteRecordUpdate(value as WasteRecord);
                    if (success) {
                        if (actionRef.current) {
                            actionRef.current.reload();
                        }
                        return true;
                    }
                    return false;
                }}
                visible={modalDrawerOpen}
                initialValues={selectedRecord || {}}
                isEditMode={editMode}
                handleDelete={async () => confirmDeletion(selectedRecord!)}
            />

            <ExportWasteRecordModal
                open={!!modalOpen}
                type={modalOpen || "excel"}
                onCancel={() => setModalOpen(false)}
                onConfirm={(year: number, month: number) => {
                    if (modalOpen === "excel") handleExportExcel(year, month);
                    if (modalOpen === "pdf") handleExportPDF(year, month);
                }}
            />
            <ModalForm
                title="Request Changes"
                open={changeRequestModalOpen}
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => {
                        setSelectedRecord(undefined);
                        setChangeRequestModalOpen(false);
                    },
                }}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedRecord(undefined);
                        setChangeRequestModalOpen(false);
                    }
                }}
                onFinish={async (values) => {
                    const success = await handleChangeRequest(selectedRecord?.id, values.message);
                    if (success) {
                        if (actionRef.current) {
                            actionRef.current.reload();
                        }
                        return true;
                    } else {
                        return false;
                    }
                }}
                submitter={{
                    searchConfig: {
                        submitText: 'Submit',
                    },
                }}
            >
                <ProFormText
                    label="Message"
                    name="message"
                    placeholder="Please enter message"
                    rules={[{ required: true }]}
                />
            </ModalForm>
        </PageContainer>
    );
};

export default WasteRecordManagement;
