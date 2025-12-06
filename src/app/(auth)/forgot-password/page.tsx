import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import AuthLayout from "@/components/layouts/AuthLayout";

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            title="Reset Your Password"
            subtitle="Secure Account Recovery"
            containerSize="small"
            headerHeight="large"
            footerMessage="Secure access to sustainable journey"
            footerIcon="🔒"
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}