import { createFileRoute } from '@tanstack/react-router';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import AuthLayout from '@/components/layouts/AuthLayout';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordRoute,
});

function ForgotPasswordRoute() {
  return (
    <AuthLayout
      title='Reset Your Password'
      subtitle='Secure Account Recovery'
      containerSize='small'
      headerHeight='large'
      footerMessage='Secure access to sustainable journey'
      footerIcon='🔒'
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
