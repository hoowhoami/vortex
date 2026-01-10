import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfigProvider } from '@/components/config-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ConfigDemo } from '@/components/config-demo';
import {
  zhCN,
  enUS,
  type ComponentSize,
  type Locale,
} from '@/lib/config-types';

function App() {
  const [componentSize, setComponentSize] = useState<ComponentSize>('default');
  const [locale, setLocale] = useState<Locale>(zhCN);

  const cycleSize = () => {
    setComponentSize((prev) => {
      if (prev === 'sm') return 'default';
      if (prev === 'default') return 'lg';
      return 'sm';
    });
  };

  const toggleLocale = () => {
    setLocale((prev) => (prev.locale === 'zh-CN' ? enUS : zhCN));
  };

  return (
    <ConfigProvider
      componentSize={componentSize}
      locale={locale}
      animation={{ duration: 200, easing: 'ease-in-out' }}
      space={{ size: 8 }}
      direction="ltr"
    >
      <ThemeProvider defaultTheme="system" storageKey="vortex-ui-theme">
        <div className="min-h-screen bg-background text-foreground">
          <div className="absolute top-4 right-4 flex gap-2">
            <Button onClick={cycleSize} variant="outline" size="sm">
              大小: {componentSize}
            </Button>
            <Button onClick={toggleLocale} variant="outline" size="sm">
              {locale.locale === 'zh-CN' ? '中文' : 'English'}
            </Button>
            <ThemeToggle />
          </div>
          <ConfigDemo />
        </div>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
