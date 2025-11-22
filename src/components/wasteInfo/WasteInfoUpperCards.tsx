'use client';
import React from 'react';
import Image from 'next/image';

interface SimpleCardProps {
    image: string;
    title: string;
    href: string;
}

const SimpleCard: React.FC<SimpleCardProps> = ({ image, title, href }) => (
    <a href={href} target='_blank'>
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
    </a>
);

const cardData = [
    {
        image: '/images/solid-waste-act-2007.png',
        title: 'Solid Waste And Public Cleansing Management Act 2007',
        href: 'https://drive.google.com/file/d/1YD6XNI8djIRucDULDkGYcApl_L2hR3yG/view?usp=sharing'
    },
    {
        image: '/images/dasar-pengurusan-sisa-pepejal-negara-2016.png',
        title: 'Dasar Pengurusan Sisa Pepejal Negara 2016',
        href: 'https://drive.google.com/file/d/1GMCKxbTp6KZCYVu98plbbHGnT4rN_EIL/view?usp=sharing'
    },
    {
        image: '/images/dasar-kebersihan-negara.png',
        title: 'Dasar Kebersihan Negara',
        href: 'https://drive.google.com/file/d/1__W4FsL6q06-UBSb7QqqnGEfAui4DA2t/view?usp=sharing'
    },
    {
        image: '/images/polisi-kelestarian-kampus.png',
        title: 'Polisi Kelestarian Kampus',
        href: 'https://drive.google.com/file/d/11J1sc5u18la81wMk2gzayjCKrS01oSfI/view?usp=sharing'
    },
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
                <SimpleCard key={idx} image={card.image} title={card.title} href={card.href} />
            ))}
        </div>
    );
};

export default WasteInfoUpperCards;