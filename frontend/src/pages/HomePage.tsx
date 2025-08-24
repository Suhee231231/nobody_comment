import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QuoteCard from '../components/QuoteCard';
import quoteService, { Quote } from '../services/quoteService';
import { User } from '../services/authService';

interface HomePageProps {
  user: User | null;
}

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [myQuote, setMyQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadQuotes();
    if (user) {
      loadMyQuote();
    }
  }, [user]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await quoteService.getQuotes(page);
      if (page === 1) {
        setQuotes(response.quotes);
      } else {
        setQuotes(prev => [...prev, ...response.quotes]);
      }
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyQuote = async () => {
    try {
      const quote = await quoteService.getMyQuote();
      setMyQuote(quote);
    } catch (error) {
      console.error('Failed to load my quote:', error);
    }
  };

  const handleLike = async (quoteId: string) => {
    try {
      await quoteService.likeQuote(quoteId);
      setQuotes(prev => 
        prev.map(quote => 
          quote.id === quoteId 
            ? { ...quote, likes: quote.likes + 1, isLiked: true }
            : quote
        )
      );
      if (myQuote && myQuote.id === quoteId) {
        setMyQuote(prev => prev ? { ...prev, likes: prev.likes + 1, isLiked: true } : null);
      }
    } catch (error) {
      console.error('Failed to like quote:', error);
    }
  };

  const handleUnlike = async (quoteId: string) => {
    try {
      await quoteService.unlikeQuote(quoteId);
      setQuotes(prev => 
        prev.map(quote => 
          quote.id === quoteId 
            ? { ...quote, likes: quote.likes - 1, isLiked: false }
            : quote
        )
      );
      if (myQuote && myQuote.id === quoteId) {
        setMyQuote(prev => prev ? { ...prev, likes: prev.likes - 1, isLiked: false } : null);
      }
    } catch (error) {
      console.error('Failed to unlike quote:', error);
    }
  };

  const handleUpdate = async (quoteId: string, content: string) => {
    try {
      const updatedQuote = await quoteService.updateQuote(quoteId, { content });
      setQuotes(prev => 
        prev.map(quote => 
          quote.id === quoteId ? updatedQuote : quote
        )
      );
      if (myQuote && myQuote.id === quoteId) {
        setMyQuote(updatedQuote);
      }
    } catch (error) {
      console.error('Failed to update quote:', error);
      alert('글 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (quoteId: string) => {
    try {
      await quoteService.deleteQuote(quoteId);
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
      if (myQuote && myQuote.id === quoteId) {
        setMyQuote(null);
      }
    } catch (error) {
      console.error('Failed to delete quote:', error);
      alert('글 삭제에 실패했습니다.');
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadQuotes();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 내 글 섹션 */}
      {user && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">내 오늘의 명언</h2>
            {!myQuote && (
              <Link to="/write" className="btn-primary">
                글쓰기
              </Link>
            )}
          </div>
          
          {myQuote ? (
            <QuoteCard
              quote={myQuote}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isMyQuote={true}
            />
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-600 mb-4">
                오늘의 명언을 작성해보세요
              </p>
              <Link to="/write" className="btn-primary">
                첫 명언 작성하기
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 모든 명언 섹션 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          오늘의 명언들
        </h2>
        
        {quotes.length === 0 && !loading ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">
              아직 작성된 명언이 없습니다
            </p>
            {user && (
              <Link to="/write" className="btn-primary">
                첫 명언 작성하기
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map(quote => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                isMyQuote={myQuote?.id === quote.id}
              />
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              {loading ? '로딩 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
