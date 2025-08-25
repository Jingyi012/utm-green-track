import { Col, Row, Form, Button, UploadFile, Upload } from 'antd';
import {
    ProFormSelect,
    ProFormText,
    DrawerForm,
    ProFormDigit,
    ProForm,
} from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { Campus, DisposalMethodWithWasteType, WasteTypeWithEmissionFactor } from '@/lib/types/typing';
import { WasteRecordStatus, wasteRecordStatusLabels } from '@/lib/enum/status';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { WasteRecord } from '@/lib/types/wasteRecord';

export type FormValueType = Partial<WasteRecord>;

export type UpdateFormDrawerProps = {
    campuses: Campus[],
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
    disposalMethods,
    onCancel,
    onSubmit,
    visible,
    initialValues,
    isEditMode = false,
    handleDelete
}) => {
    const [form] = Form.useForm();
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
                                <DeleteOutlined style={{ color: isEditing ? '#ff1818ff' : 'rgba(0, 0, 0, 0.45)' }} />
                            }
                            onClick={handleDelete}
                        />
                    </>
                )
            }}
            initialValues={initialValues}
        >
            <ProCard title="Waste Record Details" bordered collapsible>
                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormSelect
                            name={"campusId"}
                            label="Campus"
                            placeholder="Please select campus"
                            rules={[{ required: true, message: 'Please select campus' }]}
                            options={campuses.map(r => ({
                                label: r.name,
                                value: r.id,
                            }))}
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col span={12}>
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
                            disabled={!isEditing}
                            onChange={handleDisposalMethodChange}
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
                        <ProFormSelect
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select a status' }]}
                            placeholder="Please select a status"
                            options={[
                                { label: wasteRecordStatusLabels[WasteRecordStatus.New], value: WasteRecordStatus.New },
                                { label: wasteRecordStatusLabels[WasteRecordStatus.Verified], value: WasteRecordStatus.Verified },
                                { label: wasteRecordStatusLabels[WasteRecordStatus.Rejected], value: WasteRecordStatus.Rejected },
                            ]}
                            disabled={!isEditing}
                        />
                    </Col>
                </Row>

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
                >
                    <Upload
                        multiple
                        listType="picture"
                        accept=".pdf,image/*,.xlsx"
                        defaultFileList={(initialValues?.attachments ?? []).map(a => ({
                            uid: a.id,
                            name: a.fileName,
                            status: 'done',
                            url: a.filePath,
                            //type: a.fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : undefined,
                        }))}

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