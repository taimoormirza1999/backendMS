const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization'); // Expecting 'Bearer <token>'
  
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

module.exports = authenticateToken;
