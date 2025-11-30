import { Col, Row, Form, Button } from 'antd';
import {
    ProFormSelect,
    ProFormText,
    DrawerForm,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useMemo, useState } from 'react';
import { Department, Position, Role, UserDetails } from '@/lib/types/typing';
import { UserStatus, userStatusLabels } from '@/lib/enum/status';
import { EditOutlined } from '@ant-design/icons';

export type FormValueType = Partial<UserDetails>;

export type UpdateFormDrawerProps = {
    departments: Department[],
    positions: Position[],
    roles: Role[],
    onCancel: (flag?: boolean, formVals?: FormValueType) => void;
    onSubmit: (values: FormValueType) => Promise<boolean>;
    visible: boolean;
    initialValues: Partial<UserDetails>;
    isEditMode?: boolean;
};

const UserDetailsDrawerForm: React.FC<UpdateFormDrawerProps> = ({
    departments,
    positions,
    roles,
    onCancel,
    onSubmit,
    visible,
    initialValues,
    isEditMode = false,
}) => {
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedPosition, setSelectedPosition] = useState<string>();

    const handlePositionChange = (value: string) => {
        setSelectedPosition(value);
        // Clear roles when position changes
        form.setFieldValue('roles', []);
    };

    const roleOptions = useMemo(() => {
        if (!selectedPosition) return [];
        const position = positions.find(p => p.id === selectedPosition);
        if (!position) return [];
        return roles
            .filter(r => r.category === position.name)
            .map(r => ({
                label: r.name,
                value: r.id,
            }));
    }, [positions, roles, selectedPosition]);

    // Reset form when initialValues change or drawer opens/closes
    useEffect(() => {
        if (visible) {
            form.resetFields();
            setSelectedPosition(initialValues.positionId);
        }
    }, [visible, initialValues, form]);

    useEffect(() => {
        setIsEditing(isEditMode)
    }, [isEditMode])

    const watchStatus = Form.useWatch("status", form);

    return (
        <DrawerForm
            title={initialValues.name}
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
                destroyOnHidden: true,
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
                    </>
                )
            }}
            initialValues={initialValues}
        >
            <ProCard title="User Details" bordered collapsible>
                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormText
                            name="email"
                            label="Email"
                            placeholder="Please enter email"
                            rules={[{ required: true, message: 'Please enter your email' }]}
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormSelect
                            name={"departmentId"}
                            label="Faculty/Department"
                            rules={[{ required: true, message: 'Please select your faculty / department' }]}
                            options={departments.map(r => ({
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
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormText
                            name="staffMatricNo"
                            label="Staff / Matric No."
                            placeholder="Please enter staff / matric No."
                            rules={[{ required: true, message: 'Please enter staff / matric No.' }]}
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormSelect
                            name={"positionId"}
                            label="Position"
                            rules={[{ required: true, message: 'Please select a position' }]}
                            placeholder="-- Please Choose --"
                            options={positions.map(r => ({
                                label: r.name,
                                value: r.id,
                            }))}
                            disabled={!isEditing}
                            onChange={handlePositionChange}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormText
                            name="name"
                            label="Full Name"
                            placeholder="Enter your name"
                            rules={[{ required: true, message: 'Enter your name' }]}
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormSelect
                            name={"roleIds"}
                            label="Role"
                            rules={[{ required: true, message: 'Please select a role' }]}
                            placeholder="-- Please Choose --"
                            options={roleOptions}
                            mode='multiple'
                            disabled={!isEditing || !selectedPosition}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormText
                            name="contactNumber"
                            label="Contact No."
                            placeholder="Enter your contact number"
                            rules={[
                                { required: true, message: 'Enter your contact number' },
                                {
                                    pattern: /^\+?\d{10,15}$/,
                                    message: 'Enter a valid contact number (10-15 digits, optional +)',
                                },
                            ]}
                            disabled={!isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormSelect
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select a status' }]}
                            placeholder="-- Please Choose --"
                            options={[
                                { label: userStatusLabels[UserStatus.Approved], value: UserStatus.Approved },
                                { label: userStatusLabels[UserStatus.Rejected], value: UserStatus.Rejected },
                            ]}
                            disabled={!isEditing}
                        />
                    </Col>
                </Row>
                {watchStatus === UserStatus.Rejected && (
                    <Row gutter={16}>
                        <Col span={24}>
                            <ProFormTextArea
                                name="rejectedReason"
                                label="Rejected Reason"
                                placeholder="Please enter reject reason"
                                rules={[
                                    {
                                        required: true,
                                        message: "Reject reason is required when status is Rejected",
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
        </DrawerForm>
    );
};

export default UserDetailsDrawerForm;