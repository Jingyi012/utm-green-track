import { createFileRoute } from '@tanstack/react-router';
import HomeSection from '@/components/home/HomeSection';

export const Route = createFileRoute('/_internal/home')({
  component: HomeSection,
});
