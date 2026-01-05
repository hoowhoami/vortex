"use client";

import * as React from "react";
import { cn } from "@/lib/utils/utils";
import { AlertCircle } from "lucide-react";

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  validationRules?: ValidationRule[];
  showErrorIcon?: boolean;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      validationRules,
      showErrorIcon = true,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalError, setInternalError] = React.useState<string>("");
    const [touched, setTouched] = React.useState(false);

    const displayError = error || (touched ? internalError : "");

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);

      // Run validation rules
      if (validationRules && validationRules.length > 0) {
        const value = e.target.value;
        for (const rule of validationRules) {
          if (!rule.validate(value)) {
            setInternalError(rule.message);
            onBlur?.(e);
            return;
          }
        }
        setInternalError("");
      }

      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Clear error on change if field was touched
      if (touched && internalError) {
        const value = e.target.value;
        // Re-validate on change
        if (validationRules && validationRules.length > 0) {
          for (const rule of validationRules) {
            if (!rule.validate(value)) {
              setInternalError(rule.message);
              onChange?.(e);
              return;
            }
          }
          setInternalError("");
        }
      }

      onChange?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              displayError &&
                "border-red-500 focus-visible:ring-red-500 pr-10",
              className
            )}
            ref={ref}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={!!displayError}
            aria-describedby={
              displayError
                ? `${props.id}-error`
                : helperText
                ? `${props.id}-helper`
                : undefined
            }
            {...props}
          />
          {displayError && showErrorIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {displayError && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in-50 slide-in-from-top-1"
          >
            {displayError}
          </p>
        )}
        {!displayError && helperText && (
          <p
            id={`${props.id}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };

// Common validation rules
export const validationRules = {
  required: (message = "此字段为必填项"): ValidationRule => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    validate: (value) => value.length >= length,
    message: message || `最少需要 ${length} 个字符`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    validate: (value) => value.length <= length,
    message: message || `最多 ${length} 个字符`,
  }),

  email: (message = "请输入有效的邮箱地址"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Allow empty, use required rule separately
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Allow empty, use required rule separately
      return regex.test(value);
    },
    message,
  }),

  custom: (
    validate: (value: string) => boolean,
    message: string
  ): ValidationRule => ({
    validate,
    message,
  }),
};
