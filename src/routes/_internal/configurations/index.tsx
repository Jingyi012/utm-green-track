import { Empty } from 'antd';
import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@ant-design/pro-components';

export const Route = createFileRoute('/_internal/configurations/')({
  component: ConfigurationsIndexRoute,
});

function ConfigurationsIndexRoute() {
  return (
    <PageContainer title='Configurations' style={{ minHeight: '500px' }}>
      <div className='bg-white p-4 rounded-lg shadow-md'>
        <Empty description='Please select a configuration from the menu' />
      </div>
    </PageContainer>
  );
}
