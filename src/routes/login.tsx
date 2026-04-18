import { createFileRoute, redirect } from '@tanstack/react-router';
import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from '@/components/layouts/AuthLayout';
import { getStoredUser } from '@/lib/auth/session';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (!getStoredUser()) {
      return;
    }

    throw redirect({
      to: '/home',
      replace: true,
    });
  },
  component: LoginRoute,
});

function LoginRoute() {
  return (
    <AuthLayout
      title='UTM GreenTrack System'
      subtitle='Sustainable Campus Initiative'
      containerSize='small'
      headerHeight='large'
      footerMessage='Together, we build a greener tomorrow'
      footerIcon='🌱'
    >
      <LoginForm />
    </AuthLayout>
  );
}
