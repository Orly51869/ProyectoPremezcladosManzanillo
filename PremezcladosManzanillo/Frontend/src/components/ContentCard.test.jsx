import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import ContentCard from './ContentCard';

describe('ContentCard Component', () => {
  it('should render the title and description content', () => {
    render(
      <ContentCard 
        title="Card Title" 
        description="This is a test description" 
        imgSrc="test-image.jpg"
      />
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('should apply the correct style classes', () => {
    const { container } = render(
      <ContentCard title="Test" description="Test" imgSrc="test.jpg" />
    );
    
    const cardDiv = container.firstChild;
    expect(cardDiv).toHaveClass('bg-white');
    expect(cardDiv).toHaveClass('rounded-xl');
  });
});
