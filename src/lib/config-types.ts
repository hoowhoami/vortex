export type ComponentSize = 'sm' | 'default' | 'lg';

export type ThemeColors = {
  primary?: string;
  secondary?: string;
  destructive?: string;
  accent?: string;
  border?: string;
  background?: string;
  foreground?: string;
};

export type Locale = {
  locale: string;
  common: {
    ok: string;
    cancel: string;
    confirm: string;
    delete: string;
    save: string;
    close: string;
    loading: string;
    search: string;
    reset: string;
    submit: string;
    edit: string;
    add: string;
  };
  button: {
    default: string;
    primary: string;
    secondary: string;
    danger: string;
  };
  form: {
    required: string;
    invalidEmail: string;
    invalidUrl: string;
    minLength: (min: number) => string;
    maxLength: (max: number) => string;
  };
  table: {
    emptyText: string;
    filterTitle: string;
    filterConfirm: string;
    filterReset: string;
  };
};

export const zhCN: Locale = {
  locale: 'zh-CN',
  common: {
    ok: '确定',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    save: '保存',
    close: '关闭',
    loading: '加载中...',
    search: '搜索',
    reset: '重置',
    submit: '提交',
    edit: '编辑',
    add: '添加',
  },
  button: {
    default: '默认',
    primary: '主要',
    secondary: '次要',
    danger: '危险',
  },
  form: {
    required: '此字段为必填项',
    invalidEmail: '请输入有效的邮箱地址',
    invalidUrl: '请输入有效的 URL',
    minLength: (min: number) => `最少输入 ${min} 个字符`,
    maxLength: (max: number) => `最多输入 ${max} 个字符`,
  },
  table: {
    emptyText: '暂无数据',
    filterTitle: '筛选',
    filterConfirm: '确定',
    filterReset: '重置',
  },
};

export const enUS: Locale = {
  locale: 'en-US',
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    save: 'Save',
    close: 'Close',
    loading: 'Loading...',
    search: 'Search',
    reset: 'Reset',
    submit: 'Submit',
    edit: 'Edit',
    add: 'Add',
  },
  button: {
    default: 'Default',
    primary: 'Primary',
    secondary: 'Secondary',
    danger: 'Danger',
  },
  form: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidUrl: 'Please enter a valid URL',
    minLength: (min: number) => `Minimum ${min} characters`,
    maxLength: (max: number) => `Maximum ${max} characters`,
  },
  table: {
    emptyText: 'No data',
    filterTitle: 'Filter',
    filterConfirm: 'OK',
    filterReset: 'Reset',
  },
};

export type AnimationConfig = {
  duration?: number; // 动画持续时间（ms）
  easing?: string; // 动画缓动函数
  disabled?: boolean; // 禁用动画
};

export type SpaceConfig = {
  size?: number | [number, number]; // 间距大小
};

export type ConfigProviderProps = {
  componentSize?: ComponentSize;
  locale?: Locale;
  themeColors?: ThemeColors;
  animation?: AnimationConfig;
  space?: SpaceConfig;
  prefixCls?: string; // CSS 类名前缀
  direction?: 'ltr' | 'rtl'; // 文本方向
  children: React.ReactNode;
};
