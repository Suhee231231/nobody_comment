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
    <div className="relative w-full max-w-md mx-auto mb-2">
      {/* 빈티지 종이 카드 배경 */}
      <div 
        className="relative w-full aspect-[3/2] bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${isMyQuote ? '/my-quote-card.png' : '/quote-card.png'})` }}
      >
        {/* 명언 내용과 작성자 - 카드 안에 배치 */}
        <div className="absolute inset-0">
          {/* 명언 텍스트와 작성자 - 상단 25% 위치에 고정 */}
          <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 w-full px-8">
                         {isEditing ? (
               <div className="flex flex-col items-center space-y-2">
                 <textarea
                   value={editContent}
                   onChange={(e) => setEditContent(e.target.value)}
                   className="w-full text-sm sm:text-base text-gray-800 text-center font-medium font-serif bg-transparent border-none resize-none focus:outline-none"
                   maxLength={100}
                   rows={3}
                 />
               </div>
             ) : (
              <div className="flex flex-col items-center space-y-2">
                <p className="text-base sm:text-lg text-gray-800 leading-relaxed text-center font-medium font-serif">
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
       <div className="flex justify-between items-center -mt-3">
                   {/* 수정 모드일 때 저장/취소 버튼 */}
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSaveEdit}
                className="relative p-3 text-gray-800 hover:text-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-110"
              >
                <i className="fas fa-save text-xl"></i>
              </button>
              <button
                onClick={handleCancelEdit}
                className="relative p-3 text-gray-800 hover:text-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-110"
              >
                <i className="fas fa-undo text-xl"></i>
              </button>
            </div>
          ) : (
           /* 내 글인 경우 수정/삭제 버튼 */
           isMyQuote ? (
             <div className="flex space-x-3">
               <button
                 onClick={handleEditClick}
                 className="relative p-3 text-gray-800 hover:text-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-110"
               >
                 <i className="fas fa-edit text-xl"></i>
               </button>
               <button
                 onClick={handleDeleteClick}
                 className="relative p-3 text-gray-800 hover:text-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-110"
               >
                 <i className="fas fa-trash text-xl"></i>
               </button>
             </div>
           ) : (
             <div></div>
           )
         )}
         
         {/* 좋아요 버튼 - 우측 정렬 */}
         <div className="flex justify-end">
           <button
             onClick={handleLikeClick}
             className="relative flex items-center space-x-2 p-3 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-110"
           >
             <i className={`text-xl ${quote.isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-500'}`}></i>
             <span className="text-sm font-medium text-gray-700">{quote.likes}</span>
           </button>
         </div>
       </div>
    </div>
  );
};

export default QuoteCard;
