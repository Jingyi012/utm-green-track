import LoginForm from "@/components/auth/LoginForm";
import AuthLayout from "@/components/layout/AuthLayout";

export default function LoginPage() {
    return (
        <AuthLayout
            title="UTM GreenTrack System"
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