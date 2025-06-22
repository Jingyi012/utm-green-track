import { redirect } from 'next/navigation';

export function generateMetadata() {
  return {
    title: 'Redirecting...',
  };
}

export default function Page() {
  redirect('/auth/login');
}
