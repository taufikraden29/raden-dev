'use client';

import { memo } from 'react';
import './Skeleton.css';

// Base skeleton component
export const Skeleton = memo(function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = ''
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
});

// Blog Card Skeleton
export const BlogCardSkeleton = memo(function BlogCardSkeleton() {
  return (
    <article className="blog-card-skeleton card">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <Skeleton width="60px" height="20px" />
        <Skeleton width="90%" height="1.5rem" className="mt-sm" />
        <Skeleton width="100%" height="0.875rem" className="mt-sm" />
        <Skeleton width="80%" height="0.875rem" className="mt-xs" />
        <div className="skeleton-meta mt-md">
          <Skeleton width="100px" height="14px" />
          <Skeleton width="80px" height="14px" />
        </div>
      </div>
    </article>
  );
});

// Blog List Skeleton - Shows multiple card skeletons
export const BlogListSkeleton = memo(function BlogListSkeleton({ count = 6 }) {
  return (
    <div className="posts-grid">
      {Array.from({ length: count }).map((_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  );
});

// Blog Detail Skeleton
export const BlogDetailSkeleton = memo(function BlogDetailSkeleton() {
  return (
    <div className="blog-detail-skeleton">
      <Skeleton width="100px" height="28px" className="mb-md" />
      <Skeleton width="80%" height="2.5rem" className="mb-sm" />
      <Skeleton width="60%" height="1rem" className="mb-lg" />
      <div className="skeleton-meta-row mb-xl">
        <Skeleton width="120px" height="16px" />
        <Skeleton width="100px" height="16px" />
        <Skeleton width="80px" height="16px" />
      </div>
      <Skeleton width="100%" height="300px" borderRadius="var(--radius-md)" className="mb-xl" />
      <div className="skeleton-content-lines">
        <Skeleton width="100%" height="1rem" className="mb-sm" />
        <Skeleton width="95%" height="1rem" className="mb-sm" />
        <Skeleton width="90%" height="1rem" className="mb-sm" />
        <Skeleton width="85%" height="1rem" className="mb-lg" />
        <Skeleton width="100%" height="1rem" className="mb-sm" />
        <Skeleton width="92%" height="1rem" className="mb-sm" />
      </div>
    </div>
  );
});

// Text Line Skeleton
export const TextSkeleton = memo(function TextSkeleton({ lines = 3 }) {
  return (
    <div className="text-skeleton">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height="1rem"
          className="mb-sm"
        />
      ))}
    </div>
  );
});

export default Skeleton;
