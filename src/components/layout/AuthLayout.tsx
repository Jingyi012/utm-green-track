'use client';
import Image from 'next/image';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    containerSize?: 'small' | 'medium' | 'large';
    headerHeight?: 'small' | 'medium' | 'large';
    showFeatureCards?: boolean;
    footerMessage?: string;
    footerIcon?: string;
    featureCards?: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    containerSize = 'small',
    headerHeight = 'medium',
    showFeatureCards = false,
    footerMessage = "Together, we build a greener tomorrow",
    footerIcon = "🌱",
    featureCards = []
}: AuthLayoutProps) {
    // Container size configurations
    const containerSizes = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-5xl'
    };

    // Header height configurations
    const headerHeights = {
        small: 'h-48',
        medium: 'h-64',
        large: 'h-72'
    };

    // Logo size based on header height
    const logoSizes = {
        small: { height: 100, width: 100 },
        medium: { height: 120, width: 120 },
        large: { height: 130, width: 130 }
    };

    const currentLogoSize = logoSizes[headerHeight];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-25 to-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating Leaf Elements */}
                <div className="absolute top-20 left-10 w-8 h-8 bg-green-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                <div className="absolute top-40 right-20 w-6 h-6 bg-emerald-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                <div className="absolute top-96 left-20 w-10 h-10 bg-green-100 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
                <div className="absolute top-80 right-10 w-7 h-7 bg-lime-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '3s', animationDuration: '3.5s' }}></div>
                <div className="absolute bottom-32 left-1/4 w-9 h-9 bg-emerald-200 rounded-full opacity-15 animate-bounce" style={{ animationDelay: '4s', animationDuration: '4.5s' }}></div>
                <div className="absolute bottom-60 right-1/3 w-5 h-5 bg-green-300 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '5s', animationDuration: '3.8s' }}></div>

                {/* Decorative Geometric Shapes */}
                <div className="absolute top-1/4 left-5 w-16 h-16 border-2 border-green-200 rotate-45 opacity-10 animate-spin" style={{ animationDuration: '20s' }}></div>
                <div className="absolute top-2/3 right-8 w-12 h-12 border-2 border-emerald-300 rotate-12 opacity-15 animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/3 w-14 h-14 border-2 border-lime-200 rotate-90 opacity-12 animate-spin" style={{ animationDuration: '25s' }}></div>

                {/* Leaf SVG Icons */}
                <div className="absolute top-32 right-1/4 opacity-10 animate-pulse">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                </div>

                <div className="absolute top-2/3 left-1/4 opacity-8 animate-pulse" style={{ animationDelay: '2s' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-lime-400">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                    </svg>
                </div>

                <div className="absolute bottom-1/3 right-1/4 opacity-12 animate-pulse" style={{ animationDelay: '4s' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
                    </svg>
                </div>
            </div>

            {/* Enhanced Header Section */}
            <header className={`relative ${headerHeights[headerHeight]} bg-gradient-to-r from-green-700 via-green-600 to-emerald-700 flex flex-col justify-center items-center space-y-4 shadow-2xl overflow-hidden`}>
                {/* Header Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-1"></div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-green-800 rounded-full -translate-x-16 -translate-y-16 opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-800 rounded-full translate-x-20 translate-y-20 opacity-15"></div>

                <div className="flex flex-col items-center z-10 relative">
                    {/* Logo Container with Enhanced Styling */}
                    <div className="flex items-center space-x-6 mb-4 relative">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white rounded-full opacity-20 scale-110 group-hover:scale-125 transition-transform duration-300"></div>
                            <Image
                                src="/images/utmlogo.png"
                                alt="UTM Logo"
                                height={currentLogoSize.height}
                                width={currentLogoSize.width}
                                className="object-contain relative z-10 drop-shadow-lg hover:scale-105 transition-transform duration-300"
                                priority
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-white rounded-full opacity-20 scale-110 group-hover:scale-125 transition-transform duration-300"></div>
                            <Image
                                src="/images/logo2.png"
                                alt="Green Tracking System Logo"
                                height={currentLogoSize.height}
                                width={currentLogoSize.width}
                                className="object-contain relative z-10 drop-shadow-lg hover:scale-105 transition-transform duration-300"
                                priority
                            />
                        </div>
                    </div>

                    {/* Enhanced Text with Animation */}
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg tracking-wide">
                            {title}
                        </h1>
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                            <p className="text-green-100 text-base md:text-lg font-medium">{subtitle}</p>
                            <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>

                        {/* Decorative Underline */}
                        <div className="flex justify-center mt-3">
                            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-green-200 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Enhanced Main Content */}
            <main className={`container mx-auto px-4 py-8 ${headerHeight === 'small' ? '-mt-12' : headerHeight === 'medium' ? '-mt-15' : '-mt-20'} relative z-20`}>
                {/* Form Container with Enhanced Styling */}
                <div className={`relative ${containerSizes[containerSize]} mx-auto`}>
                    {/* Background Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 ${containerSize === 'large' ? 'rounded-3xl' : 'rounded-2xl'} blur-xl opacity-30 scale-105`}></div>

                    {/* Form */}
                    <div className={`relative bg-white/${containerSize === 'large' ? '95' : '90'} backdrop-blur-sm ${containerSize === 'large' ? 'rounded-3xl' : 'rounded-2xl'} shadow-2xl ${containerSize === 'large' ? 'p-2 border border-green-100' : 'p-1'}`}>
                        {children}
                    </div>
                </div>

                {/* Enhanced Footer */}
                <footer className={`mt-12 text-center relative ${containerSizes[containerSize]} mx-auto`}>
                    {/* Decorative Elements */}
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-px bg-gradient-to-r from-transparent to-green-300"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div className="w-12 h-px bg-green-300"></div>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <div className="w-8 h-px bg-gradient-to-l from-transparent to-green-300"></div>
                        </div>
                    </div>

                    <div className="space-y-2 text-gray-600">
                        <p className="font-medium">© {new Date().getFullYear()} UTM Green Tracking System</p>
                        <p className="text-sm flex items-center justify-center space-x-2">
                            <span>{footerIcon}</span>
                            <span>{subtitle}</span>
                            <span>{footerIcon}</span>
                        </p>
                    </div>

                    {/* Custom Message */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <p className="text-sm text-green-700 font-medium">
                            "{footerMessage}"
                        </p>
                    </div>

                    {/* Feature Cards (if enabled) */}
                    {showFeatureCards && featureCards.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {featureCards.map((card, index) => (
                                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-100 shadow-sm">
                                    <div className="text-2xl mb-2">{card.icon}</div>
                                    <h3 className="text-sm font-semibold text-green-700">{card.title}</h3>
                                    <p className="text-xs text-gray-600">{card.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </footer>
            </main>
        </div>
    );
}