import { createContext, useContext, useEffect } from 'react';
import type {
  ComponentSize,
  Locale,
  ThemeColors,
  AnimationConfig,
  SpaceConfig,
  ConfigProviderProps,
} from '@/lib/config-types';
import { enUS } from '@/lib/config-types';

type ConfigContextType = {
  componentSize: ComponentSize;
  locale: Locale;
  themeColors?: ThemeColors;
  animation?: AnimationConfig;
  space?: SpaceConfig;
  prefixCls: string;
  direction: 'ltr' | 'rtl';
};

const defaultConfig: ConfigContextType = {
  componentSize: 'default',
  locale: enUS,
  prefixCls: 'vortex',
  direction: 'ltr',
  animation: {
    duration: 200,
    easing: 'ease-in-out',
    disabled: false,
  },
  space: {
    size: 8,
  },
};

const ConfigContext = createContext<ConfigContextType>(defaultConfig);

export function ConfigProvider({
  componentSize = 'default',
  locale = enUS,
  themeColors,
  animation = defaultConfig.animation,
  space = defaultConfig.space,
  prefixCls = 'vortex',
  direction = 'ltr',
  children,
}: ConfigProviderProps) {
  // 应用主题色到 CSS 变量
  useEffect(() => {
    if (themeColors) {
      const root = document.documentElement;

      if (themeColors.primary) {
        root.style.setProperty('--color-primary', themeColors.primary);
      }
      if (themeColors.secondary) {
        root.style.setProperty('--color-secondary', themeColors.secondary);
      }
      if (themeColors.destructive) {
        root.style.setProperty('--color-destructive', themeColors.destructive);
      }
      if (themeColors.accent) {
        root.style.setProperty('--color-accent', themeColors.accent);
      }
      if (themeColors.border) {
        root.style.setProperty('--color-border', themeColors.border);
      }
      if (themeColors.background) {
        root.style.setProperty('--color-background', themeColors.background);
      }
      if (themeColors.foreground) {
        root.style.setProperty('--color-foreground', themeColors.foreground);
      }
    }
  }, [themeColors]);

  // 应用动画配置
  useEffect(() => {
    if (animation) {
      const root = document.documentElement;

      if (animation.duration !== undefined) {
        root.style.setProperty(
          '--animation-duration',
          `${animation.duration}ms`
        );
      }
      if (animation.easing) {
        root.style.setProperty('--animation-easing', animation.easing);
      }
      if (animation.disabled) {
        root.style.setProperty('--animation-duration', '0ms');
      }
    }
  }, [animation]);

  // 应用文本方向
  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  const value = {
    componentSize,
    locale,
    themeColors,
    animation,
    space,
    prefixCls,
    direction,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
