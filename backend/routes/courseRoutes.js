const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  create, getAll, getMine, getOne, update, remove
} = require('../controllers/courseController');

// Every route below requires a valid JWT (verifyToken).
// Write operations additionally require the 'instructor' role.
router.get('/mine', verifyToken, authorize('instructor'), getMine);
router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getOne);
router.post('/', verifyToken, authorize('instructor'), create);
router.put('/:id', verifyToken, authorize('instructor'), update);
router.delete('/:id', verifyToken, authorize('instructor'), remove);

module.exports = router;
