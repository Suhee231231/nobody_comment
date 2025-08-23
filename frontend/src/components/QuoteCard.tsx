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
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col space-y-4">
        {/* 명언 내용 */}
        <div className="flex-1">
          <p className="text-lg text-gray-800 leading-relaxed">
            "{quote.content}"
          </p>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {quote.author.username.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {quote.author.username}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(quote.createdAt)}
              </p>
            </div>
            {isMyQuote && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                내 글
              </span>
            )}
          </div>

          {/* 좋아요 버튼 */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors duration-200 ${
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
    </div>
  );
};

export default QuoteCard;
