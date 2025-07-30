import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthLayout from "@/components/layout/AuthLayout";

export default function ResetPasswordPage() {
    return (
        <AuthLayout
            title="Reset Your Password"
            subtitle="Secure Account Recovery"
            containerSize="small"
            headerHeight="medium"
            footerMessage="Secure access to sustainable journey"
            footerIcon="🔒"
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
}