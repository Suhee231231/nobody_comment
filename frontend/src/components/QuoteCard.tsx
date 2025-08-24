import React from 'react';
import { Quote } from '../services/quoteService';

interface QuoteCardProps {
  quote: Quote;
  onLike: (quoteId: string) => void;
  onUnlike: (quoteId: string) => void;
  isMyQuote?: boolean;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ 
  quote, 
  onLike, 
  onUnlike, 
  isMyQuote = false 
}) => {
  const handleLikeClick = () => {
    if (quote.isLiked) {
      onUnlike(quote.id);
    } else {
      onLike(quote.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative w-full max-w-sm mx-auto mb-4">
      {/* 픽셀 아트 카드 배경 */}
      <div 
        className="relative w-full aspect-[4/3] bg-contain bg-center bg-no-repeat pixel-card"
        style={{ backgroundImage: 'url(/pixel-card.png)' }}
      >
        {/* 흰색 배경 오버레이 */}
        <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg"></div>
        
        {/* 명언 내용과 작성자 - 픽셀 카드 안에 배치 */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 py-8">
          <div className="flex-1 flex flex-col justify-center -mt-4">
            <p className="text-sm text-gray-800 leading-tight text-center font-medium pixel-text max-w-[80%] mx-auto">
              "{quote.content}"
            </p>
          </div>
          
          {/* 작성자 정보 - 픽셀 카드 안 하단 */}
          <div className="flex flex-col items-center mt-4">
            <p className="text-xs text-gray-600 pixel-text">
              - {quote.author.username}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(quote.createdAt)}
            </p>
            {isMyQuote && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded mt-1">
                내 글
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* 좋아요 버튼 - 픽셀 카드 밖 하단 */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleLikeClick}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors duration-200 ${
            quote.isLiked
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <svg
            className={`w-4 h-4 ${quote.isLiked ? 'fill-current' : 'stroke-current fill-none'}`}
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm font-medium">{quote.likes}</span>
        </button>
      </div>
    </div>
  );
};

export default QuoteCard;
