import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LikeButton } from './LikeButton';

const mockLikeApi = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn()
};

vi.mock('@/lib/api', () => ({
  default: mockLikeApi
}));

describe('LikeButton Component', () => {
  const testMovieId = '550';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render like button', () => {
    mockLikeApi.get.mockResolvedValueOnce({ liked: false });

    render(<LikeButton movieId={testMovieId} />);

    const button = screen.getByRole('button', { name: /like|favorite|heart/i });
    expect(button).toBeInTheDocument();
  });

  it('should show unliked state initially', async () => {
    mockLikeApi.get.mockResolvedValueOnce({ liked: false });

    render(<LikeButton movieId={testMovieId} />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('liked');
    });
  });

  it('should show liked state when movie is liked', async () => {
    mockLikeApi.get.mockResolvedValueOnce({ liked: true });

    render(<LikeButton movieId={testMovieId} />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('liked');
    });
  });

  it('should toggle like on click', async () => {
    mockLikeApi.get.mockResolvedValueOnce({ liked: false });
    mockLikeApi.post.mockResolvedValueOnce({ liked: true });

    render(<LikeButton movieId={testMovieId} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLikeApi.post).toHaveBeenCalledWith('/likes', {
        tmdbMovieId: testMovieId
      });
    });
  });

  it('should unlike on second click', async () => {
    mockLikeApi.get.mockResolvedValueOnce({ liked: true });
    mockLikeApi.delete.mockResolvedValueOnce({ liked: false });

    render(<LikeButton movieId={testMovieId} />);

    await waitFor(() => {
      expect(mockLikeApi.get).toHaveBeenCalled();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLikeApi.delete).toHaveBeenCalledWith(
        `/likes?movieId=${testMovieId}`
      );
    });
  });

  it('should show optimistic UI update', async () => {
    mockLikeApi.get.mockResolvedValueOnce({ liked: false });
    mockLikeApi.post.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ liked: true }), 100))
    );

    render(<LikeButton movieId={testMovieId} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // UI should update immediately
    expect(button).toHaveClass('liked');
  });

  it('should handle API errors', async () => {
    mockLikeApi.get.mockResolvedValueOnce({ liked: false });
    mockLikeApi.post.mockRejectedValueOnce(new Error('Network error'));

    render(<LikeButton movieId={testMovieId} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      // Should revert optimistic update on error
      expect(button).not.toHaveClass('liked');
    });
  });

  it('should be idempotent', async () => {
    mockLikeApi.get.mockResolvedValueOnce({ liked: false });
    mockLikeApi.post.mockResolvedValueOnce({ liked: true });

    const { rerender } = render(<LikeButton movieId={testMovieId} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLikeApi.post).toHaveBeenCalled();
    });

    // Mock the next check
    mockLikeApi.get.mockResolvedValueOnce({ liked: true });

    // Click again
    fireEvent.click(button);

    // Should still work
    expect(button).toHaveClass('liked');
  });
});
