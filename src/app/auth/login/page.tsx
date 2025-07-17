'use client';
import LoginForm from "@/components/auth/LoginForm";
import Image from 'next/image';

export default function ChangePasswordPage() {
    return (
        <>
            <div className="relative h-90 bg-primary flex justify-center items-center flex-col">
                <Image
                    src="/images/utmlogo.png"
                    alt="Logo"
                    height={200}
                    width={200}
                    className="z-10"
                />
                <Image
                    src="/images/logo2.png"
                    alt="Logo"
                    height={200}
                    width={200}
                    className="z-10"
                />
            </div>

            <div className="-mt-15 flex justify-center">
                <LoginForm />
            </div>

        </>
    )
}