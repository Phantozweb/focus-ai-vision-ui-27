
import React from 'react';

interface TimelineItemProps {
  title: string;
  children: React.ReactNode;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ title, children }) => {
  return (
    <li className="mb-4">
      <span className="font-semibold text-white">
        {title}
      </span> {children}
    </li>
  );
};

export default TimelineItem;
