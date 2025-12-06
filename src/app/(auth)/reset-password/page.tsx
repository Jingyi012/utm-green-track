import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Spin } from "antd";
import { Suspense } from "react";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Spin />}>
            <AuthLayout
                title="Reset Your Password"
                subtitle="Secure Account Recovery"
                containerSize="small"
                headerHeight="large"
                footerMessage="Secure access to sustainable journey"
                footerIcon="🔒"
            >
                <ResetPasswordForm />
            </AuthLayout>
        </Suspense>
    );
}