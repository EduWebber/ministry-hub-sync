import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { InstructorDashboardSimplified } from '@/components/InstructorDashboardSimplified';

const InstrutorDashboard = () => {
  return (
    <SidebarLayout title="Dashboard">
      <InstructorDashboardSimplified />
    </SidebarLayout>
  );
};

export default InstrutorDashboard;
