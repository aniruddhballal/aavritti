import { useDarkMode } from '../../../../contexts/DarkModeContext';

export const FilterStyles = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <style>{`
      @keyframes filterExpand {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes badgePulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .filter-expand {
        animation: filterExpand 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .filter-input {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .filter-input:hover {
        ${isDarkMode ? 'border-color: #4b5563;' : 'border-color: #cbd5e1;'}
        ${isDarkMode ? 'background-color: #374151;' : 'background-color: #fafafa;'}
      }

      .filter-input:focus {
        ${isDarkMode ? 'border-color: #10b981;' : 'border-color: #34d399;'}
        ${isDarkMode ? 'background-color: #1f2937;' : 'background-color: #ffffff;'}
        box-shadow: 0 0 0 3px rgba(16, 185, 129, ${isDarkMode ? '0.15' : '0.08'});
      }

      .filter-button {
        position: relative;
        overflow: hidden;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .filter-button:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, ${isDarkMode ? '0.25' : '0.12'});
      }

      .filter-button:not(:disabled):active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(0, 0, 0, ${isDarkMode ? '0.15' : '0.08'});
      }

      .filter-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, ${isDarkMode ? '0.15' : '0.25'}),
          transparent
        );
        transition: left 0.5s;
      }

      .filter-button:not(:disabled):hover::before {
        left: 100%;
      }

      .filter-badge {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .filter-badge:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, ${isDarkMode ? '0.35' : '0.25'});
      }

      .filter-badge:active {
        transform: translateY(0);
      }

      .icon-hover {
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .filter-button:hover .icon-hover,
      .filter-badge:hover .icon-hover {
        transform: scale(1.1);
      }

      .clear-button {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .clear-button:hover {
        background-color: #ef4444;
        transform: translateY(-1px) rotate(90deg);
        box-shadow: 0 4px 12px rgba(239, 68, 68, ${isDarkMode ? '0.35' : '0.25'});
      }

      .clear-button:active {
        transform: translateY(0) rotate(90deg);
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
    `}</style>
  );
};