import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function requireAdmin(req, res, next) {
  // Try JWT token first (new auth method)
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === 'admin') {
        req.user = decoded;
        return next();
      }
    } catch (err) {
      // Token invalid, fall through to legacy method
    }
  }

  // Legacy: x-admin-key header (for backward compatibility)
  const requiredKey = process.env.ADMIN_KEY || '';
  if (requiredKey) {
    const provided = req.header('x-admin-key') || '';
    if (provided && provided === requiredKey) return next();
  }

  // Dev mode: allow if no auth configured
  if (!requiredKey && !JWT_SECRET) {
    return next();
  }

  return res.status(401).json({ error: 'admin_required', message: 'Authentication required' });
}


