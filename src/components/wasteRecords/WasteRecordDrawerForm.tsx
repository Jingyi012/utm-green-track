import { Col, Row, Form, Button, UploadFile, Upload, Typography } from 'antd';
import {
    ProFormSelect,
    ProFormText,
    DrawerForm,
    ProFormDigit,
    ProForm,
    ProFormDateTimePicker,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { Campus, Department, DisposalMethodWithWasteType, WasteTypeWithEmissionFactor } from '@/lib/types/typing';
import { WasteRecordStatus, wasteRecordStatusLabels } from '@/lib/enum/status';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { WasteRecord } from '@/lib/types/wasteRecord';
import { useAuth } from '@/contexts/AuthContext';
const { Title } = Typography;
export type FormValueType = Partial<WasteRecord>;

export type UpdateFormDrawerProps = {
    campuses: Campus[],
    departments: Department[]
    disposalMethods: DisposalMethodWithWasteType[],
    onCancel: (flag?: boolean, formVals?: FormValueType) => void;
    onSubmit: (values: FormValueType) => Promise<boolean>;
    visible: boolean;
    initialValues: Partial<WasteRecord>;
    isEditMode?: boolean;
    handleDelete?: () => Promise<void>;
};

const WasteRecordDrawerForm: React.FC<UpdateFormDrawerProps> = ({
    campuses,
    departments,
    disposalMethods,
    onCancel,
    onSubmit,
    visible,
    initialValues,
    isEditMode = false,
    handleDelete
}) => {
    const [form] = Form.useForm();
    const { isAdmin } = useAuth();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedDisposalMethod, setSelectedDisposalMethod] = useState<string>();
    const [wasteTypes, setWasteTypes] = useState<WasteTypeWithEmissionFactor[]>([]);

    const handleDisposalMethodChange = (value: string) => {
        setSelectedDisposalMethod(value);
        form.setFieldValue("wasteTypeId", null);
        const selectedMethod = disposalMethods.find(dm => dm.id === value);
        setWasteTypes(selectedMethod?.wasteTypes ?? []);
    };

    useEffect(() => {
        setIsEditing(isEditMode)
    }, [isEditMode]);

    useEffect(() => {
        if (initialValues?.disposalMethodId) {
            const selectedMethod = disposalMethods.find(dm => dm.id === initialValues.disposalMethodId);
            setWasteTypes(selectedMethod?.wasteTypes ?? []);
            setSelectedDisposalMethod(initialValues.disposalMethodId);
        } else {
            setWasteTypes([]);
            setSelectedDisposalMethod(undefined);
        }
    }, [initialValues?.disposalMethodId, disposalMethods]);

    useEffect(() => {
        if (initialValues?.attachments) {
            const formattedFileList = initialValues.attachments.map(a => ({
                uid: a.id,
                name: a.fileName,
                status: 'done',
                url: a.filePath,
            }));

            form.setFieldValue('uploadedAttachments', formattedFileList);
        }
    }, [initialValues, form]);
    const watchStatus = Form.useWatch("status", form);
    return (
        <DrawerForm
            title={"Waste Record"}
            open={visible}
            width={800}
            form={form}
            onFinish={async (values) => {
                const success = await onSubmit(values);
                if (success) {
                    setIsEditing(false);
                    onCancel();
                }
            }}
            onOpenChange={(open) => {
                if (!open) {
                    setIsEditing(false);
                    onCancel();
                }
            }}
            submitter={
                isEditing
                    ? {
                        searchConfig: {
                            submitText: 'Submit',
                            resetText: 'Cancel',
                        },
                    }
                    : false
            }
            drawerProps={{
                destroyOnClose: true,
                extra: (
                    <>
                        <Button
                            type="text"
                            icon={
                                <EditOutlined style={{ color: isEditing ? '#1890ff' : 'rgba(0, 0, 0, 0.45)' }} />
                            }
                            onClick={() => {
                                setIsEditing((prev) => {
                                    if (prev) {
                                        form.resetFields();
                                    }
                                    return !prev;
                                });
                            }}
                        />
                        <Button
                            type="text"
                            icon={
                                <DeleteOutlined style={{ color: '#ff1818ff' }} />
                            }
                            onClick={handleDelete}
                        />
                    </>
                )
            }}
            initialValues={initialValues}
        >
            <ProCard title="Waste Record Details" bordered collapsible>
                <Title level={5}>Basic Information</Title>

                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormSelect
                            name={"campusId"}
                            label="UTM Campus"
                            placeholder="Please select campus"
                            rules={[{ required: true, message: 'Please select campus' }]}
                            options={campuses.map(r => ({
                                label: r.name,
                                value: r.id,
                            }))}
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <ProFormText
                            name="location"
                            label="Location"
                            placeholder="Please enter location"
                            rules={[{ required: true, message: 'Please enter location' }]}
                            disabled={!isEditing}
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
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <ProFormDateTimePicker
                            name="programDate"
                            label="Date of Program/ Initiative"
                            placeholder="Please enter date of program / initiative"
                            rules={[]}
                            disabled={!isEditing}
                        />
                    </Col>
                </Row>
                <Title level={5} style={{ marginTop: 12 }}>Waste Information</Title>

                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormSelect
                            name={"disposalMethodId"}
                            label="Disposal Method"
                            rules={[{ required: true, message: 'Please select a disposal method' }]}
                            placeholder="Please select a disposal method"
                            options={disposalMethods.map(r => ({
                                label: r.name,
                                value: r.id,
                            }))}
                            fieldProps={{
                                onChange: handleDisposalMethodChange,
                                showSearch: true,
                                optionFilterProp: "label",
                            }}
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormSelect
                            name={"wasteTypeId"}
                            label="Waste Type"
                            rules={[{ required: true, message: 'Please select a waste type' }]}
                            placeholder="Please select a waste type"
                            options={wasteTypes.map(wt => ({
                                label: wt.name,
                                value: wt.id,
                            }))}
                            fieldProps={{
                                disabled: !selectedDisposalMethod,
                                showSearch: true,
                                optionFilterProp: "label",
                            }}
                            disabled={!isEditing || !selectedDisposalMethod}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormDigit
                            name="wasteWeight"
                            label="Waste Weight (kg)"
                            placeholder="Please enter waste weight"
                            rules={[{ required: true, message: 'Please enter waste weight' }]}
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        {isAdmin && <ProFormSelect
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select a status' }]}
                            placeholder="Please select a status"
                            options={[
                                { label: wasteRecordStatusLabels[WasteRecordStatus.New], value: WasteRecordStatus.New },
                                { label: wasteRecordStatusLabels[WasteRecordStatus.Verified], value: WasteRecordStatus.Verified },
                                { label: wasteRecordStatusLabels[WasteRecordStatus.Rejected], value: WasteRecordStatus.Rejected },
                                { label: wasteRecordStatusLabels[WasteRecordStatus.RevisionRequired], value: WasteRecordStatus.RevisionRequired },
                            ]}
                            disabled={!isEditing || !isAdmin}
                        />}
                    </Col>
                </Row>

                {(watchStatus === WasteRecordStatus.Rejected || watchStatus === WasteRecordStatus.RevisionRequired) && (
                    <Row gutter={16}>
                        <Col span={24}>
                            <ProFormTextArea
                                name="comment"
                                label="Comment"
                                placeholder="Please enter revision / reject reason"
                                rules={[
                                    {
                                        required: true,
                                        message: "Revision / reject reason is required",
                                    },
                                ]}
                                disabled={!isEditing}
                            />
                        </Col>
                    </Row>
                )}

                <ProFormText
                    name="id"
                    label="id"
                    hidden
                    disabled
                />
            </ProCard>
            <ProCard title={"Attachments"} bordered collapsible style={{ marginTop: '16px' }}>
                <ProForm.Item
                    name='uploadedAttachments'
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}
                    rules={[{ required: true, message: 'Please upload attachment' }]}
                >
                    <Upload
                        name='fileList'
                        multiple
                        listType="picture"
                        accept=".pdf,image/*,.xlsx,.doc,.docx"
                        beforeUpload={(file) => {
                            return false;
                        }}
                        onRemove={(file) => {
                        }}
                        disabled={!isEditing}
                    >
                        {isEditing && <Button icon={<UploadOutlined />}>Click to Upload</Button>}
                    </Upload>
                </ProForm.Item>
            </ProCard>
        </DrawerForm>
    );
};

export default WasteRecordDrawerForm;