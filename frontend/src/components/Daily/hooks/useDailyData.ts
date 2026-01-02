import { useState, useEffect } from 'react';
import { activityService } from '../../../services';
import type { DailyData } from '../../../types/activity';

export const useDailyData = (dateString: string) => {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await activityService.getActivities(dateString);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTotalTime = () => {
    if (!data?.activities) return '0h 0m';
    const totalMinutes = data.activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    fetchActivities();
  }, [dateString]);

  return {
    data,
    loading,
    error,
    fetchActivities,
    getTotalTime
  };
};