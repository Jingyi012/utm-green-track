'use client';

import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/services/user.service';

const { Title, Text } = Typography;

export default function LoginForm() {
    const router = useRouter();

    const onFinish = async (values: any) => {
        const { email, password } = values;

        try {
            const { token, user } = await loginUser(email, password);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            message.success('Login successful!');
            router.push('/dashboard');
        } catch (error: any) {
            message.error(error.message);
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
                        <Button type="primary" htmlType="submit" block>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Link href="/auth/reset-password" style={{ fontSize: 12 }}>
                        Forgot your password?

                    </Link>
                    <Link href="/auth/register" style={{ fontSize: 12 }}>
                        Don't have an account? Sign Up
                    </Link>
                </div>
            </Card>
        </div>
    );
}
