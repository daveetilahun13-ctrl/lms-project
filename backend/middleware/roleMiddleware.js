// Returns a middleware that only allows the request through if
// req.user.role is one of the allowed roles passed in.
// Usage: router.post('/courses', verifyToken, authorize('instructor'), createCourse)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = authorize;
