// (Edit form logic & validation)
// a custom hook that manages all the activity editing logic including form state, validation, save/delete/cancel handlers, and subcategory management.

import { useState } from 'react';
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
  categories: Array<{value: string; label: string; subcategories?: string[]}>,
  CATEGORIES: string[],
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

  const validateDuration = (form: EditForm): string => {
    if (form.startTime && form.endTime) {
      const today = getTodayIST();
      const start = new Date(`${today}T${form.startTime}`);
      const end = new Date(`${today}T${form.endTime}`);
      const calculatedMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      
      if (calculatedMinutes <= 0) {
        return 'End time must be after start time';
      }
      
      if (calculatedMinutes !== form.duration) {
        return `Duration mismatch: Start/End times = ${calculatedMinutes} mins, but Duration field = ${form.duration} mins. Please fix one of them.`;
      }
    }
    return '';
  };

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
    const category = activity.category || CATEGORIES[0];
    const selectedCategory = categories.find(cat => cat.value === category);
    
    setEditForm({
      title: activity.title || '',
      description: activity.description || '',
      category: category,
      subcategory: activity.subcategory || '',
      duration: activity.duration || 0,
      startTime: activity.startTime || '',
      endTime: activity.endTime || ''
    });
    setEditSubcategories(selectedCategory?.subcategories || []);
    setValidationError('');
  };

  const handleEditChange = (field: string, value: any) => {
    const updatedForm = { ...editForm, [field]: value };
    
    // Update subcategories when category changes
    if (field === 'category') {
      const selectedCategory = categories.find(cat => cat.value === value);
      setEditSubcategories(selectedCategory?.subcategories || []);
      updatedForm.subcategory = ''; // Clear subcategory when category changes
    }
    
    setEditForm(updatedForm);
    
    const error = validateDuration(updatedForm);
    setValidationError(error);
  };

  const handleSaveEdit = async () => {
    if (!editingActivity) return;

    try {
      await activityService.updateActivity(editingActivity._id, {
        ...editForm,
        date: dateString,
        subcategory: editForm.subcategory || undefined // Convert empty string to undefined
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