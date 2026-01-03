// UI Constants - Centralized size configuration for consistent UI elements
export const UI_SIZES = {
  // Input and Select heights
  input: {
    height: 'h-7',
    text: 'text-sm',
    className: 'h-7 text-sm', // Combined className
  },

  // Button sizes
  button: {
    height: 'h-7',
    width: 'w-7',
    padding: 'p-0',
    size: 'sm' as const,
    className: 'h-7', // For buttons with text
    iconClassName: 'h-7 w-7 p-0', // For icon-only buttons
  },

  // Icon sizes
  icon: {
    small: 14,
    medium: 16,
    large: 20,
  },

  // Select widths
  select: {
    narrow: 'w-[100px]',
    medium: 'w-[120px]',
    wide: 'w-[160px]',
    narrowClassName: 'h-7 w-[100px] text-sm', // Combined
    mediumClassName: 'h-7 w-[120px] text-sm', // Combined
    wideClassName: 'h-7 w-[160px] text-sm', // Combined
  },
} as const;
