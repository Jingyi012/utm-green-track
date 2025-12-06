"use client";
import { Modal, Space } from "antd";
import dayjs from "dayjs";
import { ProForm, ProFormSelect, ProFormText } from "@ant-design/pro-components";

interface ExportWasteReportModalProps {
    open: boolean;
    onCancel: () => void;
    onConfirm: (year: number, campusId?: string, departmentId?: string, unit?: string) => Promise<void>;
    isAdmin?: boolean;
    campuses?: { id: string; name: string }[];
    departments?: { id: string; name: string }[];
}

export const ExportWasteReportModal = ({
    open,
    onCancel,
    onConfirm,
    isAdmin = false,
    campuses = [],
    departments = [],
}: ExportWasteReportModalProps) => {
    const currentYear = dayjs().year();

    const handleFinish = (values: any) => {
        onConfirm(values.year, values.campusId, values.departmentId, values.unit);
        onCancel();
    };

    return (
        <Modal
            title="Export Waste Report"
            open={open}
            footer={null}
            onCancel={onCancel}
            destroyOnHidden
        >
            <ProForm
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ year: currentYear, month: 0 }}
                submitter={{
                    searchConfig: { submitText: "Export" },
                    render: (props, dom) => (
                        <div style={{ textAlign: "right", marginTop: 16 }}>
                            <div style={{ display: "inline-block" }}>
                                <Space size="small">
                                    {dom}
                                </Space>
                            </div>
                        </div>
                    )
                }}
            >
                <ProFormSelect
                    name="year"
                    label="Year"
                    rules={[{ required: true }]}
                    options={[currentYear, currentYear - 1, currentYear - 2].map((y) => ({
                        label: y,
                        value: y,
                    }))}
                />

                {isAdmin && (
                    <>
                        <ProFormSelect
                            name="campusId"
                            label="Campus"
                            placeholder="Select campus"
                            options={campuses.map((c) => ({ label: c.name, value: c.id }))}
                            fieldProps={{
                                showSearch: true,
                                optionFilterProp: "label",
                            }}
                            rules={[{ required: true }]}
                            allowClear
                        />

                        <ProFormSelect
                            name="departmentId"
                            label="Department"
                            placeholder="Select department"
                            options={departments.map((d) => ({ label: d.name, value: d.id }))}
                            fieldProps={{
                                showSearch: true,
                                optionFilterProp: "label",
                            }}
                            rules={[{ required: true }]}
                            allowClear
                        />
                        <ProFormText
                            name="unit"
                            placeholder="Enter PTJ / Unit"
                            label="PTJ / Unit"
                        />
                    </>
                )}
            </ProForm>
        </Modal>
    );
};
