
import React from 'react';

interface TestimonialItemProps {
  name: string;
  testimonial: string;
}

const TestimonialItem: React.FC<TestimonialItemProps> = ({ name, testimonial }) => {
  return (
    <li className="mb-4">
      <span className="font-semibold text-white">{name}</span> {testimonial}
    </li>
  );
};

export default TestimonialItem;
