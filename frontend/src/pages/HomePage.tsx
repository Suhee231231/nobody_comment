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
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);

  useEffect(() => {
    loadQuotes();
    if (user) {
      loadMyQuote();
    }
  }, [user]);

  const loadQuotes = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await quoteService.getQuotes(pageNum, 10); // 한 페이지당 10개
      setQuotes(response.quotes);
      setTotalQuotes(response.total);
      setTotalPages(Math.ceil(response.total / 10));
      setCurrentPage(pageNum);
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
      // getMyQuote에서 이미 에러 처리를 하므로 여기서는 추가 로그만 남김
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

  const handlePageChange = (pageNum: number) => {
    if (!loading && pageNum !== currentPage && pageNum >= 1 && pageNum <= totalPages) {
      loadQuotes(pageNum);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 내 글 섹션 */}
      {user && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">나의 명언</h2>
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
                 오늘의 명언을 작성해보세요.<br />
                 자정이 지나면 자동으로 삭제됩니다.
               </p>
               <Link to="/write" className="inline-block p-3 text-gray-800 hover:text-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-110">
                 <i className="fa-solid fa-pen-nib text-3xl"></i>
               </Link>
             </div>
          )}
        </div>
      )}

      {/* 모든 명언 섹션 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          오늘의 명언
        </h2>
        
        {quotes.length === 0 && !loading ? (
                     <div className="card text-center py-12">
             <p className="text-gray-600 mb-4">
               아직 작성된 명언이 없습니다
             </p>
             {user && (
               <Link to="/write" className="inline-block p-3 text-gray-800 hover:text-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-110">
                 <i className="fa-solid fa-pen-nib text-3xl"></i>
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
                isMyQuote={myQuote?.id === quote.id || user?.isAdmin}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {/* 이전 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={loading || currentPage === 1}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {/* 페이지 번호들 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
                className={`px-3 py-2 text-sm rounded ${
                  currentPage === pageNum
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {pageNum}
              </button>
            ))}
            
            {/* 다음 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={loading || currentPage === totalPages}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
        
        {/* 전체 명언 수 표시 */}
        {totalQuotes > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              총 {totalQuotes}개의 명언
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
