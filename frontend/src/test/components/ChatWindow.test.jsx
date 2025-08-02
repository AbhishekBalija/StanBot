import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatWindow from '../../components/ChatWindow';

// Mock scrollIntoView
beforeEach(() => {
  // Mock scrollIntoView method
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock the ChatMessage component to simplify testing
vi.mock('../../components/ChatMessage', () => ({
  default: ({ message }) => <div data-testid="chat-message">{message.text}</div>
}));

describe('ChatWindow Component', () => {
  it('displays welcome message when no messages are present', () => {
    render(<ChatWindow messages={[]} isLoading={false} />);
    
    expect(screen.getByText('Welcome to STAN!')).toBeInTheDocument();
    expect(screen.getByText('How can I assist you today?')).toBeInTheDocument();
  });

  it('renders messages when they exist', () => {
    const messages = [
      { text: 'Hello', sender: 'user' },
      { text: 'How can I help you?', sender: 'bot' }
    ];
    
    render(<ChatWindow messages={messages} isLoading={false} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('How can I help you?')).toBeInTheDocument();
    expect(screen.queryByText('Welcome to STAN!')).not.toBeInTheDocument();
  });

  it('renders the correct number of messages', () => {
    const messages = [
      { text: 'Message 1', sender: 'user' },
      { text: 'Message 2', sender: 'bot' },
      { text: 'Message 3', sender: 'user' }
    ];
    
    render(<ChatWindow messages={messages} isLoading={false} />);
    
    const messageElements = screen.getAllByTestId('chat-message');
    expect(messageElements.length).toBe(3);
  });

  it('renders messages in the correct order', () => {
    const messages = [
      { text: 'First message', sender: 'user' },
      { text: 'Second message', sender: 'bot' },
      { text: 'Third message', sender: 'user' }
    ];
    
    render(<ChatWindow messages={messages} isLoading={false} />);
    
    const messageElements = screen.getAllByTestId('chat-message');
    expect(messageElements[0].textContent).toBe('First message');
    expect(messageElements[1].textContent).toBe('Second message');
    expect(messageElements[2].textContent).toBe('Third message');
  });
});