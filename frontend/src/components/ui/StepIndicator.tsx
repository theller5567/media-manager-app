import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (stepIndex: number) => void;
  className?: string;
  variant?: 'desktop' | 'mobile';
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
  variant = 'desktop',
}: StepIndicatorProps) {
  const totalSteps = steps.length;
  const completedCount = completedSteps.size;
  const progressPercentage = (completedCount / totalSteps) * 100;

  const canNavigateToStep = (stepIndex: number): boolean => {
    // Can navigate to completed steps or the next sequential step
    return completedSteps.has(stepIndex) || stepIndex === currentStep + 1;
  };

  // Mobile variant: horizontal icons-only layout
  if (variant === 'mobile') {
    return (
      <div className={twMerge('space-y-3', className)}>
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-slate-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-cyan-500 to-cyan-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Horizontal icon row - icons only, not clickable */}
        <div className="flex items-center justify-between px-2">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = currentStep === index;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={twMerge(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0',
                    isCurrent
                      ? 'bg-cyan-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop variant: vertical sidebar layout (existing implementation)
  return (
    <div className={twMerge('flex flex-col h-full', className)}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-slate-400">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-cyan-500 to-cyan-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <nav className="flex-1 space-y-0" aria-label="Form steps">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = currentStep === index;
          const isAccessible = canNavigateToStep(index);
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isAccessible) {
                    onStepClick(index);
                  }
                }}
                disabled={!isAccessible}
                className={twMerge(
                  'w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors relative z-10',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800',
                  isCurrent
                    ? 'bg-cyan-500/20 border-2 border-cyan-500 text-white'
                    : isCompleted
                    ? 'bg-slate-800/50 border-2 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                    : isAccessible
                    ? 'bg-slate-800/30 border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    : 'bg-slate-800/20 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={!isAccessible}
              >
                {/* Step Icon/Number */}
                <div
                className={twMerge(
                  'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    isCurrent
                      ? 'bg-cyan-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : isAccessible
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-800 text-slate-500'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className={twMerge(
                      'text-sm font-medium',
                      isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
                  )}
                </div>
              </button>

              {/* Connector Line (except for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={twMerge(
                    'absolute left-7 top-11 w-0.5 h-4 transition-colors z-0',
                    completedSteps.has(index) ? 'bg-green-500' : 'bg-slate-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
