const Workspace = require('../models/Workspace');

// Updated getWorkspaces function
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user._id });
    res.json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Updated createWorkspace function
const createWorkspace = async (req, res) => {
  try {
    const { folders } = req.body;

    // First, check if a workspace exists for this user
    let workspace = await Workspace.findOne({ userId: req.user._id });
    
    if (workspace) {
      // Update existing workspace
      workspace.folders = folders;
      workspace.updatedAt = Date.now();
    } else {
      // Create new workspace
      workspace = new Workspace({
        userId: req.user._id,
        folders: folders || []
      });
    }

    const savedWorkspace = await workspace.save();
    res.status(workspace.isNew ? 201 : 200).json(savedWorkspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Improved sync function
const syncWorkspaces = async (req, res) => {
  try {
    const { folders } = req.body;
    
    // Find workspace for this user
    const existingWorkspace = await Workspace.findOne({ userId: req.user._id });
    
    if (existingWorkspace) {
      // Update the workspace with the new folders
      existingWorkspace.folders = folders;
      existingWorkspace.updatedAt = Date.now();
      
      const updatedWorkspace = await existingWorkspace.save();
      res.json(updatedWorkspace);
    } else {
      // Create a new workspace for this user
      const newWorkspace = new Workspace({
        userId: req.user._id,
        folders: folders
      });
      
      const createdWorkspace = await newWorkspace.save();
      res.status(201).json(createdWorkspace);
    }
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
  deleteWorkspace,
  syncWorkspaces
};