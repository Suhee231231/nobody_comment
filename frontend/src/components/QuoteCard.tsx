import React, { useState } from 'react';
import { Quote } from '../services/quoteService';

interface QuoteCardProps {
  quote: Quote;
  onLike: (quoteId: string) => void;
  onUnlike: (quoteId: string) => void;
  onUpdate?: (quoteId: string, content: string) => void;
  onDelete?: (quoteId: string) => void;
  isMyQuote?: boolean;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ 
  quote, 
  onLike, 
  onUnlike, 
  onUpdate,
  onDelete,
  isMyQuote = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(quote.content);

  const handleLikeClick = () => {
    if (quote.isLiked) {
      onUnlike(quote.id);
    } else {
      onLike(quote.id);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(quote.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(quote.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== quote.content && onUpdate) {
      onUpdate(quote.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('정말로 이 글을 삭제하시겠습니까?')) {
      onDelete?.(quote.id);
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
    <div className="relative w-full max-w-md mx-auto mb-4">
      {/* 빈티지 종이 카드 배경 */}
      <div 
        className="relative w-full aspect-[3/2] bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${isMyQuote ? '/my-quote-card.png' : '/quote-card.png'})` }}
      >
        {/* 명언 내용과 작성자 - 카드 안에 배치 */}
        <div className="absolute inset-0">
          {/* 명언 텍스트와 작성자 - 상단 35% 위치에 고정 */}
          <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 w-full px-8">
            {isEditing ? (
              <div className="flex flex-col items-center space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-sm sm:text-base text-gray-800 text-center font-medium font-serif bg-transparent border-none resize-none focus:outline-none"
                  maxLength={100}
                  rows={3}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed text-center font-medium font-serif">
                  "{quote.content}"
                </p>
                
                {/* 작성자 정보 - 텍스트 바로 아래 */}
                <div className="flex flex-col items-center">
                  <p className="text-xs sm:text-sm text-gray-700 font-medium">
                    - {quote.author.username}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 버튼들 - 카드 밖 하단 */}
      <div className="flex justify-between items-center -mt-1">
        {/* 내 글인 경우 수정/삭제 버튼 */}
        {isMyQuote && !isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleEditClick}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
            >
              수정
            </button>
            <button
              onClick={handleDeleteClick}
              className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
            >
              삭제
            </button>
          </div>
        ) : (
          <div></div>
        )}
        
        {/* 좋아요 버튼 - 우측 정렬 */}
        <div className="flex justify-end">
          <button
            onClick={handleLikeClick}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors duration-200 ${
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
