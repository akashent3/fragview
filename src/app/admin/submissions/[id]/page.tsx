import { requireAdmin } from '@/lib/admin/permissions';
import { getSubmissionById } from '@/lib/admin/submissions';
import { notFound } from 'next/navigation';
import SubmissionReviewClient from '@/components/admin/SubmissionReviewClient';

export const metadata = {
  title: 'Review Submission | Admin',
};

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  return <SubmissionReviewClient submission={submission} />;
}