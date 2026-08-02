import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from './Button';
import { Input } from './Input';
import { Toast } from './Toast';
import { Plus, FolderPlus, Tag, X } from 'lucide-react';

export interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  label,
  error,
  required = false,
}) => {
  const { categories, createCategory } = useInventory();
  const { t } = useLanguage();
  const displayLabel = label || t('colCategory');
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newCatName.trim()) {
      setErrorMessage('Please enter a category name');
      return;
    }

    setIsSubmitting(true);
    const result = await createCategory(newCatName.trim(), newCatDesc.trim());
    setIsSubmitting(false);

    if (result) {
      onChange(result.id);
      setNewCatName('');
      setNewCatDesc('');
      setIsCreatingInline(false);
      setErrorMessage(null);
      setToastMessage('Category added successfully');
    } else {
      setErrorMessage('Failed to add category. Please check your connection and try again.');
    }
  };

  return (
    <div
      className="form-group"
      style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}
    >
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {displayLabel && (
          <label
            className="form-label"
            style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}
          >
            {displayLabel} {required && <span style={{ color: 'var(--brand-danger)' }}>*</span>}
          </label>
        )}
        {!isCreatingInline && (
          <button
            type="button"
            onClick={() => setIsCreatingInline(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--brand-primary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 4px',
            }}
          >
            <Plus size={14} />
            <span>+ New Category</span>
          </button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required && !value}
          className={`input-field ${error ? 'input-error' : ''}`}
          style={{
            width: '100%',
            paddingLeft: '38px',
            height: '48px',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
          }}
          disabled={isCreatingInline}
        >
          <option value="">-- Select category group --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} {cat.description ? `(${cat.description})` : ''}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        >
          <Tag size={17} />
        </div>
      </div>
      {error && (
        <span className="form-error" style={{ color: 'var(--brand-danger)', fontSize: '0.78rem' }}>
          {error}
        </span>
      )}

      {/* Responsive Inline Category Creator */}
      {isCreatingInline && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: '8px',
            padding: '16px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--brand-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.88rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FolderPlus size={16} color="var(--brand-primary)" />
              <span>{t('modalTitleCategory')}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCreatingInline(false);
                setErrorMessage(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              aria-label="Close category creator"
            >
              <X size={17} />
            </button>
          </div>

          <Input
            label={t('fieldCatName')}
            type="text"
            placeholder={t('placeholderCatName')}
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />

          <Input
            label="Description / Note (Optional)"
            type="text"
            placeholder="e.g., Cold drinks for front fridge"
            value={newCatDesc}
            onChange={(e) => setNewCatDesc(e.target.value)}
          />

          {errorMessage && (
            <p style={{ color: 'var(--brand-danger)', fontSize: '0.82rem', margin: 0 }}>
              {errorMessage}
            </p>
          )}

          <div
            style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsCreatingInline(false);
                setErrorMessage(null);
              }}
            >
              {t('btnCancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateCategory}
              isLoading={isSubmitting}
              leftIcon={<Plus size={14} />}
            >
              {t('btnSaveCategory')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
