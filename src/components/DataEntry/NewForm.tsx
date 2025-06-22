'use client';

import {
    Card,
    Row,
    Col,
    Select,
    Input,
    Button,
    Table,
    Upload,
    Typography,
    Form,
    message,
    Modal,
} from 'antd';
import FormItem from 'antd/es/form/FormItem';
import { UploadOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { createWasteRecord, uploadAttachment } from '@/lib/api/wasteRecord';
import { WasteRecordInput } from '@/lib/types/wasteRecord';

const { Title } = Typography;

export default function WasteEntryForm() {
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const [tableData, setTableData] = useState<WasteRecordInput[]>([]);
    const [wasteTypeOptions, setWasteTypeOptions] = useState<any[]>([]);
    const [editWasteTypeOptions, setEditWasteTypeOptions] = useState<any[]>([]);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const disposalMethod = Form.useWatch("disposalMethod", form);
    const editingMethod = Form.useWatch("disposalMethod", editForm);

    const campusOptions = [
        { label: "UTM Johor Bahru", value: "UTM Johor Bahru" },
        { label: "UTM Kuala Lumpur", value: "UTM Kuala Lumpur" },
        { label: "UTM Pagoh", value: "UTM Pagoh" },
    ];

    const locationOptions = [
        { label: "BPA, JTNCP", value: "BPA, JTNCP" },
    ];

    const disposalMethodOptions = [
        { label: "Landfilling", value: "Landfilling" },
        { label: "Recycling", value: "Recycling" },
        { label: "Composting", value: "Composting" },
        { label: "Energy Recovery", value: "EnergyRecovery" },
    ];

    const wasteTypeMap: Record<string, { label: string; value: string }[]> = {
        Landfilling: [
            { label: "General waste", value: "General waste" },
            { label: "Bulk waste", value: "Bulk waste" },
            { label: "Landscape waste", value: "Landscape waste" },
            { label: "Recycleble item", value: "Recycleble item" },
        ],
        Recycling: [
            { label: "Paper", value: "Paper" },
            { label: "Plastic", value: "Plastic" },
            { label: "Metal", value: "Metal" },
            { label: "Rubber", value: "Rubber" },
            { label: "E-waste", value: "E-waste" },
            { label: "Textile", value: "Textile" },
            { label: "Used cooking oil", value: "Used cooking oil" },
        ],
        Composting: [
            { label: "Landscape waste", value: "Landscape waste" },
            { label: "Food/Kitchen waste", value: "Food/Kitchen waste" },
            { label: "Animal manure", value: "Animal manure" },
        ],
        EnergyRecovery: [
            { label: "Wood waste", value: "Wood waste" },
            { label: "Food waste", value: "Food waste" },
        ],
    };

    useEffect(() => {
        if (disposalMethod) {
            setWasteTypeOptions(wasteTypeMap[disposalMethod] || []);
            form.setFieldsValue({ type: undefined });
        }
    }, [disposalMethod]);

    useEffect(() => {
        if (editingMethod) {
            setEditWasteTypeOptions(wasteTypeMap[editingMethod] || []);
            editForm.setFieldsValue({ type: undefined });
        }
    }, [editingMethod]);

    const handleAdd = () => {
        form.validateFields().then((values) => {
            const newRow = {
                key: `${Date.now()}`,
                date: new Date().toLocaleDateString('en-GB'),
                ...values,
                weight: Number(values.weight),
                file: values.file || [],
            };

            setTableData(prev => [...prev, newRow]);
            form.resetFields();
        });
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        setIsModalOpen(true);
        editForm.setFieldsValue(record);
    };

    const handleSaveEdit = (values: any) => {
        setTableData((prev) =>
            prev.map((item) =>
                item.key === editingRecord.key ? { ...item, ...values } : item
            )
        );
        setIsModalOpen(false);
        message.success('Row updated');
    };

    const handleDelete = (key: string) => {
        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this entry?',
            onOk: () => {
                setTableData((prev) => prev.filter((item) => item.key !== key));
                message.success('Row deleted');
            },
        });
    };

    const handleSubmit = async () => {
        try {
            const processedRecords = await Promise.all(
                tableData.map(async (record) => {
                    let attachmentUrl: string | undefined;

                    if (record.file && record.file.length > 0) {
                        const rawFile = record.file[0]?.originFileObj;
                        if (rawFile) {
                            attachmentUrl = await uploadAttachment(rawFile);
                        }
                    }

                    return {
                        campusName: record.campusName,
                        location: record.location,
                        disposalMethod: record.disposalMethod,
                        wasteType: record.wasteType,
                        wasteWeight: record.wasteWeight,
                        date: new Date().toISOString(),
                        attachmentUrl,
                    };
                })
            );
            await createWasteRecord(processedRecords); // send array to API
            message.success('All waste records submitted successfully');
            setTableData([]);
            form.resetFields();
        } catch (err: any) {
            console.error(err);
            message.error(err.message || 'Failed to submit records');
        }
    };


    const columns = [
        { title: 'No.', render: (_: any, __: any, index: number) => index + 1 },
        { title: 'Date', dataIndex: 'date' },
        { title: 'UTM Campus', dataIndex: 'campusName' },
        { title: 'Location', dataIndex: 'location' },
        { title: 'Disposal Method', dataIndex: 'disposalMethod' },
        { title: 'Waste Type', dataIndex: 'wasteType' },
        { title: 'Waste Weight (kg)', dataIndex: 'wasteWeight' },
        {
            title: 'Attachment',
            render: () => <PaperClipOutlined />,
        },
        {
            title: 'Remark',
            render: (_: any, record: { key: string }) => (
                <>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)} />
                </>
            ),
        }
    ];

    return (
        <>
            <Card>
                <Form form={form} layout="vertical">
                    <Title level={5}>Basic Info</Title>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <FormItem name="campusName" label="UTM Campus" rules={[{ required: true }]}>
                                <Select placeholder="-- Please Choose --" options={campusOptions} />
                            </FormItem>
                        </Col>
                        <Col xs={24} md={12}>
                            <FormItem name="location" label="Location" rules={[{ required: true }]}>
                                <Select placeholder="-- Please Choose --" options={locationOptions} />
                            </FormItem>
                        </Col>
                    </Row>

                    <Title level={5}>Waste Info</Title>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <FormItem name="disposalMethod" label="Disposal Method" rules={[{ required: true }]}>
                                <Select placeholder="-- Please Choose --" options={disposalMethodOptions} />
                            </FormItem>
                        </Col>
                        <Col xs={24} md={12}>
                            <FormItem name="wasteType" label="Waste Type" rules={[{ required: true }]}>
                                <Select placeholder="-- Please Choose --" options={wasteTypeOptions} />
                            </FormItem>
                        </Col>
                        <Col xs={24} md={12}>
                            <FormItem name="wasteWeight" label="Waste Weight (kg)" rules={[{ required: true }]}>
                                <Input placeholder="-- Please Enter --" type="number" />
                            </FormItem>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="file"
                                label="Attachment"
                                valuePropName="fileList"
                                getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                            >
                                <Upload
                                    beforeUpload={() => false}
                                    maxCount={1}
                                >
                                    <Button icon={<UploadOutlined />}>Add file</Button>
                                </Upload>
                            </Form.Item>

                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col>
                            <Button type="primary" onClick={handleAdd}>Add</Button>
                        </Col>
                        <Col>
                            <Button onClick={() => form.resetFields()} danger>Reset</Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card style={{ marginTop: 24 }}>
                <Table dataSource={tableData} columns={columns} pagination={false} bordered />
                <div className="flex justify-center mt-4">
                    <Button type="primary" onClick={handleSubmit}>Submit</Button>
                </div>
            </Card>

            <Modal
                title="Edit Entry"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form layout="vertical" form={editForm} onFinish={handleSaveEdit}>
                    <FormItem name="campus" label="UTM Campus" rules={[{ required: true }]}>
                        <Select options={campusOptions} />
                    </FormItem>
                    <FormItem name="location" label="Location" rules={[{ required: true }]}>
                        <Select options={locationOptions} />
                    </FormItem>
                    <FormItem name="method" label="Disposal Method" rules={[{ required: true }]}>
                        <Select options={disposalMethodOptions} />
                    </FormItem>
                    <FormItem name="type" label="Waste Type" rules={[{ required: true }]}>
                        <Select options={editWasteTypeOptions} />
                    </FormItem>
                    <FormItem name="weight" label="Waste Weight (kg)" rules={[{ required: true }]}>
                        <Input type="number" />
                    </FormItem>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form>
            </Modal>
        </>
    );
}
