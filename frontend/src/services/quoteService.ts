import api from './api';

export interface Quote {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export interface CreateQuoteData {
  content: string;
}

export interface QuoteResponse {
  quotes: Quote[];
  total: number;
  hasMore: boolean;
}

class QuoteService {
  async getQuotes(page: number = 1, limit: number = 10): Promise<QuoteResponse> {
    const response = await api.get<QuoteResponse>(`/quotes?page=${page}&limit=${limit}`);
    return response.data;
  }

  async createQuote(data: CreateQuoteData): Promise<Quote> {
    const response = await api.post<Quote>('/quotes', data);
    return response.data;
  }

  async likeQuote(quoteId: string): Promise<void> {
    await api.post('/quotes/like', { quoteId });
  }

  async unlikeQuote(quoteId: string): Promise<void> {
    await api.delete('/quotes/like', { data: { quoteId } } as any);
  }

  async getMyQuote(): Promise<Quote | null> {
    try {
      const response = await api.get<Quote>('/quotes/my');
      return response.data;
    } catch (error: any) {
      // 404 에러는 오늘 글을 작성하지 않은 정상적인 상황
      if (error.response?.status === 404) {
        return null;
      }
      // 다른 에러는 콘솔에 로그만 남기고 null 반환
      console.error('Failed to get my quote:', error);
      return null;
    }
  }

  async canPostToday(): Promise<boolean> {
    try {
      const response = await api.get<{ canPost: boolean }>('/quotes/can-post');
      return response.data.canPost;
    } catch (error) {
      return false;
    }
  }

  async updateQuote(quoteId: string, data: CreateQuoteData): Promise<Quote> {
    const response = await api.put<Quote>(`/quotes/${quoteId}`, data);
    return response.data;
  }

  async deleteQuote(quoteId: string): Promise<void> {
    await api.delete(`/quotes/${quoteId}`);
  }
}

export default new QuoteService();
