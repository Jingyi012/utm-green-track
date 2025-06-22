import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Image from 'next/image';

export default function RegistrationPage() {
    return (
        <>
            <div className="h-30 bg-primary flex justify-center items-center flex-col">
                <Image
                    src="/images/logo2.png"
                    alt="Logo"
                    height={120}
                    width={120}
                    className="z-10"
                />
            </div>

            <div className="flex justify-center mt-5">
                <ResetPasswordForm />
            </div>

        </>
    )
}