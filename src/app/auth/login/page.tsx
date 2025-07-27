import LoginForm from "@/components/auth/LoginForm";
import AuthLayout from "@/components/layout/authLayout";

export default function LoginPage() {
    return (
        <AuthLayout
            title="UTM Green Tracking System"
            subtitle="Sustainable Campus Initiative"
            containerSize="small"
            headerHeight="large"
            footerMessage="Together, we build a greener tomorrow"
            footerIcon="🌱"
        >
            <LoginForm />
        </AuthLayout>
    )
}