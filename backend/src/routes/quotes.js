const express = require('express');
const Quote = require('../models/quote');
const Like = require('../models/like');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

console.log('📋 quotes 라우터 초기화됨');

// 모든 명언 조회 (페이지네이션)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user ? req.user.id : null;
    
    const result = await Quote.findAll(page, limit, userId);
    
    // 응답 데이터 변환
    const quotes = result.quotes.map(quote => ({
      id: quote.id,
      content: quote.content,
      author: {
        id: quote.author_id,
        username: quote.author_username
      },
      likes: parseInt(quote.likes_count) || 0,
      isLiked: quote.is_liked || false,
      createdAt: quote.created_at
    }));
    
    res.json({
      quotes,
      total: result.total,
      hasMore: result.hasMore
    });
    
  } catch (error) {
    console.error('명언 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 명언 작성
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const authorId = req.user.id;
    
    // 입력 검증
    if (!content || !content.trim()) {
      return res.status(400).json({ message: '내용을 입력해주세요.' });
    }
    
    if (content.length > 100) {
      return res.status(400).json({ message: '100자 이내로 작성해주세요.' });
    }
    
    // 오늘 이미 작성했는지 확인
    const canPost = await Quote.canUserPostToday(authorId);
    if (!canPost) {
      return res.status(400).json({ message: '오늘은 이미 글을 작성하셨습니다.' });
    }
    
    // 명언 생성
    const quote = await Quote.create({
      content: content.trim(),
      authorId
    });
    
    // 작성자 정보 조회
    const author = await require('../models/user').findById(authorId);
    
    res.status(201).json({
      id: quote.id,
      content: quote.content,
      author: {
        id: author.id,
        username: author.username
      },
      likes: 0,
      isLiked: false,
      createdAt: quote.created_at
    });
    
  } catch (error) {
    console.error('명언 작성 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내 명언 조회
router.get('/my', authenticateToken, async (req, res) => {
  console.log('🔍 /quotes/my 라우트 호출됨');
  try {
    const authorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    console.log('📅 오늘 날짜:', today);
    console.log('👤 사용자 ID:', authorId);
    
    const quote = await Quote.findByAuthorId(authorId, today);
    
    console.log('📝 찾은 명언:', quote ? '있음' : '없음');
    
    if (!quote) {
      return res.status(404).json({ message: '오늘 작성한 명언이 없습니다.' });
    }
    
    // 좋아요 수 조회
    const likesCount = await Like.getCountByQuoteId(quote.id);
    
    // 내가 좋아요 눌렀는지 확인
    const isLiked = await Like.exists({ userId: authorId, quoteId: quote.id });
    
    res.json({
      id: quote.id,
      content: quote.content,
      author: {
        id: quote.author_id,
        username: quote.author_username
      },
      likes: likesCount,
      isLiked,
      createdAt: quote.created_at
    });
    
  } catch (error) {
    console.error('내 명언 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 오늘 글 작성 가능 여부 확인
router.get('/can-post', authenticateToken, async (req, res) => {
  try {
    const authorId = req.user.id;
    const canPost = await Quote.canUserPostToday(authorId);
    
    res.json({ canPost });
    
  } catch (error) {
    console.error('글 작성 가능 여부 확인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 좋아요 추가 (동적 경로 제거)
router.post('/like', authenticateToken, async (req, res) => {
  try {
    const { quoteId } = req.body;
    const userId = req.user.id;
    
    if (!quoteId) {
      return res.status(400).json({ message: '명언 ID가 필요합니다.' });
    }
    
    // 명언 존재 확인
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({ message: '명언을 찾을 수 없습니다.' });
    }
    
    // 이미 좋아요 눌렀는지 확인
    const alreadyLiked = await Like.exists({ userId, quoteId });
    if (alreadyLiked) {
      return res.status(400).json({ message: '이미 좋아요를 눌렀습니다.' });
    }
    
    // 좋아요 추가
    await Like.create({ userId, quoteId });
    
    res.json({ message: '좋아요가 추가되었습니다.' });
    
  } catch (error) {
    console.error('좋아요 추가 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 좋아요 제거 (동적 경로 제거)
router.delete('/like', authenticateToken, async (req, res) => {
  try {
    const { quoteId } = req.body;
    const userId = req.user.id;
    
    if (!quoteId) {
      return res.status(400).json({ message: '명언 ID가 필요합니다.' });
    }
    
    // 좋아요 제거
    const deleted = await Like.delete({ userId, quoteId });
    
    if (!deleted) {
      return res.status(404).json({ message: '좋아요를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '좋아요가 제거되었습니다.' });
    
  } catch (error) {
    console.error('좋아요 제거 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 명언 수정
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // 입력 검증
    if (!content || !content.trim()) {
      return res.status(400).json({ message: '내용을 입력해주세요.' });
    }
    
    if (content.length > 100) {
      return res.status(400).json({ message: '100자 이내로 작성해주세요.' });
    }
    
    // 명언 존재 확인 및 권한 확인
    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ message: '명언을 찾을 수 없습니다.' });
    }
    
    if (quote.author_id !== userId) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }
    
    // 오늘 작성한 글인지 확인
    const today = new Date().toISOString().split('T')[0];
    const quoteDate = new Date(quote.created_at).toISOString().split('T')[0];
    
    if (quoteDate !== today) {
      return res.status(400).json({ message: '오늘 작성한 글만 수정할 수 있습니다.' });
    }
    
    // 명언 수정
    const updatedQuote = await Quote.update(id, { content: content.trim() });
    
    // 작성자 정보 조회
    const author = await require('../models/user').findById(userId);
    
    res.json({
      id: updatedQuote.id,
      content: updatedQuote.content,
      author: {
        id: author.id,
        username: author.username
      },
      likes: parseInt(updatedQuote.likes_count) || 0,
      isLiked: updatedQuote.is_liked || false,
      createdAt: updatedQuote.created_at
    });
    
  } catch (error) {
    console.error('명언 수정 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 명언 삭제 (작성자 또는 관리자)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 명언 존재 확인
    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ message: '명언을 찾을 수 없습니다.' });
    }
    
    // 관리자 권한 확인
    const User = require('../models/user');
    const isAdmin = await User.isAdmin(userId);
    
    // 작성자 또는 관리자만 삭제 가능
    if (quote.author_id !== userId && !isAdmin) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }
    
    // 관리자가 아닌 경우 오늘 작성한 글인지 확인
    if (!isAdmin) {
      const today = new Date().toISOString().split('T')[0];
      const quoteDate = new Date(quote.created_at).toISOString().split('T')[0];
      
      if (quoteDate !== today) {
        return res.status(400).json({ message: '오늘 작성한 글만 삭제할 수 있습니다.' });
      }
    }
    
    // 좋아요 먼저 삭제
    await Like.deleteByQuoteId(id);
    
    // 명언 삭제
    await Quote.delete(id);
    
    res.json({ message: '명언이 삭제되었습니다.' });
    
  } catch (error) {
    console.error('명언 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
