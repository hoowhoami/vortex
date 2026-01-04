import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useAppStore } from '@/store/appStore';
import { TaskService } from '@/services/taskService';
import { aria2 } from '@/api/aria2';

export function useTaskPolling() {
  const { activeTasks } = useTaskStore();
  const { pollingInterval, setPollingInterval, setGlobalStat } = useAppStore();
  const timerRef = useRef<number>();

  useEffect(() => {
    const poll = async () => {
      try {
        await Promise.all([
          TaskService.fetchTasks(),
          aria2.getGlobalStat().then(setGlobalStat),
        ]);

        const numActive = activeTasks.length;
        const newInterval = numActive > 0
          ? Math.max(500, 1000 - numActive * 100)
          : Math.min(6000, pollingInterval + 500);

        if (newInterval !== pollingInterval) {
          setPollingInterval(newInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll();
    timerRef.current = window.setInterval(poll, pollingInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [pollingInterval, activeTasks.length]);
}
