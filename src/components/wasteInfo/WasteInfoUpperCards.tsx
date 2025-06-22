'use client';
import React from 'react';
import Image from 'next/image';

interface SimpleCardProps {
    image: string;
    title: string;
}

const SimpleCard: React.FC<SimpleCardProps> = ({ image, title }) => (
    <div style={{
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        textAlign: 'center',
        background: '#fff',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
    }}>
        <Image
            src={image}
            alt={title}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            width={120}
            height={200}
        />
        <div style={{ fontWeight: 500, fontSize: 16 }}>{title}</div>
    </div>
);

const cardData = [
    { image: '/images/solid-waste-act-2007.png', title: 'Solid Waste And Public Cleansing Management Act 2007' },
    { image: '/images/dasar-pengurusan-sisa-pepejal-negara-2016.png', title: 'Dasar Pengurusan Sisa Pepejal Negara 2016' },
    { image: '/images/dasar-kebersihan-negara.png', title: 'Dasar Kebersihan Negara' },
    { image: '/images/polisi-kelestarian-kampus.png', title: 'Polisi Kelestarian Kampus' },
];

const WasteInfoUpperCards = () => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            marginBottom: 32
        }}>
            {cardData.map((card, idx) => (
                <SimpleCard key={idx} image={card.image} title={card.title} />
            ))}
        </div>
    );
};

export default WasteInfoUpperCards;