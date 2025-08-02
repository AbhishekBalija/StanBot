import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../../components/ChatMessage';

describe('ChatMessage Component', () => {
  it('renders user message correctly', () => {
    const userMessage = { text: 'Hello there', sender: 'user' };
    render(<ChatMessage message={userMessage} />);
    
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    // User messages should be aligned to the right
    expect(screen.getByText('Hello there').parentElement.parentElement).toHaveClass('justify-end');
  });

  it('renders bot message correctly', () => {
    const botMessage = { text: 'How can I help you?', sender: 'bot' };
    render(<ChatMessage message={botMessage} />);
    
    expect(screen.getByText('How can I help you?')).toBeInTheDocument();
    // Bot messages should be aligned to the left
    expect(screen.getByText('How can I help you?').parentElement.parentElement).toHaveClass('justify-start');
  });

  it('renders error message with correct styling', () => {
    const errorMessage = { text: 'An error occurred', sender: 'bot', error: true };
    render(<ChatMessage message={errorMessage} />);
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    // Error messages should have error styling
    expect(screen.getByText('An error occurred').parentElement).toHaveClass('bg-red-100');
    expect(screen.getByText('An error occurred').parentElement).toHaveClass('text-red-500');
  });
});