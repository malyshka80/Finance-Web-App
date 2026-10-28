const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware')
const {
  getAdminStats,
  getAllUsers,
  deleteUser,
  changeUserRole,
} = require('../controllers/adminController');

// Stack both guards on every admin route
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats',              getAdminStats);
router.get('/users',              getAllUsers);
router.delete('/users/:id',       deleteUser);
router.patch('/users/:id/role',   changeUserRole);

module.exports = router;