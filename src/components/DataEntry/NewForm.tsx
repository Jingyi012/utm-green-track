'use client';

import {
    Card,
    Row,
    Col,
    Button,
    Table,
    Typography,
    Upload,
    UploadFile,
    App,
} from 'antd';
import {
    ProForm,
    ProFormSelect,
    ProFormText,
    ProFormDigit,
    ProFormDateTimePicker,
    PageContainer,
} from '@ant-design/pro-components';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { createWasteRecords } from '@/lib/services/wasteRecord';
import { WasteRecordInput } from '@/lib/types/wasteRecord';
import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';
import { WasteTypeWithEmissionFactor } from '@/lib/types/typing';
import EditFormModal from './EditFormModal';
import { useWasteEntryStore } from '@/lib/store/useWasteEntryStore';
import { dateTimeFormatter } from '@/lib/utils/formatter';

const { Title } = Typography;

export default function WasteEntryForm() {
    const [form] = ProForm.useForm();
    const { message, modal } = App.useApp();
    const { departments } = useProfileDropdownOptions();
    const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
    const {
        tableData,
        addRecord,
        updateRecord,
        deleteRecord,
        clearRecords,
    } = useWasteEntryStore();

    const [editingRecord, setEditingRecord] = useState<WasteRecordInput | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDisposalMethod, setSelectedDisposalMethod] = useState<string>();
    const [wasteTypes, setWasteTypes] = useState<WasteTypeWithEmissionFactor[]>([]);

    const handleDisposalMethodChange = (value: string) => {
        setSelectedDisposalMethod(value);
        const selectedMethod = disposalMethods.find(dm => dm.id === value);
        form.resetFields(["wasteType"]);
        setWasteTypes(selectedMethod?.wasteTypes ?? []);
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            const newRow = {
                key: `${Date.now()}`,
                date: new Date().toLocaleDateString('en-GB'),
                ...values,
                wasteWeight: Number(values.wasteWeight),
                attachments: values.attachments || [],
            };
            addRecord(newRow);
            form.resetFields();
            setSelectedDisposalMethod(undefined);
            setWasteTypes([]);
        } catch (err) {
            message.error('Please complete all required fields before adding.');
        }
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleSaveEdit = (values: any, recordKey: string) => {
        updateRecord(recordKey, values);
        message.success('Row updated successfully');
    };

    const handleDelete = (key: string) => {
        modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this entry?',
            okText: 'Yes, Delete',
            cancelText: 'Cancel',
            onOk: () => {
                deleteRecord(key);
                message.success('Row deleted successfully');
            },
        });
    };

    const handleSubmit = async () => {
        if (tableData.length === 0) {
            return message.warning("No data to submit. Please add at least one entry.");
        }

        modal.confirm({
            title: "Confirm Submission",
            content: "Are you sure you want to submit all the waste records?",
            okText: "Yes, Submit",
            cancelText: "Cancel",
            onOk: async () => {
                const hide = message.loading("Submitting records...", 0);

                try {
                    const wasteRecords = tableData.map((record: WasteRecordInput) => ({
                        ...record,
                        date: new Date().toISOString(),
                        attachments: (record.attachments ?? [])
                            .map((f: any) => f.originFileObj as File)
                            .filter(Boolean),
                    }));
                    // Batch submit all records in one request
                    const response = await createWasteRecords({
                        wasteRecords,
                    });

                    if (response && response.success) {
                        message.success("All waste records submitted successfully");
                        clearRecords();
                        form.resetFields();
                        setSelectedDisposalMethod(undefined);
                        setWasteTypes([]);
                    } else {
                        message.error(response.message || "Failed to submit waste records");
                    }
                } catch (err: any) {
                    console.error("Batch submission failed:", err);
                    message.error(err.message || "Unexpected error occurred during submission");
                } finally {
                    hide();
                }
            },
        });
    };

    const columns = [
        {
            title: 'No.',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
            width: 60,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            width: 100,
        },
        {
            title: 'UTM Campus',
            dataIndex: 'campusId',
            render: (campusId: string) => {
                const campus = campuses.find(c => c.id === campusId);
                return campus?.name ?? '-';
            },
            width: 120,
        },
        {
            title: 'Faculty / Department / College',
            dataIndex: 'departmentId',
            render: (departmentId: string) => {
                const department = departments.find(d => d.id === departmentId);
                return department?.name ?? "-";
            },
            width: 150,
        },
        {
            title: 'PTJ / Unit',
            dataIndex: 'unit',
            width: 150,
        },
        {
            title: 'Location',
            dataIndex: 'location',
            width: 150,
        },
        {
            title: 'Program Name',
            dataIndex: 'program',
            width: 150,
        },
        {
            title: 'Name of Program / Initiative (if any)',
            dataIndex: 'programDate',
            width: 150,
            render: (programDate: any) => {
                return dateTimeFormatter(programDate);
            }
        },
        {
            title: 'Disposal Method',
            dataIndex: 'disposalMethodId',
            render: (methodId: string) => {
                const method = disposalMethods.find(d => d.id === methodId);
                return method?.name ?? "-";
            },
            width: 150,
        },
        {
            title: 'Waste Type',
            dataIndex: 'wasteTypeId',
            render: (wasteTypeId: string, record: any) => {
                const method = disposalMethods.find(d => d.id === record.disposalMethodId);
                const wasteType = method?.wasteTypes.find(w => w.id === wasteTypeId);
                return wasteType?.name ?? "-";
            },
            width: 150,
        },
        {
            title: 'Waste Weight (kg)',
            dataIndex: 'wasteWeight',
            width: 120,
        },
        {
            title: 'Attachment',
            dataIndex: 'attachments',
            render: (attachments: UploadFile[]) =>
                attachments?.length > 0
                    ? attachments.map((file, index) => {
                        const blob = file.originFileObj;
                        const url = blob ? URL.createObjectURL(blob) : null;

                        return (
                            <div key={index}>
                                {url ? (
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        {file.name}
                                    </a>
                                ) : (
                                    file.name
                                )}
                            </div>
                        );
                    })
                    : 'None',
            width: 200,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: { key: string }) => (
                <>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Edit record"
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.key)}
                        title="Delete record"
                    />
                </>
            ),
            width: 100,
            fixed: 'right' as const,
        }
    ];

    return (
        <PageContainer title={false}>
            <Card loading={isLoading} style={{ marginBottom: 24 }}>
                <ProForm
                    form={form}
                    layout="vertical"
                    submitter={false}
                    onFinish={handleAdd}
                >
                    <Title level={5}>Basic Information</Title>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <ProFormSelect
                                name="campusId"
                                label="UTM Campus"
                                placeholder="Please select campus"
                                rules={[{ required: true, message: 'Please select a campus' }]}
                                options={campuses.map((campus) => ({
                                    label: campus.name,
                                    value: campus.id,
                                }))}
                                fieldProps={{
                                    showSearch: true,
                                    optionFilterProp: "label",
                                }}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProFormSelect
                                name="departmentId"
                                label="Faculty / Department / College"
                                placeholder="Select your department"
                                options={departments.map((dept) => ({
                                    label: dept.name,
                                    value: dept.id,
                                }))}
                                rules={[{ required: true, message: 'Please select your faculty / department' }]}
                                showSearch
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <ProFormText
                                name="unit"
                                label="PTJ / Unit"
                                placeholder="Please enter PTJ / unit"
                                rules={[{ required: true, message: 'Please enter PTJ / unit' }]}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProFormText
                                name="location"
                                label="Location"
                                placeholder="Please enter location"
                                rules={[{ required: true, message: 'Please enter location' }]}
                            />
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <ProFormText
                                name="program"
                                label="Name of Program/Initiative (if any)"
                                placeholder="Please enter program / initiative name"
                                rules={[]}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProFormDateTimePicker
                                name="programDate"
                                label="Date of Program/ Initiative"
                                placeholder="Please enter date of program / initiative"
                                rules={[]}
                            />
                        </Col>
                    </Row>

                    <Title level={5} style={{ marginTop: 12 }}>Waste Information</Title>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <ProFormSelect
                                name="disposalMethodId"
                                label="Disposal Method"
                                placeholder="Please select disposal method"
                                rules={[{ required: true, message: 'Please select disposal method' }]}
                                options={disposalMethods.map((method) => ({
                                    label: method.name,
                                    value: method.id,
                                }))}
                                fieldProps={{
                                    onChange: handleDisposalMethodChange,
                                    showSearch: true,
                                    optionFilterProp: "label",
                                }}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProFormSelect
                                name="wasteTypeId"
                                label="Waste Type"
                                placeholder="Please select waste type"
                                rules={[{ required: true, message: 'Please select waste type' }]}
                                options={wasteTypes.map(wt => ({
                                    label: wt.name,
                                    value: wt.id,
                                }))}
                                fieldProps={{
                                    disabled: !selectedDisposalMethod,
                                    showSearch: true,
                                    optionFilterProp: "label",
                                }}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProFormDigit
                                name="wasteWeight"
                                label="Waste Weight (kg)"
                                placeholder="Please enter waste weight"
                                rules={[{
                                    required: true,
                                    message: 'Please enter waste weight'
                                }]}
                                fieldProps={{
                                    min: 0,
                                    step: 0.1,
                                    precision: 2,
                                }}
                                min={0}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProForm.Item
                                name="attachments"
                                label="Attachment"
                                rules={[{
                                    required: true,
                                    message: 'Please upload attachment'
                                }]}
                                valuePropName="fileList"
                                getValueFromEvent={(e: { fileList: any; }) => {
                                    if (Array.isArray(e)) {
                                        return e;
                                    }
                                    return e?.fileList;
                                }}
                            >
                                <Upload
                                    beforeUpload={(file) => {
                                        const isLt5M = file.size / 1024 / 1024 < 5;
                                        if (!isLt5M) {
                                            message.error('File must be smaller than 5MB!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        return false;
                                    }}
                                    multiple
                                >
                                    <Button icon={<UploadOutlined />}>Click to upload files</Button>
                                </Upload>
                            </ProForm.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: 24 }}>
                        <Col>
                            <Button type="primary" onClick={() => form.submit()}>
                                Add to Table
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                onClick={() => {
                                    form.resetFields();
                                    setSelectedDisposalMethod(undefined);
                                    setWasteTypes([]);
                                }}
                                danger
                            >
                                Reset Form
                            </Button>
                        </Col>
                    </Row>
                </ProForm>
            </Card>

            <Card>
                <Table
                    dataSource={tableData}
                    columns={columns}
                    pagination={false}
                    bordered
                    scroll={{ x: 1000 }}
                    style={{ marginBottom: 16 }}
                />
                <div className="flex justify-center">
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        disabled={tableData.length === 0}
                    >
                        Submit All Records
                    </Button>
                </div>
            </Card>

            <EditFormModal
                open={isModalOpen}
                record={editingRecord}
                campuses={campuses}
                departments={departments}
                disposalMethods={disposalMethods}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingRecord(null);
                }}
                onSave={handleSaveEdit}
            />
        </PageContainer>
    );
}