'use client';

import { useProfileDropdownOptions } from '@/hook/options';
import { getProfile, updateProfile } from '@/lib/services/user';
import { UserDetails } from '@/lib/types/typing';
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    Row,
    Select,
    Typography,
    message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

const { Title } = Typography;

const EditProfileForm = () => {
    const { positions, departments, roles } = useProfileDropdownOptions();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // edit mode state
    const [userData, setUserData] = useState<UserDetails>();

    const selectedPosition = Form.useWatch('position', form);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profile = await getProfile();
                const data = profile.data;

                const formValues = {
                    ...data,
                    departmentId: data.departmentId,
                    position: data.positionId,
                    role: data.roles[0], // only first role
                };

                setUserData(data);
                form.setFieldsValue(formValues);
            } catch (error: any) {
                message.error(error.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload = {
                userId: userData?.id,
                name: values.name,
                contactNumber: values.contactNumber,
                staffMatricNo: values.staffMatricNo,
                departmentId: values.departmentId,
                positionId: values.positionId,
                roleIds: values.role ? [values.role] : [],
            };

            const res = await updateProfile(payload);
            if (res.success) {
                message.success('Profile updated successfully');
                setIsEditing(false); // exit edit mode
            } else {
                message.error(res.message || 'Profile update failed');
            }
        } catch (error: any) {
            message.error(error.message || 'Profile update failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Title level={3}>Account Information</Title>
            <Card loading={loading}>
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, message: 'Please enter your email' }]}
                            >
                                <Input type="email" disabled />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="departmentId"
                                label="Faculty/Department"
                                rules={[{ required: true, message: 'Please select your faculty / department' }]}
                            >
                                <Select
                                    placeholder="-- Please Choose --"
                                    options={departments.map(r => ({
                                        label: r.name,
                                        value: r.id,
                                    }))}
                                    disabled={!isEditing}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="staffMatricNo"
                                label="Staff / Matric No."
                                rules={[{ required: true, message: 'Please enter staff / matric No.' }]}
                            >
                                <Input disabled={!isEditing} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="positionId"
                                label="Position"
                                rules={[{ required: true, message: 'Please select a position' }]}
                            >
                                <Select
                                    placeholder="-- Please Choose --"
                                    options={positions.map(r => ({
                                        label: r.name,
                                        value: r.id,
                                    }))}
                                    disabled={!isEditing}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Full Name"
                                rules={[{ required: true, message: 'Enter your name' }]}
                            >
                                <Input disabled={!isEditing} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="role"
                                label="Role"
                                rules={[{ required: true, message: 'Please select a role' }]}
                            >
                                <Select
                                    placeholder="-- Please Choose --"
                                    options={roleOptions}
                                    disabled={!isEditing}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="contactNumber"
                                label="Contact No."
                                rules={[
                                    { required: true, message: 'Enter your contact number' },
                                    {
                                        pattern: /^\+?\d{10,15}$/,
                                        message: 'Enter a valid contact number (10-15 digits, optional +)',
                                    },
                                ]}
                            >
                                <Input type="tel" disabled={!isEditing} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} justify="center">
                        <Col xs={24} style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            {!isEditing ? (
                                <Button type="primary" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        type="primary"
                                        onClick={handleSubmit}
                                        style={{ width: '40%' }}
                                        loading={submitting}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            form.resetFields(); // reset unsaved changes
                                            setIsEditing(false);
                                        }}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </Col>
                    </Row>
                </Form>
            </Card>
        </>
    );
};

export default EditProfileForm;
