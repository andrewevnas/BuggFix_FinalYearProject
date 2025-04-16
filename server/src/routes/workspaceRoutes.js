const express = require('express');
const router = express.Router();
const {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  syncWorkspaces
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getWorkspaces)
  .post(protect, createWorkspace);

router.route('/:id')
  .put(protect, updateWorkspace)
  .delete(protect, deleteWorkspace);
  
router.put('/sync', protect, syncWorkspaces);

module.exports = router;