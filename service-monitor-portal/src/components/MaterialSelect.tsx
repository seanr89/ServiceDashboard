import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MaterialSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function MaterialSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
  className,
}: MaterialSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = value !== "";
  const isLabelFloating = isFocused || isOpen || hasValue;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full min-w-[140px]", className)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // Only blur if focus goes outside the entire component container
        if (!containerRef.current?.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      {/* Input container */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 bg-white border rounded-xl text-left text-sm font-medium transition-all outline-none duration-250 cursor-pointer",
          isFocused || isOpen
            ? "border-blue-600 ring-1 ring-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.08)]"
            : "border-slate-350 hover:border-slate-400"
        )}
      >
        <span className={cn("truncate", !hasValue && "text-transparent")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-250 ml-2 flex-shrink-0",
            isOpen && "transform rotate-180 text-blue-600"
          )}
        />
      </button>

      {/* Floating Label */}
      <span
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 origin-left text-sm select-none",
          isLabelFloating
            ? "top-0 -translate-y-1/2 left-3 bg-white px-1.5 text-xs font-semibold text-blue-600"
            : "text-slate-500"
        )}
      >
        {label}
      </span>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-1.5 outline-none"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setIsFocused(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 mx-1 rounded-xl text-sm cursor-pointer select-none transition-all duration-150",
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
