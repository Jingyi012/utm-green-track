import { App, ConfigProvider } from 'antd';
import { createIntl, ProConfigProvider } from '@ant-design/pro-components';
import enUSIntl from '@ant-design/pro-provider/lib/locale/en_US';
import enUS from 'antd/locale/en_US';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthContext';
import { BadgeProvider } from './BadgeContext';
import { useState } from 'react';
import { createAppQueryClient } from '@/lib/queryClient';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createAppQueryClient());
  const myTranslationMap = {
    ...enUSIntl,
    tableForm: {
      ...enUSIntl.tableForm,
      search: 'Search',
      submit: 'Submit',
      reset: 'Reset',
    },
    // You can override other sections like 'moneySymbol', 'form', etc.
  };
  const customIntl = createIntl('en_US', myTranslationMap);

  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        token: {
          colorPrimary: '#15803d',
          colorPrimaryHover: '#388426',
          colorPrimaryActive: '#1e4b14',
          colorBgContainer: '#ffffffff',
          colorText: '#1a1a1a',
          colorTextSecondary: '#4d4d4d',
          colorBorder: '#d9d9d9',
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Menu: {
            itemActiveBg: '#c8edb8',
            itemSelectedBg: '#c8edb8',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ProConfigProvider intl={customIntl}>
          <App>
            <AuthProvider>
              <BadgeProvider>{children}</BadgeProvider>
            </AuthProvider>
          </App>
        </ProConfigProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
