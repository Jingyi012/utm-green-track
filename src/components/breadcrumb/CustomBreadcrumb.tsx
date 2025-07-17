'use client';

import Link from 'next/link';
import { RightOutlined } from '@ant-design/icons';
import { Divider } from 'antd';

const CustomBreadcrumb = ({ items }: { items: { title: string; href?: string }[] }) => {
    return (
        <>
            <nav className="text-sm my-3">
                <ol className="flex items-center space-x-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                            {item.href ? (
                                <Link href={item.href} className="text-blue-600 hover:underline">
                                    {item.title}
                                </Link>
                            ) : (
                                <span className="text-gray-500">{item.title}</span>
                            )}
                            {index < items.length - 1 && <RightOutlined className="text-gray-400 text-xs" />}
                        </li>
                    ))}
                </ol>
            </nav>
        </>

    );
};

export default CustomBreadcrumb;
