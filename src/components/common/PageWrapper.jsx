import React from 'react';

/**
 * PageWrapper — optional standard page content container.
 *
 * Enforces:
 *  - max-w-7xl mx-auto w-full  (consistent max-width)
 *  - space-y-6                 (consistent vertical section spacing)
 *
 * Usage:
 *   <PageWrapper>
 *     <PageHeader ... />
 *     <section>...</section>
 *     <section>...</section>
 *   </PageWrapper>
 *
 * The outer layout (AdminLayout, StudentLayout, etc.) already applies
 * p-6 lg:p-10 padding on <main>, so no padding is added here.
 */
const PageWrapper = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto w-full space-y-6 ${className}`.trim()}>
    {children}
  </div>
);

export default PageWrapper;
