'use client';

import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { Title } = Typography;

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onFinish = async (values: any) => {
        setLoading(true);

        const res = await signIn('credentials', {
            redirect: false,
            email: values.email,
            password: values.password,
        });

        setLoading(false);

        if (res?.error) {
            message.error(res.error);
        } else {
            message.success('Login successful');
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex justify-center item-center relative bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-1">
            <Card style={{ width: 400, border: 'none' }}>
                <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                    Sign In
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
                            Login
                        </Button>
                    </Form.Item>
                </Form>

                <div className="flex gap-8 text-xs justify-between">
                    <Link href="/auth/forgot-password">
                        Forgot your password?
                    </Link>
                    <Link href="/auth/signup">
                        Don't have an account? Sign Up
                    </Link>
                </div>
            </Card>
        </div>
    );
}
