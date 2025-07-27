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
import { createWasteRecord, uploadAttachment, uploadAttachments } from '@/lib/services/wasteRecord';
import { WasteRecordInput } from '@/lib/types/wasteRecord';
import { Campus, CampusLabels } from '@/lib/enum/campus';
import { WasteType, WasteTypeLabels } from '@/lib/enum/wasteType';
import { DisposalMethod, DisposalMethodLabels } from '@/lib/enum/disposalMethod';

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

    const campusOptions = Object.values(Campus).map((campus) => ({
        label: CampusLabels[campus],
        value: campus,
    }));

    const locationOptions = [
        { label: "BPA, JTNCP", value: "BPA, JTNCP" },
    ];

    const disposalMethodOptions = Object.values(DisposalMethod).map((method) => ({
        label: DisposalMethodLabels[method],
        value: method,
    }));

    const wasteTypeMap: Record<string, { label: string; value: WasteType }[]> = {
        landfilling: [
            { label: WasteTypeLabels[WasteType.GeneralWaste], value: WasteType.GeneralWaste },
            { label: WasteTypeLabels[WasteType.BulkWaste], value: WasteType.BulkWaste },
            { label: WasteTypeLabels[WasteType.LandscapeWaste], value: WasteType.LandscapeWaste },
            { label: WasteTypeLabels[WasteType.RecyclableItem], value: WasteType.RecyclableItem },
        ],
        recycling: [
            { label: WasteTypeLabels[WasteType.Paper], value: WasteType.Paper },
            { label: WasteTypeLabels[WasteType.Plastic], value: WasteType.Plastic },
            { label: WasteTypeLabels[WasteType.Metal], value: WasteType.Metal },
            { label: WasteTypeLabels[WasteType.Rubber], value: WasteType.Rubber },
            { label: WasteTypeLabels[WasteType.Ewaste], value: WasteType.Ewaste },
            { label: WasteTypeLabels[WasteType.Textile], value: WasteType.Textile },
            { label: WasteTypeLabels[WasteType.UsedCookingOil], value: WasteType.UsedCookingOil },
        ],
        composting: [
            { label: WasteTypeLabels[WasteType.LandscapeWaste], value: WasteType.LandscapeWaste },
            { label: WasteTypeLabels[WasteType.FoodKitchenWaste], value: WasteType.FoodKitchenWaste },
            { label: WasteTypeLabels[WasteType.AnimalManure], value: WasteType.AnimalManure },
        ],
        energyRecovery: [
            { label: WasteTypeLabels[WasteType.WoodWaste], value: WasteType.WoodWaste },
            { label: WasteTypeLabels[WasteType.FoodWaste], value: WasteType.FoodWaste },
        ],
    };

    useEffect(() => {
        if (disposalMethod) {
            setWasteTypeOptions(wasteTypeMap[disposalMethod] || []);
            form.setFieldsValue({ wasteType: undefined });
        }
    }, [disposalMethod]);

    useEffect(() => {
        if (editingMethod) {
            setEditWasteTypeOptions(wasteTypeMap[editingMethod] || []);

            const currentType = editForm.getFieldValue('wasteType');
            const validTypes = (wasteTypeMap[editingMethod] || []).map((opt) => opt.value);

            if (!validTypes.includes(currentType)) {
                editForm.setFieldsValue({ wasteType: undefined });
            }
        }
    }, [editingMethod]);

    const handleAdd = () => {
        form.validateFields()
            .then((values) => {
                const newRow = {
                    key: `${Date.now()}`,
                    date: new Date().toLocaleDateString('en-GB'),
                    ...values,
                    wasteWeight: Number(values.wasteWeight),
                    file: values.file || [],
                };

                setTableData(prev => [...prev, newRow]);
                form.resetFields();
            })
            .catch((err) => {
                message.error('Please complete all required fields before adding.');
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
        if (tableData.length === 0) {
            return message.warning('No data to submit. Please add at least one entry.');
        }
        console.log(tableData)
        Modal.confirm({
            title: 'Confirm Submission',
            content: 'Are you sure you want to submit all the waste records?',
            okText: 'Yes, Submit',
            cancelText: 'Cancel',
            onOk: async () => {
                const hide = message.loading("Submitting records...");

                try {
                    for (const record of tableData) {
                        try {
                            // Create record
                            const createResponse = await createWasteRecord({
                                campus: record.campus,
                                location: record.location,
                                disposalMethod: record.disposalMethod,
                                wasteType: record.wasteType,
                                wasteWeight: record.wasteWeight,
                                date: new Date().toISOString(),
                            });

                            const createdId = createResponse.data.id;
                            if (!createdId) throw new Error('Failed to obtain record ID');

                            // Upload attachment if exists
                            const fileList: File[] = (record.file ?? [])
                                .map((f: any) => f.originFileObj)
                                .filter(Boolean);

                            if (fileList.length > 0) {
                                const uploadResponse = await uploadAttachments(fileList, createdId);
                            }

                        } catch (recordErr) {
                            console.error(`Failed to submit record for ${record.wasteType}`, recordErr);
                            message.warning(`Record failed: ${record.wasteType}`);
                        }
                    }

                    hide();
                    message.success('All waste records submitted successfully');
                    setTableData([]);
                    form.resetFields();

                } catch (err: any) {
                    hide();
                    message.error(err.message || 'Unexpected error occurred');
                }
            },
        });
    };

    const columns = [
        { title: 'No.', render: (_: any, __: any, index: number) => index + 1 },
        { title: 'Date', dataIndex: 'date' },
        { title: 'UTM Campus', dataIndex: 'campus', render: (value: Campus) => CampusLabels[value] || value, },
        { title: 'Location', dataIndex: 'location' },
        { title: 'Disposal Method', dataIndex: 'disposalMethod', render: (value: DisposalMethod) => DisposalMethodLabels[value] || value, },
        { title: 'Waste Type', dataIndex: 'wasteType', render: (value: WasteType) => WasteTypeLabels[value] || value, },
        { title: 'Waste Weight (kg)', dataIndex: 'wasteWeight' },
        {
            title: 'Attachment',
            dataIndex: 'file',
            render: (files: any[]) => files?.length > 0 ? `${files.length} file(s)` : 'None',
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
                            <FormItem name="campus" label="UTM Campus" rules={[{ required: true }]}>
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
                                    beforeUpload={(file) => {
                                        const isLt5M = file.size / 1024 / 1024 < 5;
                                        if (!isLt5M) {
                                            message.error('File must be smaller than 5MB!');
                                        }
                                        return isLt5M || Upload.LIST_IGNORE;
                                    }}
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
                    <FormItem name="disposalMethod" label="Disposal Method" rules={[{ required: true }]}>
                        <Select options={disposalMethodOptions} />
                    </FormItem>
                    <FormItem name="wasteType" label="Waste Type" rules={[{ required: true }]}>
                        <Select options={editWasteTypeOptions} />
                    </FormItem>
                    <FormItem name="wasteWeight" label="Waste Weight (kg)" rules={[{ required: true }]}>
                        <Input type="number" />
                    </FormItem>
                    <FormItem
                        name="file"
                        label="Attachment"
                        valuePropName="fileList"
                        getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                    >
                        <Upload
                            beforeUpload={(file) => {
                                const isLt5M = file.size / 1024 / 1024 < 5;
                                if (!isLt5M) {
                                    message.error('File must be smaller than 5MB!');
                                }
                                return isLt5M || Upload.LIST_IGNORE;
                            }}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Add files</Button>
                        </Upload>
                    </FormItem>
                    <div className='flex justify-center'>
                        <Button type="primary" htmlType="submit">Save</Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
}
