"use client";

import { Suspense } from 'react';
import { DashboardLayout } from '@/shared/components';
import { ResumeEditorV2 } from '@/features/resume';
import { useSearchParams } from 'next/navigation';

function NewResumeContent() {
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