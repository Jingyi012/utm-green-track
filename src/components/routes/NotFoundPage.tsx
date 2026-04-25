import { Button, Result } from 'antd';
import { useRouter } from '@tanstack/react-router';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => router.history.back()}>
          Back
        </Button>
      }
    />
  );
}
