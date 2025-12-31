import { useDarkMode } from '../../../../../contexts/DarkModeContext';

export const ModalStyles = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <style>{`
      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: scale(0.96);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .modal-content {
        animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .input-field {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .input-field:hover {
        ${isDarkMode ? 'border-color: #4b5563;' : 'border-color: #cbd5e1;'}
        ${isDarkMode ? 'background-color: #374151;' : 'background-color: #fafafa;'}
      }

      .input-field:focus {
        ${isDarkMode ? 'border-color: #60a5fa;' : 'border-color: #93c5fd;'}
        ${isDarkMode ? 'background-color: #1f2937;' : 'background-color: #ffffff;'}
        box-shadow: 0 0 0 3px rgba(59, 130, 246, ${isDarkMode ? '0.15' : '0.08'});
      }

      .btn-primary {
        position: relative;
        overflow: hidden;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-primary:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(34, 197, 94, ${isDarkMode ? '0.35' : '0.25'});
      }

      .btn-primary:not(:disabled):active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(34, 197, 94, ${isDarkMode ? '0.25' : '0.2'});
      }

      .btn-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, ${isDarkMode ? '0.2' : '0.3'}),
          transparent
        );
        transition: left 0.5s;
      }

      .btn-primary:not(:disabled):hover::before {
        left: 100%;
      }

      .btn-secondary {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-secondary:hover {
        ${isDarkMode ? 'background-color: #374151;' : 'background-color: #f8fafc;'}
        ${isDarkMode ? 'border-color: #6b7280;' : 'border-color: #94a3b8;'}
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, ${isDarkMode ? '0.15' : '0.06'});
      }

      .btn-secondary:active {
        transform: translateY(0);
      }

      .icon-hover {
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-primary:not(:disabled):hover .icon-hover {
        transform: scale(1.1);
      }

      .close-btn {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .close-btn:hover {
        ${isDarkMode ? 'background-color: #374151;' : 'background-color: #f1f5f9;'}
        transform: rotate(90deg);
      }

      .close-btn:active {
        ${isDarkMode ? 'background-color: #4b5563;' : 'background-color: #e2e8f0;'}
      }

      .select-wrapper {
        position: relative;
      }

      .select-wrapper::after {
        content: '';
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid ${isDarkMode ? '#9ca3af' : '#64748b'};
        pointer-events: none;
        transition: transform 0.2s ease;
      }

      .select-wrapper:hover::after {
        border-top-color: ${isDarkMode ? '#d1d5db' : '#475569'};
      }

      select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
      }

      .error-alert {
        animation: modalFadeIn 0.2s ease-out;
      }

      .mode-btn {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .mode-btn:not(.active):hover {
        ${isDarkMode ? 'background-color: #4b5563;' : 'background-color: #e2e8f0;'}
        transform: translateY(-1px);
      }

      .mode-btn.active {
        box-shadow: 0 2px 8px rgba(34, 197, 94, ${isDarkMode ? '0.3' : '0.2'});
      }
    `}</style>
  );
};