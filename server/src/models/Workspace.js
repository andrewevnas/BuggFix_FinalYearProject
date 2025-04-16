const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  code: {
    type: String,
    default: ''
  },
  lastEdited: {
    type: Date,
    default: Date.now
  }
});

const FolderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  files: [FileSchema]
});

const WorkspaceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folders: [FolderSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Workspace = mongoose.model('Workspace', WorkspaceSchema);
module.exports = Workspace;