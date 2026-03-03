import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  try {
    // Try to get token from cookie first (for same-domain requests)
    let token = req.cookies.jwt;

    // If no cookie, try Authorization header (for cross-domain requests)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not authenticated!' });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err) return res.status(403).json({ message: 'Token is not valid!' });
      req.userId = payload.userId;
      req.user = payload; // Store full user payload for potential use
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export const verifyTokenOptional = (req, res, next) => {
  try {
    let token = req.cookies?.jwt;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return next(); // Proceed as anonymous
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (!err) {
        req.userId = payload.userId;
        req.user = payload;
      }
      // Regardless of error, proceed (invalid token just means anonymous)
      next();
    });
  } catch (err) {
    next();
  }
}

export const verifyAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    next();
  } else {
    return res.status(403).json({ message: 'You are not authorized to perform this action!' });
  }
};