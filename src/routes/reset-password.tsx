import { Spin } from 'antd';
import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import AuthLayout from '@/components/layouts/AuthLayout';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  return (
    <Suspense fallback={<Spin />}>
      <AuthLayout
        title='Reset Your Password'
        subtitle='Secure Account Recovery'
        containerSize='small'
        headerHeight='large'
        footerMessage='Secure access to sustainable journey'
        footerIcon='🔒'
      >
        <ResetPasswordForm />
      </AuthLayout>
    </Suspense>
  );
}
