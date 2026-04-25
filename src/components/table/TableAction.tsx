import type { ReactNode } from 'react';
import { Button, Space } from 'antd';
import type { ButtonProps } from 'antd';

type TableActionTone =
  | 'default'
  | 'primary'
  | 'view'
  | 'edit'
  | 'success'
  | 'warning'
  | 'danger';

type TableActionButtonProps = Omit<ButtonProps, 'type' | 'size'> & {
  tone?: TableActionTone;
  children?: ReactNode;
};

const getToneClassName = (tone: TableActionTone) => {
  return `table-action-button table-action-button--${tone}`;
};

export const TableActionGroup = ({ children }: { children: ReactNode }) => {
  return (
    <Space size={[6, 6]} wrap className="table-action-group">
      {children}
    </Space>
  );
};

export const TableActionButton = ({
  tone = 'default',
  children,
  className,
  ...buttonProps
}: TableActionButtonProps) => {
  return (
    <Button
      {...buttonProps}
      size="small"
      className={[getToneClassName(tone), className].filter(Boolean).join(' ')}
    >
      {children}
    </Button>
  );
};
