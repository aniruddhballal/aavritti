import { useState, useEffect } from 'react';
import { activityService } from '../../../services';
import type { Activity } from '../../../types/activity';

interface EditForm {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  duration: number;
  startTime: string;
  endTime: string;
}

export const useActivityEdit = (
  dateString: string,
  onEditComplete: () => void,
  onError: (error: string) => void
) => {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    duration: 0,
    startTime: '',
    endTime: ''
  });
  const [validationError, setValidationError] = useState<string>('');
  const [editSubcategories, setEditSubcategories] = useState<string[]>([]);

  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Auto-calculate duration when start or end time changes
  useEffect(() => {
    if (editForm.startTime && editForm.endTime) {
      const today = getTodayIST();
      const start = new Date(`${today}T${editForm.startTime}`);
      const end = new Date(`${today}T${editForm.endTime}`);
      const calculatedMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      
      if (calculatedMinutes > 0) {
        setEditForm(prev => ({ ...prev, duration: calculatedMinutes }));
        setValidationError('');
      } else {
        setValidationError('End time must be after start time');
      }
    }
  }, [editForm.startTime, editForm.endTime]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!editForm.category) {
        setEditSubcategories([]);
        return;
      }

      try {
        const subs = await activityService.getSubcategorySuggestions(editForm.category, '');
        setEditSubcategories(subs);
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
        setEditSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [editForm.category]);

  const handleEditClick = async (activity: Activity) => {
    setEditingActivity(activity);
    
    setEditForm({
      title: activity.title || '',
      description: activity.description || '',
      category: activity.category,
      subcategory: activity.subcategory || '',
      duration: activity.duration || 0,
      startTime: activity.startTime || '',
      endTime: activity.endTime || ''
    });
    setValidationError('');

    // Fetch subcategories for the activity's category
    if (activity.category) {
      try {
        const subs = await activityService.getSubcategorySuggestions(activity.category, '');
        setEditSubcategories(subs);
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
        setEditSubcategories([]);
      }
    }
  };

  const handleEditChange = (field: string, value: any) => {
    const updatedForm = { ...editForm, [field]: value };
    
    // Clear subcategory when category changes
    if (field === 'category') {
      updatedForm.subcategory = '';
    }
    
    setEditForm(updatedForm);
  };

  const handleSaveEdit = async () => {
    if (!editingActivity) return;

    // Validate before saving
    if (editForm.duration <= 0) {
      setValidationError('Please provide valid start and end times');
      return;
    }

    try {
      await activityService.updateActivity(editingActivity._id, {
        ...editForm,
        date: dateString,
        subcategory: editForm.subcategory || undefined
      });

      setEditingActivity(null);
      await onEditComplete();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to update activity');
    }
  };

  const handleDeleteActivity = async () => {
    if (!editingActivity) return;
    
    if (!window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }

    try {
      await activityService.deleteActivity(editingActivity._id);
      setEditingActivity(null);
      await onEditComplete();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to delete activity');
    }
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setEditForm({
      title: '',
      description: '',
      category: '',
      subcategory: '',
      duration: 0,
      startTime: '',
      endTime: ''
    });
    setEditSubcategories([]);
    setValidationError('');
  };

  return {
    editingActivity,
    editForm,
    validationError,
    editSubcategories,
    handleEditClick,
    handleEditChange,
    handleSaveEdit,
    handleDeleteActivity,
    handleCancelEdit
  };
};