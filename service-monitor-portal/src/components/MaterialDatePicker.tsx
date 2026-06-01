import React, { useRef, useState } from "react";
import { Calendar, X } from "lucide-react";
import { cn } from "../lib/utils";

interface MaterialDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export default function MaterialDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  className,
}: MaterialDatePickerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value !== "";
  const isLabelFloating = isFocused || hasValue;

  const handleContainerClick = () => {
    inputRef.current?.focus();
    // Try to trigger modern native picker
    try {
      if (inputRef.current && typeof (inputRef.current as any).showPicker === "function") {
        (inputRef.current as any).showPicker();
      }
    } catch (e) {
      console.warn("Native showPicker not supported or blocked", e);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={cn(
        "relative flex items-center bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all duration-250 select-none",
        isFocused
          ? "border-blue-600 ring-1 ring-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.08)]"
          : "border-slate-350 hover:border-slate-400",
        className
      )}
    >
      <Calendar className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />

      {/* Real Date Input */}
      <input
        ref={inputRef}
        type="date"
        min={minDate}
        max={maxDate}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer appearance-none",
          !isFocused && !hasValue && "text-transparent opacity-0"
        )}
        style={{
          // Color scheme helps matching browser elements to system colors
          colorScheme: "light",
        }}
      />

      {/* Floating Label */}
      <span
        className={cn(
          "absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 origin-left text-sm select-none",
          isLabelFloating
            ? "top-0 -translate-y-1/2 left-3 bg-white px-1.5 text-xs font-semibold text-blue-600"
            : "text-slate-500"
        )}
      >
        {label}
      </span>

      {/* Clear Button */}
      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          className="ml-2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
