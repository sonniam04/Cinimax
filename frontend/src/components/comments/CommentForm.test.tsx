import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from './CommentForm';

const mockCommentApi = {
  post: vi.fn()
};

vi.mock('@/lib/api', () => ({
  default: mockCommentApi
}));

describe('CommentForm Component', () => {
  const testMovieId = '550';
  const onCommentAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render comment form', () => {
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const textarea = screen.getByPlaceholderText(/comment|write/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should have submit button', () => {
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const button = screen.getByRole('button', { name: /submit|post|send/i });
    expect(button).toBeInTheDocument();
  });

  it('should disable submit when textarea is empty', () => {
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const button = screen.getByRole('button', { name: /submit|post|send/i });
    expect(button).toBeDisabled();
  });

  it('should enable submit when text is entered', async () => {
    const user = userEvent.setup();
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const textarea = screen.getByPlaceholderText(/comment|write/i);
    await user.type(textarea, 'Great movie!');

    const button = screen.getByRole('button', { name: /submit|post|send/i });
    expect(button).not.toBeDisabled();
  });

  it('should submit comment', async () => {
    mockCommentApi.post.mockResolvedValueOnce({
      comment: {
        id: '123',
        body: 'Great movie!',
        user: { id: 'user1', name: 'Test User' }
      }
    });

    const user = userEvent.setup();
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const textarea = screen.getByPlaceholderText(/comment|write/i);
    await user.type(textarea, 'Great movie!');

    const button = screen.getByRole('button', { name: /submit|post|send/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCommentApi.post).toHaveBeenCalledWith('/comments', {
        tmdbMovieId: testMovieId,
        body: 'Great movie!'
      });
    });
  });

  it('should clear textarea after submission', async () => {
    mockCommentApi.post.mockResolvedValueOnce({
      comment: { id: '123', body: 'Great movie!' }
    });

    const user = userEvent.setup();
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const textarea = screen.getByPlaceholderText(/comment|write/i) as HTMLTextAreaElement;
    await user.type(textarea, 'Great movie!');

    const button = screen.getByRole('button', { name: /submit|post|send/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('should call onCommentAdded callback', async () => {
    const newComment = {
      id: '123',
      body: 'Great movie!',
      user: { id: 'user1', name: 'Test User', image: null }
    };

    mockCommentApi.post.mockResolvedValueOnce({ comment: newComment });

    const user = userEvent.setup();
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const textarea = screen.getByPlaceholderText(/comment|write/i);
    await user.type(textarea, 'Great movie!');

    const button = screen.getByRole('button', { name: /submit|post|send/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onCommentAdded).toHaveBeenCalledWith(newComment);
    });
  });

  it('should handle API errors', async () => {
    mockCommentApi.post.mockRejectedValueOnce(new Error('Network error'));

    const user = userEvent.setup();
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const textarea = screen.getByPlaceholderText(/comment|write/i);
    await user.type(textarea, 'Great movie!');

    const button = screen.getByRole('button', { name: /submit|post|send/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });

  it('should not accept empty or whitespace-only comments', async () => {
    const user = userEvent.setup();
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const textarea = screen.getByPlaceholderText(/comment|write/i);
    await user.type(textarea, '   ');

    const button = screen.getByRole('button', { name: /submit|post|send/i });
    expect(button).toBeDisabled();
  });

  it('should show character count', async () => {
    const user = userEvent.setup();
    render(
      <CommentForm movieId={testMovieId} onCommentAdded={onCommentAdded} />
    );

    const textarea = screen.getByPlaceholderText(/comment|write/i);
    await user.type(textarea, 'Hello');

    const charCount = screen.getByText(/5|characters/i);
    expect(charCount).toBeInTheDocument();
  });
});
