import React from 'react';
import UnifiedLayout from './UnifiedLayout';

interface SidebarLayoutProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ title, actions, children }) => {
  return (
    <UnifiedLayout title={title} actions={actions}>
      {children}
    </UnifiedLayout>
  );
};

export default SidebarLayout;