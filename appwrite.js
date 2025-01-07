const { Client, Databases, Storage } = require('node-appwrite');
const client = new Client();
const dotenv = require('dotenv');
dotenv.config();
client
.setEndpoint(process.env.APPWRITE_ENDPOINT)
.setProject(process.env.APPWRITE_PROJECT_ID)
.setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);
module.exports ={databases, storage};
