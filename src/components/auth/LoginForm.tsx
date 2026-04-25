import { Form, Input, Button, Card, Typography, App } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { apiLogin } from '@/lib/services/auth';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

export default function LoginForm() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchStr = useLocation({ select: (location) => location.searchStr });
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const { login } = useAuth();
  const requestedRedirect = searchParams.get('redirect');
  const redirectTo =
    requestedRedirect && requestedRedirect.startsWith('/') ? requestedRedirect : '/home';

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const res = await apiLogin({
        email: values.email,
        password: values.password,
      });

      if (!res.success) {
        message.error(res.message || 'Login failed, please try again');
      } else {
        message.success('Login successful');
        await login(res.data);
        await navigate({ href: redirectTo, replace: true });
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Login failed, please try again');
    } finally {
      setLoading(false);
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
              {
                pattern: /^[a-zA-Z0-9._%+-]+@(utm\.my|graduate\.utm\.my)$/,
                message: 'Email must be @utm.my or @graduate.utm.my',
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="you@graduate.utm.my" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
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
          <Link to="/forgot-password">Forgot your password?</Link>
          <Link to="/signup">Don't have an account? Sign Up</Link>
        </div>
      </Card>
    </div>
  );
}
