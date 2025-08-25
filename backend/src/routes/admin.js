const express = require('express');
const User = require('../models/user');
const Quote = require('../models/quote');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// 모든 라우트에 관리자 권한 필요
router.use(authenticateToken);
router.use(requireAdmin);

// 모든 명언 조회
router.get('/quotes', async (req, res) => {
  try {
    const quotes = await Quote.findAllWithAuthor();
    res.json({ quotes });
  } catch (error) {
    console.error('Get all quotes error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 특정 명언 삭제
router.delete('/quotes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuote = await Quote.deleteById(id);
    
    if (!deletedQuote) {
      return res.status(404).json({ message: '명언을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '명언이 삭제되었습니다.', quote: deletedQuote });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 모든 명언 삭제
router.delete('/quotes', async (req, res) => {
  try {
    const deletedCount = await Quote.deleteAll();
    res.json({ message: `${deletedCount}개의 명언이 삭제되었습니다.` });
  } catch (error) {
    console.error('Delete all quotes error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 모든 사용자 조회
router.get('/users', async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 관리자 권한 변경
router.patch('/users/:id/admin', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    
    const updatedUser = await User.setAdminStatus(id, isAdmin);
    
    if (!updatedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({ 
      message: `사용자의 관리자 권한이 ${isAdmin ? '부여' : '해제'}되었습니다.`,
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update user admin status error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
