"use client";

import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ResumeEditorV2 from '@/components/ResumeEditorV2';
import { useRouter, useSearchParams } from 'next/navigation';

function NewResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams?.get('id');

  const handleSave = () => {
    // Redirect to resume list after successful save
    router.push('/dashboard/resume');
  };

  return (
    <ResumeEditorV2 
      resumeId={resumeId || undefined}
      onSave={handleSave} 
      template="modern"
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