"use client";


import DashboardLayout from '@/components/DashboardLayout';
import ResumeEditorV2 from '@/components/ResumeEditorV2';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewResumeV2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams?.get('id');

  const handleSave = () => {
    // Redirect to resume list after successful save
    router.push('/dashboard/resume');
  };

  return (
    <DashboardLayout>
      <ResumeEditorV2 
        resumeId={resumeId || undefined}
        onSave={handleSave} 
        template="modern"
      />
    </DashboardLayout>
  );
} 