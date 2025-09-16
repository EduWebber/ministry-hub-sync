import React, { ReactNode } from 'react';
import LayoutShell from '@/components/LayoutShell';

interface SidebarLayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * SidebarLayout: A layout component that provides a consistent page structure
 * with a title, optional actions, and wrapped content within the main layout shell.
 */
export default function SidebarLayout({ title, actions, children }: SidebarLayoutProps) {
  return (
    <LayoutShell>
      <div className="space-y-6">
        {/* Page header with title and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
        
        {/* Page content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </LayoutShell>
  );
}