import { useState } from 'react';
import { extractFormatFromExtension } from '@/lib/fileExtenstionUtils';
import { cn } from '@/lib/utils';
// what information does this component need from its parent?
    // the format the user selected from previous selector - image/video/audio/document/etc.
// list the most common aspect ratios and show a preview of the aspect ratio
// allow the user to select the aspect ratio or select no aspect ratio
// allow the user to input the aspect ratio manually if it's not in the list
// Once aspect ratio is selected, (if it's an image) a separate selector for minimum size of the image should be shown.
// The minimum size of the image should be in the format of width:height and if a aspect ratio was selected, the height should be calculated based on the width and the aspect ratio.

const COMMON_ASPECT_RATIOS = [
  { label: 'None', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '3:2', value: 3/2 },
  { label: '16:9', value: 16/9 },
  { label: '21:9', value: 21/9 },
  { label: '4:1', value: 4/1 },
]

interface AspectRatioSelectorProps {
  fileExtension: string;
  initialData?: {
    enabled: boolean;
    aspectRatio: { label: string; value: number | null };
    minWidth: number | '';
    minHeight: number | '';
  };
  onSave?: (data: {
    enabled: boolean;
    aspectRatio: { label: string; value: number | null };
    minWidth: number | '';
    minHeight: number | '';
  }) => void;
  onCancel?: () => void;
}

const AspectRatioSelector = ({ 
  fileExtension, 
  initialData,
  onSave,
  onCancel 
}: AspectRatioSelectorProps) => {
    const [aspectRatio, setAspectRatio] = useState<{value: number | null, label: string}>(
      initialData?.aspectRatio || {value: null, label: 'None'}
    );
    const [useSizeConstraints, setUseSizeConstraints] = useState<boolean>(
      initialData?.enabled || false
    );
    const [minWidth, setMinWidth] = useState<number | ''>(
      initialData?.minWidth ?? 800
    );
    const [minHeight, setMinHeight] = useState<number | ''>(
      initialData?.minHeight ?? 800
    );
    
    const handleWidthChange = (val: string) => {
        const num = parseInt(val);
        if (isNaN(num)) {
            setMinWidth('');
            return;
        }
        setMinWidth(num);
        if (aspectRatio.value) {
            setMinHeight(Math.round(num / aspectRatio.value));
        }
    };

    const handleHeightChange = (val: string) => {
        const num = parseInt(val);
        if (isNaN(num)) {
            setMinHeight('');
            return;
        }
        setMinHeight(num);
        if (aspectRatio.value) {
            setMinWidth(Math.round(num * aspectRatio.value));
        }
    };

    const handleRatioChange = (ratio: {value: number | null, label: string}) => {
        setAspectRatio(ratio);
        // If switching to a ratio and we have a width, update height
        if (ratio.value && typeof minWidth === 'number') {
            setMinHeight(Math.round(minWidth / ratio.value));
        }
    };

    const handleSave = () => {
      if (onSave) {
        onSave({
          enabled: useSizeConstraints,
          aspectRatio,
          minWidth,
          minHeight
        });
      }
    };

    const format: 'image' | 'video' | 'audio' | 'document' | 'other' = extractFormatFromExtension(fileExtension);

  return (
    <div className="space-y-6">
        {(format === 'image' || format === 'video') && (
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-cyan-500 uppercase tracking-wider">Aspect Ratio</h3>
                <div className="flex flex-wrap gap-2">
                    {COMMON_ASPECT_RATIOS.map((ratio) => (
                        <button 
                            key={ratio.label}
                            type="button"
                            className={cn(
                                "px-4 py-2 rounded-lg font-bold transition-all border",
                                aspectRatio.label === ratio.label
                                    ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                            )}
                            onClick={() => handleRatioChange(ratio)}
                        >
                            {ratio.label}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {(format === 'image' || format === 'video') && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                    <h3 className="text-lg font-bold text-cyan-500 uppercase tracking-wider">
                        {format === 'image' ? 'Size Constraints' : 'Resolution Override'}
                    </h3>
                    <p className="text-sm text-slate-500">Select a minimum size for the media to be resized to.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setUseSizeConstraints(!useSizeConstraints)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase transition-all border",
                            useSizeConstraints 
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50" 
                                : "bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-400"
                        )}
                    >
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            useSizeConstraints ? "bg-cyan-400 animate-pulse" : "bg-slate-600"
                        )} />
                        {useSizeConstraints ? 'Enabled' : 'Disabled'}
                    </button>
                </div>

                {useSizeConstraints && (
                    <>
                    <div className="relative flex flex-col md:flex-row items-center gap-0 md:gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex mt-2 md:flex-col md:mt-0 gap-1.5 flex-1 ">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Minimum Width (px)</label>
                            <input 
                                type="number" 
                                value={minWidth} 
                                onChange={(e) => handleWidthChange(e.target.value)}
                                placeholder="Auto"
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                            />
                        </div>
                        
                        <div className="my-2 md:my-6 text-slate-600 font-bold text-xl">×</div>

                        <div className="flex flex-row md:flex-col gap-1.5 flex-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Minimum Height (px)</label>
                            <input 
                                type="number" 
                                value={minHeight} 
                                onChange={(e) => handleHeightChange(e.target.value)}
                                placeholder="Auto"
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={() => { setMinWidth(800); setMinHeight(aspectRatio.value ? Math.round(800 / aspectRatio.value) : 800); }}
                            className="px-2 absolute right-2 top-2  bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md border border-slate-700 transition-all font-bold text-xs"
                        >
                            Reset
                        </button>
                    </div>
                    
                    </>
                )}
            </div>
        )}

        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-1">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-tight">Active Ratio</span>
                <span className="text-cyan-400 font-mono font-bold">{aspectRatio.label}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-tight">Size Constraint</span>
                <span className={cn(
                    "font-mono font-bold",
                    useSizeConstraints ? "text-white" : "text-slate-600"
                )}>
                    {useSizeConstraints ? `${minWidth}px × ${minHeight}px` : 'None'}
                </span>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all font-bold text-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Apply Changes
          </button>
        </div>
    </div>
  )
}

export default AspectRatioSelector