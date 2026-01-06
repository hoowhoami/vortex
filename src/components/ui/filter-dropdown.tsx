"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string; // 筛选器标签，如 "类型"、"地区"
  options: FilterOption[]; // 选项列表
  value: string; // 当前选中的值
  onChange: (value: string) => void; // 值变化回调
  placeholder?: string; // 未选择时显示的占位文字
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
}: FilterDropdownProps) {
  // 找到当前选中项的显示文字
  const selectedLabel = React.useMemo(() => {
    const selected = options.find((opt) => opt.value === value);
    return selected?.label || placeholder || label;
  }, [options, value, placeholder, label]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[100px]">
            <span className="flex-1 text-left truncate">{selectedLabel}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto min-w-[120px]">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={value === option.value ? "bg-accent" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
