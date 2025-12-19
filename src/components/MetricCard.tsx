'use client';

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  rose: {
    bg: 'bg-rose-500/10',
    icon: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  violet: {
    bg: 'bg-violet-500/10',
    icon: 'text-violet-400',
    border: 'border-violet-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    icon: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
};

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'blue' 
}: MetricCardProps) {
  const colors = colorClasses[color];

  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? 'text-emerald-400'
      : trend.value < 0
        ? 'text-rose-400'
        : 'text-gray-400'
    : '';

  return (
    <div className={clsx(
      'card card-hover relative overflow-hidden',
      colors.border,
      'border-l-4'
    )}>
      {/* Fond décoratif */}
      <div className={clsx(
        'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20',
        colors.bg
      )} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && TrendIcon && (
                <span className={clsx('flex items-center gap-1 text-sm', trendColor)}>
                  <TrendIcon className="w-4 h-4" />
                  {Math.abs(trend.value)}%
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-gray-500">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        <div className={clsx(
          'p-3 rounded-xl',
          colors.bg
        )}>
          <Icon className={clsx('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </div>
  );
}


