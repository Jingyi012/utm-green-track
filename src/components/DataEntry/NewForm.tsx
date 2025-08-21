'use client';

import {
    Card,
    Row,
    Col,
    Button,
    Table,
    Typography,
    message,
    Modal,
    Upload,
} from 'antd';
import {
    ProForm,
    ProFormSelect,
    ProFormText,
    ProFormDigit,
    ProFormUploadButton,
    ProFormUploadDragger,
} from '@ant-design/pro-components';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { createWasteRecord, uploadAttachments } from '@/lib/services/wasteRecord';
import { WasteRecordInput } from '@/lib/types/wasteRecord';
import { useWasteRecordDropdownOptions } from '@/hook/options';
import { WasteTypeWithEmissionFactor } from '@/lib/types/typing';

const { Title } = Typography;

export default function WasteEntryForm() {
    const [form] = ProForm.useForm();
    const [editForm] = ProForm.useForm();

    const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
    const [tableData, setTableData] = useState<WasteRecordInput[]>([]);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDisposalMethod, setSelectedDisposalMethod] = useState<string>();
    const [wasteTypes, setWasteTypes] = useState<WasteTypeWithEmissionFactor[]>([]);

    const handleDisposalMethodChange = (value: string) => {
        setSelectedDisposalMethod(value);
        const selectedMethod = disposalMethods.find(dm => dm.id === value);
        form.setFieldValue('wasteType', null);
        editForm.setFieldValue('wasteType', null);
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
                file: values.file || [],
            };
            setTableData(prev => [...prev, newRow]);
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
        editForm.setFieldsValue(record);

        // Set waste types for the editing record
        const method = disposalMethods.find(dm => dm.id === record.disposalMethod);
        setWasteTypes(method?.wasteTypes ?? []);
        setSelectedDisposalMethod(record.disposalMethod);
    };

    const handleSaveEdit = async (values: any) => {
        setTableData((prev) =>
            prev.map((item) =>
                item.key === editingRecord.key ? { ...item, ...values } : item
            )
        );
        setIsModalOpen(false);
        setEditingRecord(null);
        message.success('Row updated successfully');
    };

    const handleDelete = (key: string) => {
        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this entry?',
            okText: 'Yes, Delete',
            cancelText: 'Cancel',
            onOk: () => {
                setTableData((prev) => prev.filter((item) => item.key !== key));
                message.success('Row deleted successfully');
            },
        });
    };

    const handleSubmit = async () => {
        if (tableData.length === 0) {
            return message.warning('No data to submit. Please add at least one entry.');
        }

        Modal.confirm({
            title: 'Confirm Submission',
            content: 'Are you sure you want to submit all the waste records?',
            okText: 'Yes, Submit',
            cancelText: 'Cancel',
            onOk: async () => {
                const hide = message.loading("Submitting records...", 0);
                const failedRecords: any[] = [];

                try {
                    for (const record of tableData) {
                        try {
                            // 1. Create waste record
                            const createResponse = await createWasteRecord({
                                campus: record.campus,
                                location: record.location,
                                disposalMethodId: record.disposalMethod,
                                wasteTypeId: record.wasteType,
                                wasteWeight: record.wasteWeight,
                                date: new Date().toISOString(),
                            });

                            const createdId = createResponse.data;
                            if (!createdId) throw new Error('Failed to obtain record ID');

                            // 2. Upload attachments if exist
                            const fileList: File[] = (record.file ?? [])
                                .map((f: any) => f.originFileObj)
                                .filter(Boolean);

                            if (fileList.length > 0) {
                                await uploadAttachments(fileList, createdId);
                            }

                        } catch (recordErr) {
                            console.error('Failed to submit record:', recordErr);
                            failedRecords.push(record);
                        }
                    }

                    if (failedRecords.length === 0) {
                        message.success('All waste records submitted successfully');
                        setTableData([]);
                        form.resetFields();
                        setSelectedDisposalMethod(undefined);
                        setWasteTypes([]);
                    } else if (failedRecords.length === tableData.length) {
                        message.error('Failed to submit all waste records. Please try again.');
                    } else {
                        message.warning(
                            `${failedRecords.length} out of ${tableData.length} records failed to submit.`
                        );
                    }

                } catch (err: any) {
                    message.error(err.message || 'Unexpected error occurred during submission');
                } finally {
                    hide(); // always close loading
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
            dataIndex: 'campus',
            render: (campusName: string) => {
                const campus = campuses.find(c => c.name === campusName);
                return campus?.name ?? '-';
            },
            width: 120,
        },
        {
            title: 'Location',
            dataIndex: 'location',
            width: 150,
        },
        {
            title: 'Disposal Method',
            dataIndex: 'disposalMethod',
            render: (methodId: string) => {
                const method = disposalMethods.find(d => d.id === methodId);
                return method?.name ?? "-";
            },
            width: 150,
        },
        {
            title: 'Waste Type',
            dataIndex: 'wasteType',
            render: (wasteTypeId: string, record: any) => {
                const method = disposalMethods.find(d => d.id === record.disposalMethod);
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
            dataIndex: 'file',
            render: (files: any[]) => files?.length > 0 ? `${files.length} file(s)` : 'None',
            width: 100,
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
        <>
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
                                name="campus"
                                label="UTM Campus"
                                placeholder="Please select campus"
                                rules={[{ required: true, message: 'Please select a campus' }]}
                                options={campuses.map((campus) => ({
                                    label: campus.name,
                                    value: campus.name,
                                }))}
                                fieldProps={{
                                    showSearch: true,
                                    optionFilterProp: "label",
                                }}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProFormText
                                name="location"
                                label="Location"
                                placeholder="Please enter location"
                                fieldProps={{
                                    maxLength: 200,
                                }}
                            />
                        </Col>
                    </Row>

                    <Title level={5} style={{ marginTop: 24 }}>Waste Information</Title>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <ProFormSelect
                                name="disposalMethod"
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
                                name="wasteType"
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
                                name="file"
                                label="Attachment"
                                rules={[{ required: false }]}
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

            <Modal
                title="Edit Waste Record"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingRecord(null);
                }}
                footer={null}
                width={600}
                destroyOnClose
            >
                <ProForm
                    form={editForm}
                    layout="vertical"
                    submitter={false}
                    onFinish={handleSaveEdit}
                >
                    <ProFormSelect
                        name="campus"
                        label="UTM Campus"
                        placeholder="Please select campus"
                        rules={[{ required: true, message: 'Please select a campus' }]}
                        options={campuses.map((campus) => ({
                            label: campus.name,
                            value: campus.name,
                        }))}
                        fieldProps={{
                            showSearch: true,
                        }}
                    />

                    <ProFormText
                        name="location"
                        label="Location"
                        placeholder="Please enter location"
                    />

                    <ProFormSelect
                        name="disposalMethod"
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
                        }}
                    />

                    <ProFormSelect
                        name="wasteType"
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
                        }}
                    />

                    <ProFormDigit
                        name="wasteWeight"
                        label="Waste Weight (kg)"
                        placeholder="Please enter waste weight"
                        rules={[{ required: true, message: 'Please enter waste weight' }]}
                        fieldProps={{
                            min: 0,
                            step: 0.1,
                            precision: 2,
                        }}
                    />

                    <ProForm.Item
                        name="file"
                        label="Attachment"
                        rules={[{ required: false }]}
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
                            maxCount={5}
                        >
                            <Button icon={<UploadOutlined />}>Click to upload files</Button>
                        </Upload>
                    </ProForm.Item>

                    <div className="flex justify-center gap-4 mt-6">
                        <Button onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" onClick={() => editForm.submit()}>
                            Save Changes
                        </Button>
                    </div>
                </ProForm>
            </Modal>
        </>
    );
}