const Workspace = require('../models/Workspace');

// @desc    Get all workspaces for a user
// @route   GET /api/workspaces
// @access  Private
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user._id });
    res.json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
  try {
    const { folders } = req.body;

    const workspace = new Workspace({
      userId: req.user._id,
      folders: folders || []
    });

    const createdWorkspace = await workspace.save();
    res.status(201).json(createdWorkspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
const updateWorkspace = async (req, res) => {
  try {
    const { folders } = req.body;

    const workspace = await Workspace.findById(req.params.id);

    if (workspace) {
      // Check if the workspace belongs to the logged-in user
      if (workspace.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this workspace' });
      }

      workspace.folders = folders || workspace.folders;
      workspace.updatedAt = Date.now();

      const updatedWorkspace = await workspace.save();
      res.json(updatedWorkspace);
    } else {
      res.status(404).json({ message: 'Workspace not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (workspace) {
      // Check if the workspace belongs to the logged-in user
      if (workspace.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this workspace' });
      }

      await workspace.remove();
      res.json({ message: 'Workspace removed' });
    } else {
      res.status(404).json({ message: 'Workspace not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};