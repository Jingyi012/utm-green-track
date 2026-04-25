import { createFileRoute } from '@tanstack/react-router';
import RegistrationForm from '@/components/auth/RegisterForm';
import AuthLayout from '@/components/layouts/AuthLayout';

export const Route = createFileRoute('/signup')({
  component: SignupRoute,
});

function SignupRoute() {
  return (
    <AuthLayout
      title='Join UTM Green Initiative'
      subtitle='Create Your Sustainable Account'
      containerSize='large'
      headerHeight='small'
      footerMessage='Every registration is a step towards campus sustainability'
      footerIcon='🌱'
    >
      <RegistrationForm />
    </AuthLayout>
  );
}
