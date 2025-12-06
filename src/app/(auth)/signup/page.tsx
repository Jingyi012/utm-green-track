import RegistrationForm from "@/components/auth/RegisterForm";
import AuthLayout from "@/components/layouts/AuthLayout";

export default function RegistrationPage() {
    return (
        <AuthLayout
            title="Join UTM Green Initiative"
            subtitle="Create Your Sustainable Account"
            containerSize="large"
            headerHeight="small"
            footerMessage="Every registration is a step towards campus sustainability"
            footerIcon="🌱"
        >
            <RegistrationForm />
        </AuthLayout>
    );
}