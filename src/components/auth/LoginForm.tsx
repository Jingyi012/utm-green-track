'use client';

import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { loginUser } from '@/lib/services/user.service';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function LoginForm() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        const { email, password } = values;

        try {
            setLoading(true);
            const { token, user } = await loginUser(email, password);

            await login(token, user);

        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                    Login
                </Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Invalid email address' },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="you@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" loading={loading} htmlType="submit" block>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Link href="/auth/reset-password" style={{ fontSize: 12 }}>
                        Forgot your password?

                    </Link>
                    <Link href="/auth/signup" style={{ fontSize: 12 }}>
                        Don't have an account? Sign Up
                    </Link>
                </div>
            </Card>
        </div>
    );
}
