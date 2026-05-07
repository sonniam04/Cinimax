import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RatingWidget } from './RatingWidget';

// Mock the API
const mockRatingApi = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn()
};

vi.mock('@/lib/api', () => ({
  default: mockRatingApi
}));

describe('RatingWidget Component', () => {
  const testMovieId = '550';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render rating widget with stars', () => {
    render(<RatingWidget movieId={testMovieId} />);
    
    const stars = screen.getAllByRole('button', { name: /star/i });
    expect(stars.length).toBeGreaterThan(0);
  });

  it('should display current rating', async () => {
    mockRatingApi.get.mockResolvedValueOnce({ rating: 7 });

    render(<RatingWidget movieId={testMovieId} />);

    await waitFor(() => {
      expect(mockRatingApi.get).toHaveBeenCalledWith(
        `/ratings?movieId=${testMovieId}`
      );
    });
  });

  it('should submit new rating on click', async () => {
    mockRatingApi.post.mockResolvedValueOnce({ rating: 8 });

    render(<RatingWidget movieId={testMovieId} />);

    const star8Button = screen.getByRole('button', { name: /8/ });
    fireEvent.click(star8Button);

    await waitFor(() => {
      expect(mockRatingApi.post).toHaveBeenCalledWith('/ratings', {
        tmdbMovieId: testMovieId,
        score: 8
      });
    });
  });

  it('should update rating when clicking different star', async () => {
    mockRatingApi.get.mockResolvedValueOnce({ rating: 5 });
    mockRatingApi.post.mockResolvedValueOnce({ rating: 9 });

    const { rerender } = render(<RatingWidget movieId={testMovieId} />);

    await waitFor(() => {
      expect(mockRatingApi.get).toHaveBeenCalled();
    });

    const star9Button = screen.getByRole('button', { name: /9/ });
    fireEvent.click(star9Button);

    await waitFor(() => {
      expect(mockRatingApi.post).toHaveBeenCalledWith('/ratings', {
        tmdbMovieId: testMovieId,
        score: 9
      });
    });
  });

  it('should delete rating on clear', async () => {
    mockRatingApi.get.mockResolvedValueOnce({ rating: 7 });
    mockRatingApi.delete.mockResolvedValueOnce({});

    render(<RatingWidget movieId={testMovieId} />);

    const clearButton = screen.getByRole('button', { name: /clear|remove/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockRatingApi.delete).toHaveBeenCalledWith(
        `/ratings?movieId=${testMovieId}`
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    mockRatingApi.post.mockRejectedValueOnce(new Error('Network error'));

    render(<RatingWidget movieId={testMovieId} />);

    const star5Button = screen.getByRole('button', { name: /5/ });
    fireEvent.click(star5Button);

    await waitFor(() => {
      // Should show error message or keep original state
      expect(screen.queryByText(/error|failed/i)).toBeInTheDocument();
    });
  });

  it('should show all scores 1-10', () => {
    render(<RatingWidget movieId={testMovieId} />);

    for (let i = 1; i <= 10; i++) {
      const button = screen.getByRole('button', { name: new RegExp(`^${i}$`) });
      expect(button).toBeInTheDocument();
    }
  });

  it('should have optimistic UI update', async () => {
    mockRatingApi.get.mockResolvedValueOnce({ rating: null });
    mockRatingApi.post.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ rating: 8 }), 100))
    );

    render(<RatingWidget movieId={testMovieId} />);

    const star8Button = screen.getByRole('button', { name: /8/ });
    fireEvent.click(star8Button);

    // UI should update immediately
    expect(star8Button).toHaveClass('active');
  });
});
