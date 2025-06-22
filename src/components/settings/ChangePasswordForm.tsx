'use client';
import { Button, Card, Col, Form, Input, message, Row, Select, Typography } from 'antd';
import { changePassword } from '@/lib/services/user.service';
const { Title } = Typography;
const { Option } = Select;

const ChangePasswordForm = () => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const { currentPassword, newPassword, confirmPassword } = await form.validateFields();

            if (newPassword !== confirmPassword) {
                return message.error("Passwords don't match");
            }

            await changePassword(currentPassword, newPassword);

            message.success('Password updated successfully');
            form.resetFields();
        } catch (err: any) {
            message.error(err.message || 'Failed to change password');
        }
    };

    return (
        <>
            <Title level={3}>Change Password</Title>
            <Card>
                <Form form={form} layout="vertical" style={{ maxWidth: '500px', margin: 'auto' }}>
                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                name="currentPassword"
                                label="Current Password"
                                rules={[{ required: true, message: 'Please enter current password' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name="newPassword"
                                label="New Password"
                                rules={[{ required: true, message: 'Please enter new password' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name="confirmPassword"
                                label="Confirm Password"
                                rules={[{ required: true, message: 'Please enter confirm password' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                    </Row>

                    <Row gutter={16} justify="center">
                        <Col xs={24} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button type="primary" onClick={handleSubmit} style={{ width: "100%" }}>
                                Change Password
                            </Button>
                        </Col>
                    </Row>

                </Form>
            </Card>
        </>
    );
};

export default ChangePasswordForm;
