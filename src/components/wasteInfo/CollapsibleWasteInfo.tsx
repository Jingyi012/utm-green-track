'use client';

import React from 'react';
import { Collapse, Typography } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface WasteInfoItem {
  title: string;
  description: string | string[];
}

interface CollapsibleWasteInfoProps {
  items: WasteInfoItem[];
  title?: string;
  defaultActiveKey?: string | number | (string | number)[];
}

const CollapsibleWasteInfo: React.FC<CollapsibleWasteInfoProps> = ({
  items,
  title,
  defaultActiveKey,
}) => {
  const collapseItems = items.map((item, index) => ({
    key: String(index + 1),
    label: (
      <span className="text-base font-medium text-white">
        {item.title}
      </span>
    ),
    children: (
      <div className="text-sm text-gray-600">
        {Array.isArray(item.description) ? (
          item.description.map((desc, i) => (
            <Text key={i} className="block mb-2">
              {desc}
            </Text>
          ))
        ) : (
          <Text>{item.description}</Text>
        )}
      </div>
    ),
  }));

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-xl font-semibold mb-4">{title}</h4>
      )}

      <Collapse
        items={collapseItems}
        bordered={true}
        expandIcon={({ isActive }) => (isActive ? <MinusOutlined style={{ color: '#fff' }} /> : <PlusOutlined style={{ color: '#fff' }} />)}
        expandIconPosition="start"
      />

      <style jsx global>{`
  .ant-collapse-item .ant-collapse-header {
    background-color:#2c661f;
    font-size: 16px;
    font-weight: 600;
    padding: 12px 16px;
    color: white;
  }
`}</style>
    </div>
  );
};

export default CollapsibleWasteInfo;
