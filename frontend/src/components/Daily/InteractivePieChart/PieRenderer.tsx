import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import type { ChartData, DrillLevel } from './interactivePieChart.utils';

interface PieRendererProps {
  data: ChartData[];
  drillLevel: DrillLevel;
  selectedIndex: number | null;
  activeIndex: number | null;
  isDarkMode: boolean;
  onPieClick: (entry: any, index: number, event: any) => void;
  onTouchStart: (entry: ChartData) => void;
  onTouchEnd: (entry: ChartData) => void;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}

const renderLabel = (props: any) => {
  const { percent, value } = props;
  if (percent < 0.05) return null;
  const totalMinutes = value;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ 
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </g>
  );
};

export const PieRenderer = ({
  data,
  drillLevel,
  selectedIndex,
  activeIndex,
  isDarkMode,
  onPieClick,
  onTouchStart,
  onTouchEnd,
  onMouseEnter,
  onMouseLeave,
}: PieRendererProps) => {
  return (
    <div className="relative w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            label={renderLabel}
            labelLine={false}
            outerRadius={115}
            fill="#8884d8"
            dataKey="value"
            onClick={(entry, index, event) => onPieClick(entry, index, event)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseEnter={(_, index) => {
              if (selectedIndex !== index) {
                onMouseEnter(index);
              }
            }}
            onMouseLeave={onMouseLeave}
            {...(selectedIndex !== null ? { activeIndex: selectedIndex, activeShape: renderActiveShape } : activeIndex !== null ? { activeIndex: activeIndex, activeShape: renderActiveShape } : {})}
            style={{ cursor: drillLevel === 'activity' ? 'default' : 'pointer', fontSize: '13.5px' }}
            animationBegin={0}
            animationDuration={500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{ 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: selectedIndex === index || activeIndex === index 
                    ? 'brightness(1.1)' 
                    : 'brightness(1)'
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => {
              const totalMinutes = value;
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              return `${hours}h ${minutes}m`;
            }}
            contentStyle={{
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.8)' : '1px solid rgba(229, 231, 235, 0.8)',
              borderRadius: '12px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              fontSize: '13px',
              fontWeight: '500',
              color: isDarkMode ? '#e5e7eb' : '#374151'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};