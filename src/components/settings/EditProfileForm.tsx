'use client';

import { getProfile, updateProfile } from '@/lib/services/profile';
import { User } from '@/lib/types/user';
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
    Spin,
    Skeleton,
} from 'antd';
import { useEffect, useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

const EditProfileForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userData, setUserData] = useState<User>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profile = await getProfile();
                setUserData(profile.data);
                form.setFieldsValue(profile.data);
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
            await updateProfile(values);
            message.success('Profile updated successfully');
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
                                name="department"
                                label="Faculty/Department"
                                rules={[{ required: true, message: 'Please select your faculty / department' }]}
                            >
                                <Select placeholder="-- Please Choose --">
                                    <Option value="Malaysia-Japan Advanced Research Centre">Malaysia-Japan Advanced Research Centre</Option>
                                </Select>
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
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="position"
                                label="Position"
                                rules={[{ required: true, message: 'Please select a position' }]}
                            >
                                <Select placeholder="-- Please Choose --">
                                    <Option value="UTM Staff">UTM Staff</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Full Name"
                                rules={[{ required: true, message: 'Enter your name' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="role"
                                label="Role"
                                rules={[{ required: true, message: 'Enter select role' }]}
                            >
                                <Select placeholder="-- Please Choose --">
                                    <Option value="Academic Staff">Academic Staff</Option>
                                    <Option value="Non-Academic Staff">Non-Academic Staff</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="contactNo"
                                label="Contact No."
                                rules={[
                                    { required: true, message: 'Enter your contact number' },
                                    {
                                        pattern: /^\+?\d{10,15}$/,
                                        message: 'Enter a valid contact number (10–15 digits, optional +)',
                                    },
                                ]}
                            >
                                <Input type='tel' />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} justify="center">
                        <Col xs={24} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                style={{ width: '50%' }}
                                loading={submitting}
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </>
    );
};

export default EditProfileForm;
