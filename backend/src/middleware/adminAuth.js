const User = require('../models/user');

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const isAdmin = await User.isAdmin(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { requireAdmin };
