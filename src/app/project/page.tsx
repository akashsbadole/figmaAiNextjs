'use client';

import dynamic from 'next/dynamic';

const ProjectIDE = dynamic(() => import('@/components/project/project-ide'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#1e1e1e]">
      <div className="text-gray-400">Loading IDE...</div>
    </div>
  ),
});

export default function ProjectPage() {
  return <ProjectIDE />;
}
