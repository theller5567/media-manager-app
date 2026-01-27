import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  progress?: {
    value: number; // 0 to 100
    color?: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
  progress,
}) => {
  return (
    <div className={cn(
      "bg-slate-800 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-sm transition-all hover:shadow-md hover:bg-slate-800/80",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={cn(
          "p-2.5 rounded-lg bg-slate-900 border border-slate-700",
          iconClassName
        )}>
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
      </div>
      
      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded-full",
              trend.isPositive ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 font-medium">
              {description}
            </span>
          )}
        </div>
      )}

      {progress && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-500">
            <span>Usage</span>
            <span>{Math.round(progress.value)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                progress.color || "bg-cyan-500"
              )}
              style={{ width: `${Math.min(100, progress.value)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};