const express = require('express');
const router = express.Router();
const {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getWorkspaces)
  .post(protect, createWorkspace);

router.route('/:id')
  .put(protect, updateWorkspace)
  .delete(protect, deleteWorkspace);

module.exports = router;