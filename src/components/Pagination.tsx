import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 0',
    marginTop: '16px',
    borderTop: '1px solid var(--border-color)',
  };

  const numberStyle = (isActive: boolean): React.CSSProperties => ({
    minWidth: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-app)',
    color: isActive ? '#fff' : 'var(--text-main)',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  });

  return (
    <div style={containerStyle}>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: '6px 10px', height: '36px' }}
      >
        <ChevronLeft size={16} />
      </Button>

      <div style={{ display: 'flex', gap: '6px' }}>
        {pageNumbers.map((num) => (
          <button
            key={num}
            style={numberStyle(currentPage === num)}
            onClick={() => onPageChange(num)}
            aria-label={`Go to page ${num}`}
            aria-current={currentPage === num ? 'page' : undefined}
          >
            {num}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: '6px 10px', height: '36px' }}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};
