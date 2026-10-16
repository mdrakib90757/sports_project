'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  labelBn?: string;
  avatarUrl?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  searchable?: boolean | 'auto';
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchable = 'auto',
  multiple = false,
  disabled = false,
  className = '',
  triggerClassName = '',
  id,
  'aria-label': ariaLabel,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen for bottom-sheet mode
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine if search should be active
  const isSearchEnabled =
    searchable === true || (searchable === 'auto' && options.length > 8);

  // Filter options
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchLabel = opt.label.toLowerCase().includes(q);
    const matchBn = opt.labelBn ? opt.labelBn.toLowerCase().includes(q) : false;
    return matchLabel || matchBn;
  });

  // Selected state checks
  const isSelected = (val: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  const selectedOptions = options.filter((opt) => isSelected(opt.value));

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveIndex(-1);
      if (isSearchEnabled) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
  }, [isOpen, isSearchEnabled]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < filteredOptions.length) {
      e.preventDefault();
      handleSelect(filteredOptions[activeIndex]);
    }
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? [...value] : [];
      const index = currentValues.indexOf(option.value);
      if (index > -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(option.value);
      }
      onChange(currentValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left font-sans ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* 1. Custom Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-500/80 text-left flex items-center justify-between gap-2.5 shadow-sm backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]/40 focus:border-[#C6FF3D] ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'ring-2 ring-[#C6FF3D]/40 border-[#C6FF3D]' : ''} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
          {selectedOptions.length === 0 ? (
            <span className="text-slate-400 text-sm truncate">{placeholder}</span>
          ) : multiple ? (
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
              {selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                >
                  {opt.avatarUrl && (
                    <img
                      src={opt.avatarUrl}
                      alt=""
                      className="w-3.5 h-3.5 rounded-full object-cover"
                    />
                  )}
                  <span>{opt.label}</span>
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 truncate">
              {selectedOptions[0].avatarUrl && (
                <img
                  src={selectedOptions[0].avatarUrl}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                />
              )}
              {selectedOptions[0].icon && (
                <span className="text-slate-400 shrink-0">{selectedOptions[0].icon}</span>
              )}
              <span className="text-sm font-semibold text-slate-100 truncate">
                {selectedOptions[0].label}
              </span>
              {selectedOptions[0].badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                  {selectedOptions[0].badge}
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#C6FF3D]' : ''
          }`}
        />
      </button>

      {/* 2. Desktop Popover OR Mobile Bottom Sheet */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          {isMobile && (
            <div
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div
            className={
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-slate-950 border-t border-slate-700/80 p-4 pb-8 max-h-[82vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250'
                : 'absolute left-0 right-0 z-50 mt-2 rounded-2xl bg-slate-900/98 border border-slate-700/90 shadow-2xl backdrop-blur-xl max-h-72 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150'
            }
          >
            {/* Mobile Sheet Handle & Header */}
            {isMobile && (
              <div className="flex flex-col items-center pb-3">
                <div className="w-12 h-1.5 rounded-full bg-slate-700 mb-2" />
                <div className="flex items-center justify-between w-full px-1">
                  <span className="text-sm font-bold text-slate-200">{placeholder}</span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Optional Search Bar */}
            {isSearchEnabled && (
              <div className="p-2.5 border-b border-slate-800/80">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#C6FF3D] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div
              ref={optionsListRef}
              role="listbox"
              aria-multiselectable={multiple}
              className="flex-1 overflow-y-auto p-1.5 space-y-1"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const selected = isSelected(opt.value);
                  const isHovered = idx === activeIndex;

                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelect(opt)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`min-h-[44px] px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-sm transition-all duration-150 ${
                        opt.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'cursor-pointer'
                      } ${
                        selected
                          ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                          : isHovered
                          ? 'bg-slate-800/80 text-white'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {opt.avatarUrl && (
                          <img
                            src={opt.avatarUrl}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                          />
                        )}
                        {opt.icon && <span className="text-slate-400 shrink-0">{opt.icon}</span>}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{opt.label}</span>
                          {opt.labelBn && (
                            <span className="text-xs text-slate-400 font-bangla truncate">
                              {opt.labelBn}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                            {opt.badge}
                          </span>
                        )}
                        {selected && (
                          <Check className="w-4 h-4 text-[#C6FF3D] stroke-[2.5]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
