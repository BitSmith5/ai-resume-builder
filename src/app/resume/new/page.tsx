"use client";

import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ResumeEditorV2 from '@/components/ResumeEditorV2';
import { useRouter, useSearchParams } from 'next/navigation';

function NewResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams?.get('id');

  return (
    <ResumeEditorV2 
      resumeId={resumeId || undefined}
    />
  );
}

export default function NewResumeV2Page() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <NewResumeContent />
      </Suspense>
    </DashboardLayout>
  );
} 