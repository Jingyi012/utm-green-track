'use client';
import { changePassword } from '@/lib/services/auth';
import { PageContainer } from '@ant-design/pro-components';
import { App, Button, Card, Col, Form, Input, Row, Select, Typography } from 'antd';
const { Title } = Typography;
const { Option } = Select;

const ChangePasswordForm = () => {
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const { password, newPassword, confirmPassword } = await form.validateFields();

            if (newPassword !== confirmPassword) {
                return message.error("Passwords don't match");
            }

            await changePassword({ password, newPassword, confirmNewPassword: confirmPassword });

            message.success('Password updated successfully');
            form.resetFields();
        } catch (err: any) {
            message.error('Failed to change password, check your current password');
        }
    };

    return (
        <PageContainer title={false}>
            <Card title={"Change Password"}>
                <Form form={form} layout="vertical" style={{ maxWidth: '500px', margin: 'auto' }}>
                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                name="password"
                                label="Current Password"
                                rules={[
                                    { required: true, message: 'Please enter current password' },
                                    { min: 8, message: 'Password must be at least 8 characters long' }
                                ]}
                            >
                                <Input placeholder="Please enter" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name="newPassword"
                                label="New Password"
                                rules={[
                                    { required: true, message: 'Please enter new password' },
                                    { min: 8, message: 'Password must be at least 8 characters long' },
                                ]}
                            >
                                <Input.Password placeholder="Please enter" />
                            </Form.Item>

                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name="confirmPassword"
                                label="Confirm Password"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Please confirm your password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Please enter" />
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
        </PageContainer>
    );
};

export default ChangePasswordForm;
