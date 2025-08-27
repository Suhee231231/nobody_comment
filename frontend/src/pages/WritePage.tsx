import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quoteService from '../services/quoteService';

const WritePage: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [canPost, setCanPost] = useState(true);
  const [myQuote, setMyQuote] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkCanPost();
    loadMyQuote();
  }, []);

  const checkCanPost = async () => {
    try {
      const canPostToday = await quoteService.canPostToday();
      setCanPost(canPostToday);
    } catch (error) {
      console.error('Failed to check if can post:', error);
    }
  };

  const loadMyQuote = async () => {
    try {
      const quote = await quoteService.getMyQuote();
      if (quote) {
        setMyQuote(quote.content);
      }
    } catch (error) {
      console.error('Failed to load my quote:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (content.length > 100) {
      alert('100자 이내로 작성해주세요.');
      return;
    }

    try {
      setLoading(true);
      await quoteService.createQuote({ content: content.trim() });
      navigate('/');
    } catch (error: any) {
      console.error('Failed to create quote:', error);
      alert(error.response?.data?.message || '글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = 100 - content.length;

  if (!canPost) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            오늘은 이미 글을 작성하셨습니다
          </h1>
          <p className="text-gray-600 mb-6">
            내일 자정이 지나면 다시 작성할 수 있습니다.
          </p>
          {myQuote && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">오늘 작성한 명언:</p>
              <p className="text-lg text-gray-800">"{myQuote}"</p>
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          오늘의 명언 작성하기
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              명언 내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="단상을 자유롭게 남겨주세요. 누군가에겐 인상적인 한마디가 될 것입니다."
              className="input-field h-32 resize-none"
                              maxLength={70}
            />
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-500">
                하루에 하나의 글만 게시할 수 있으며, 수정과 삭제가 자유롭습니다. 자정이 지나면 글은 자동 삭제됩니다.
              </p>
              <div className="flex justify-end">
                <span className={`text-sm ${
                  remainingChars < 10 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {remainingChars}자 남음
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary flex-1"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? '작성 중...' : '작성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WritePage;
