import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '../../components/ChatInput';

describe('ChatInput Component', () => {
  it('renders input field and send button', () => {
    render(<ChatInput onSendMessage={() => {}} isLoading={false} />);
    
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={() => {}} isLoading={false} />);
    
    const inputElement = screen.getByPlaceholderText('Type a message...');
    await user.type(inputElement, 'Hello world');
    
    expect(inputElement.value).toBe('Hello world');
  });

  it('calls onSendMessage when form is submitted', async () => {
    const mockSendMessage = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    
    const inputElement = screen.getByPlaceholderText('Type a message...');
    await user.type(inputElement, 'Test message');
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    expect(inputElement.value).toBe(''); // Input should be cleared after sending
  });

  it('disables input and button when isLoading is true', () => {
    render(<ChatInput onSendMessage={() => {}} isLoading={true} />);
    
    const inputElement = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    expect(inputElement).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('does not call onSendMessage when form is submitted with empty input', async () => {
    const mockSendMessage = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});