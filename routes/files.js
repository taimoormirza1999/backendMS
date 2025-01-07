const express = require('express');
const multer = require('multer'); // Middleware for handling file uploads
const { Storage, Query } = require('node-appwrite');
const router = express.Router();
const appwriteConfig = require('../config'); // Appwrite config
const storage = new Storage(appwriteConfig.client);

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Upload file route
router.post('/upload', upload.single('file'), async (req, res) => {
  const { tags } = req.body;
  const file = req.file;

  try {
    const uploadedFile = await storage.createFile(appwriteConfig.bucketId, 'unique()', file.path, ['role:all']);
    res.json({ message: 'File uploaded successfully', file: uploadedFile });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Drag-and-drop file organization
router.post('/reorder', (req, res) => {
  const { fileIds } = req.body; // Assuming the new order is passed
  // Handle file ordering logic
  res.json({ message: 'File order updated', fileIds });
});

module.exports = router;
