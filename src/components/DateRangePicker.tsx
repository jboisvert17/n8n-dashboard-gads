'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export type DateRange = {
  startDate: string;
  endDate: string;
  label: string;
};

const presetRanges = [
  { id: 'today', label: "Aujourd'hui", days: 0 },
  { id: 'yesterday', label: 'Hier', days: 1 },
  { id: 'last7', label: '7 derniers jours', days: 7 },
  { id: 'last14', label: '14 derniers jours', days: 14 },
  { id: 'last30', label: '30 derniers jours', days: 30 },
  { id: 'thisMonth', label: 'Ce mois-ci', days: -1 },
  { id: 'lastMonth', label: 'Mois dernier', days: -2 },
  { id: 'last90', label: '90 derniers jours', days: 90 },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDateRange(rangeId: string): { startDate: string; endDate: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const range = presetRanges.find(r => r.id === rangeId);
  
  if (!range) {
    // Par défaut: 30 derniers jours
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    return { startDate: formatDate(start), endDate: formatDate(today) };
  }

  if (range.id === 'today') {
    return { startDate: formatDate(today), endDate: formatDate(today) };
  }

  if (range.id === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
  }

  if (range.id === 'thisMonth') {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: formatDate(startOfMonth), endDate: formatDate(today) };
  }

  if (range.id === 'lastMonth') {
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return { startDate: formatDate(startOfLastMonth), endDate: formatDate(endOfLastMonth) };
  }

  // Pour les autres (days > 0)
  const start = new Date(today);
  start.setDate(start.getDate() - range.days);
  return { startDate: formatDate(start), endDate: formatDate(today) };
}

interface DateRangePickerProps {
  value: string;
  onChange: (rangeId: string, dates: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedRange = presetRanges.find(r => r.id === value);
  const dates = getDateRange(value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustom(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (rangeId: string) => {
    const newDates = getDateRange(rangeId);
    onChange(rangeId, newDates);
    setIsOpen(false);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange('custom', { startDate: customStart, endDate: customEnd });
      setIsOpen(false);
      setShowCustom(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition text-sm"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-white">
          {value === 'custom' 
            ? `${dates.startDate} → ${dates.endDate}`
            : selectedRange?.label || '30 derniers jours'
          }
        </span>
        <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {!showCustom ? (
            <>
              <div className="p-2">
                {presetRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => handleSelect(range.id)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition',
                      value === range.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-300 hover:bg-dark-700'
                    )}
                  >
                    <span>{range.label}</span>
                    {value === range.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-dark-700 p-2">
                <button
                  onClick={() => setShowCustom(true)}
                  className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-dark-700 rounded-lg text-left"
                >
                  📅 Période personnalisée...
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-4">
              <p className="text-sm font-medium text-white">Période personnalisée</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustom(false)}
                  className="flex-1 px-3 py-2 bg-dark-700 text-gray-300 rounded-lg text-sm hover:bg-dark-600"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}

          {/* Afficher les dates sélectionnées */}
          {!showCustom && (
            <div className="border-t border-dark-700 px-4 py-3 bg-dark-750">
              <p className="text-xs text-gray-500">Période sélectionnée</p>
              <p className="text-sm text-white mt-1">
                {dates.startDate} → {dates.endDate}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { getDateRange };


