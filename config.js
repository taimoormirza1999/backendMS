const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();
cloudinary.config({
        cloud_name: 'dl3zfxoyd', 
        api_key: '243337382291341', 
        api_secret: 'GMWnSYI86PCPI5qA8DjRFRw6k54'
});

module.exports = cloudinary;