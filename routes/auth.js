const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../models/User');
const { Query } = require('node-appwrite');
const {databases} = require('../appwrite');
const databaseId = process.env.APPWRITE_DATABASE_ID;
const filesCollectionId = process.env.APPWRITE_FILES_ID;
// const databaseId = '677c0e200012bf3855af';
const usersCollectionId = '677c2a2e003e0b8798f9';
const router = express.Router();
// const cloudinary = require('../config');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// const axios = require('axios');

const dotenv = require('dotenv');
dotenv.config();
// app.use(cors())
// Register Route
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await databases.createDocument(
          databaseId,
          usersCollectionId,
          'unique()', 
          {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
          }
        );
        res.status(201).json({ message: 'User registered successfully', user });
      } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
      }
    });

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      console.log('Login attempt:', email);  // Debug input
  
      const result = await databases.listDocuments(databaseId, usersCollectionId, [
        Query.equal('email', email),
      ]);
  
      console.log('Query result:', result.documents);  // Debug query result
  
      if (result.documents.length > 0) {
        const user = result.documents[0];
        console.log('Found user:', user);  // Debug user object
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log('Password from request:', password);
        console.log('Password from database:', user.password);
        console.log('Password match result:', isPasswordCorrect);
  
        if (isPasswordCorrect) {
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined');
              }
              const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });            return res.json({ message: 'Login successful', user, token });
        }
      }
  
      res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
      console.error('Error logging in:', error);  // Log full error
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  });
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_URL.split('@')[1].split(':')[0],
    api_key: process.env.CLOUDINARY_URL.split(':')[1].split('@')[0],
    api_secret: process.env.CLOUDINARY_URL.split(':')[2].split('@')[0],
  });
  
  // File upload route
  const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');  // Temporary upload folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);  // Naming the file
    },
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure the 'uploads/' folder exists
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Use a unique filename based on timestamp and original filename
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  const upload = multer({ storage: storage });
  let uploadResult="";
 // Upload route to handle file uploads
 router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    // Log the file to make sure it's being received
    console.log('Uploaded file:', file);

    // If no file is uploaded, return an error
    if (!file) {
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }

    
        // Configuration
        cloudinary.config({ 
            cloud_name: 'dl3zfxoyd', 
            api_key: '243337382291341', 
            api_secret: 'GMWnSYI86PCPI5qA8DjRFRw6k54' // Click 'View API Keys' above to copy your API secret
        });
        
        // Upload an image
          uploadResult = await cloudinary.uploader
           .upload(
            file.path,{
                    public_id: file.filename,
               }
           )
           .catch((error) => {
               console.log(error);
           });
           const fileData = {
            file: file.filename,
            fileUrl: uploadResult.secure_url,
            fileType: file.mimetype,
            views: req.body.views || 0, 
            tags: req.body.tags || '',
            userId: req.body.userId,  // Assuming you have a userId from your JWT token or session
            createdAt: new Date().toISOString(),
          };
          const savedFileData = await databases.createDocument(
           databaseId, 
            filesCollectionId, 
            'unique()',  // Generate unique document ID
            fileData
          );
      
    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        filename: file.filename,
        path: file.path,
        CloudinaryFileUrl: uploadResult,
        fileId: savedFileData.$id,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', {error: error.message,CloudinaryFileUrl: uploadResult,});
    res.status(500).json({
      message: 'File upload failed',
      // error: error.message,
      CloudinaryFileUrl: uploadResult,
    });
  }
});

router.get('/files', async (req, res) => {
  try {
    const result = await databases.listDocuments(
      databaseId,  
      filesCollectionId,
    );

    // Send the documents back to the client
    res.status(200).json({
      message: 'Files retrieved successfully',
      files: result.documents,  // Contains the list of files
    });
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({
      message: 'Failed to retrieve files',
      error: error.message,
    });
  }
});
router.post('/increment-view/:fileId', async (req, res) => {
  const fileId = req.params.fileId;

  try {
    // Fetch the file document from Appwrite using fileId
    const fileDoc = await databases.getDocument(databaseId, filesCollectionId, fileId);

    if (!fileDoc) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Increment the views count
    const updatedViews = fileDoc.views + 1;

    // Update the file's view count in the database
    await databases.updateDocument(databaseId, filesCollectionId, fileId, {
      views: updatedViews,
    });

    // Send a success response
    res.status(200).json({
      message: 'File views incremented successfully',
      views: updatedViews,
    });
  } catch (error) {
    console.error('Error updating file views:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



  module.exports = router;