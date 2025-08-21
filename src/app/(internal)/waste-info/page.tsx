import React from 'react';
import CustomBreadcrumb from '@/components/breadcrumb/CustomBreadcrumb';
import WasteInfoSection from '@/components/wasteInfo/WasteInfoSection';

export default function WasteInfoPage() {
    return (
        <>
            <CustomBreadcrumb items={[
                { title: 'Waste Info' }
            ]} />
            <WasteInfoSection />
        </>
    );
}