import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/components/config-provider';

export function ConfigDemo() {
  const config = useConfig();
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">ConfigProvider 演示</h2>
        <p className="text-muted-foreground">
          全局配置组件，类似 Ant Design 的 ConfigProvider
        </p>
      </div>

      <div className="grid gap-4">
        {/* 当前配置信息 */}
        <div className="p-4 border rounded-lg space-y-2">
          <h3 className="font-semibold">当前配置</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">组件大小:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded">
                {config.componentSize}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">语言:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded">
                {config.locale.locale}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">文本方向:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded">
                {config.direction}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">类名前缀:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded">
                {config.prefixCls}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">动画时长:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded">
                {config.animation?.duration}ms
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">间距大小:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded">
                {typeof config.space?.size === 'number'
                  ? config.space.size
                  : config.space?.size?.join(', ')}
              </code>
            </div>
          </div>
        </div>

        {/* 国际化演示 */}
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold">国际化 (i18n)</h3>
          <div className="flex gap-2 flex-wrap">
            <Button size={config.componentSize}>
              {config.locale.common.ok}
            </Button>
            <Button variant="secondary" size={config.componentSize}>
              {config.locale.common.cancel}
            </Button>
            <Button variant="destructive" size={config.componentSize}>
              {config.locale.common.delete}
            </Button>
            <Button variant="outline" size={config.componentSize}>
              {config.locale.common.save}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>当前语言: {config.locale.locale}</p>
            <p>表单验证: {config.locale.form.required}</p>
            <p>最小长度: {config.locale.form.minLength(5)}</p>
          </div>
        </div>

        {/* 组件大小演示 */}
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold">组件大小配置</h3>
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              size={config.componentSize}
              onClick={() => setCount((c) => c + 1)}
            >
              {config.locale.common.add} ({count})
            </Button>
            <Button variant="secondary" size={config.componentSize}>
              {config.locale.common.edit}
            </Button>
            <Button variant="outline" size={config.componentSize}>
              {config.locale.common.search}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            全局大小: {config.componentSize} (使用右上角按钮切换)
          </p>
        </div>

        {/* 主题色演示 */}
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold">主题色配置</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="default" size={config.componentSize}>
              Primary
            </Button>
            <Button variant="secondary" size={config.componentSize}>
              Secondary
            </Button>
            <Button variant="destructive" size={config.componentSize}>
              Destructive
            </Button>
            <Button variant="outline" size={config.componentSize}>
              Outline
            </Button>
            <Button variant="ghost" size={config.componentSize}>
              Ghost
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            可通过 ConfigProvider 的 themeColors 属性自定义主题色
          </p>
        </div>

        {/* 动画配置演示 */}
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold">动画配置</h3>
          <div className="flex gap-2">
            <Button
              className="transition-all hover:scale-105"
              size={config.componentSize}
            >
              Hover 动画
            </Button>
            <Button
              className="transition-all active:scale-95"
              size={config.componentSize}
            >
              Click 动画
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            动画时长: {config.animation?.duration}ms, 缓动函数:{' '}
            {config.animation?.easing}
          </p>
        </div>
      </div>
    </div>
  );
}
