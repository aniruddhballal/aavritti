import { useState, useEffect } from 'react';
import { activityService } from '../../../../../services';
import type { Category, ActivityFormData, DurationMode } from '../types';

interface UseAddActivityFormProps {
  isOpen: boolean;
  categories: Category[];
  onActivityAdded: () => void;
  onClose: () => void;
}

export const useAddActivityForm = ({
  isOpen,
  categories,
  onActivityAdded,
  onClose,
}: UseAddActivityFormProps) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    category: '',
    subcategory: '',
    title: '',
    duration: '',
    startTime: '',
    endTime: '',
    description: ''
  });
  const [durationMode, setDurationMode] = useState<DurationMode>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Get today's date in IST timezone (YYYY-MM-DD)
  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const today = getTodayIST();

  // Calculate duration from start/end times
  useEffect(() => {
    if (durationMode === 'calculated' && formData.startTime && formData.endTime) {
      const start = new Date(`${today}T${formData.startTime}`);
      const end = new Date(`${today}T${formData.endTime}`);
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      
      if (diffMinutes > 0) {
        setFormData(prev => ({ ...prev, duration: diffMinutes.toString() }));
      }
    }
  }, [formData.startTime, formData.endTime, durationMode, today]);

  // Update subcategories when category changes
  useEffect(() => {
    const selectedCategory = categories.find(cat => cat.value === formData.category);
    if (selectedCategory?.subcategories) {
      setSubcategories(selectedCategory.subcategories);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category, categories]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        category: '',
        subcategory: '',
        title: '',
        duration: '',
        startTime: '',
        endTime: '',
        description: ''
      });
      setDurationMode('manual');
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDurationModeChange = (mode: DurationMode) => {
    setDurationMode(mode);
    setFormData(prev => ({
      ...prev,
      duration: '',
      startTime: '',
      endTime: ''
    }));
  };

  const handleSubmit = async () => {
    setError('');

    // Convert duration from HH:MM to minutes
    let durationInMinutes = 0;
    
    if (durationMode === 'manual') {
      const timeParts = formData.duration.split(':');
      if (timeParts.length !== 2) {
        setError('Please enter duration in HH:MM format');
        return;
      }
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      durationInMinutes = hours * 60 + minutes;
    } else {
      durationInMinutes = parseInt(formData.duration);
    }

    if (!durationInMinutes || durationInMinutes <= 0) {
      setError('Please provide a valid duration');
      return;
    }

    setIsSubmitting(true);

    try {
      const activityData = {
        date: today,
        category: formData.category,
        title: formData.title,
        duration: durationInMinutes,
        description: formData.description,
        ...(formData.subcategory && { subcategory: formData.subcategory }),
        ...(formData.startTime && { startTime: formData.startTime }),
        ...(formData.endTime && { endTime: formData.endTime })
      };

      await activityService.createActivity(activityData); 

      onActivityAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    durationMode,
    isSubmitting,
    error,
    subcategories,
    handleChange,
    handleDurationModeChange,
    handleSubmit,
  };
};