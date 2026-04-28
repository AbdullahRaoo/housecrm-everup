# Data Backup Guide - CRM Realstate

## Part 1: MongoDB Backup

### Option A: MongoDB Atlas Built-in Backup (Easiest - Recommended)

1. Go to **https://cloud.mongodb.com**
2. Select **Project 0** → **Cluster0**
3. In left sidebar, click **"Backup"**
4. You'll see automatic backups listed
5. Click **"Restore"** or **"Download"** to get your data

**Backup includes:**
- opportunities
- users
- properties
- events
- logs
- customers

### Option B: Export Collections as JSON Files

Run this script to export all MongoDB collections:

```bash
cd server
npm install mongodb # if not already installed

node << 'SCRIPT'
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const backupDir = path.join(__dirname, '../backups', new Date().toISOString().split('T')[0]);

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function backupDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('crm');
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    console.log('Backing up collections...');
    console.log('');
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await db.collection(collectionName).find({}).toArray();
      
      const filePath = path.join(backupDir, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      console.log(`✅ ${collectionName}: ${data.length} documents → ${filePath}`);
    }
    
    console.log('');
    console.log(`📦 Backup complete! Files saved to: ${backupDir}`);
    
  } finally {
    await client.close();
  }
}

backupDatabase().catch(console.error);
SCRIPT
```

### Option C: Using mongodump (Command Line)

```bash
mongodump --uri "mongodb+srv://glasslumina:glasslumina@123@cluster0.kabrgfg.mongodb.net/crm" \
  --out ./backups/mongodb-dump-$(date +%Y-%m-%d)
```

This creates a folder with all data in BSON format.

---

## Part 2: Cloudinary Images Backup

### Option A: Download via Cloudinary Dashboard (Manual)

1. Go to **https://cloudinary.com** → Sign in
2. Click **"Media Library"** (left sidebar)
3. Filter by folder: **"real-estate-crm/properties"**
4. Select all images
5. Click **"Download"** → Choose format (ZIP recommended)

**Pros:** Visual, easy to verify
**Cons:** Manual, slow for large datasets

### Option B: Download All Images via API (Automated)

Run this script to download all Cloudinary images:

```bash
npm install cloudinary dotenv

node << 'SCRIPT'
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const backupDir = path.join(__dirname, '../backups/cloudinary-images', new Date().toISOString().split('T')[0]);

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function downloadAllImages() {
  try {
    console.log('Fetching all images from Cloudinary...');
    
    // Get all resources in the folder
    let results = await cloudinary.search
      .expression('folder:real-estate-crm/properties')
      .max_results(500)
      .execute();
    
    const resources = results.resources;
    console.log(`Found ${resources.length} images`);
    console.log('');
    
    // Download each image
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      const url = resource.secure_url;
      const filename = `${i + 1}_${resource.public_id.split('/').pop()}.${resource.format}`;
      const filePath = path.join(backupDir, filename);
      
      // Download file
      await new Promise((resolve, reject) => {
        https.get(url, (response) => {
          const fileStream = fs.createWriteStream(filePath);
          response.pipe(fileStream);
          fileStream.on('finish', () => {
            console.log(`✅ Downloaded: ${filename}`);
            resolve();
          });
        }).on('error', reject);
      });
    }
    
    console.log('');
    console.log(`📦 Backup complete! ${resources.length} images saved to: ${backupDir}`);
    
    // Also save metadata as JSON
    const metadataPath = path.join(backupDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(resources, null, 2));
    console.log(`📋 Metadata saved to: ${metadataPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

downloadAllImages();
SCRIPT
```

### Option C: Use Cloudinary CLI Tool

```bash
npm install -g cloudinary-cli

cloudinary download \
  -e real-estate-crm/properties \
  --out-dir ./backups/cloudinary-images-$(date +%Y-%m-%d)
```

---

## Quick Comparison

| Method | MongoDB | Speed | Ease | Best For |
|--------|---------|-------|------|----------|
| **Atlas Dashboard** | Backup | ⚡⚡⚡ | ⭐⭐⭐ | Quick backup |
| **JSON Export** | Collections | ⚡⚡ | ⭐⭐⭐ | Portable, readable |
| **mongodump** | Full BSON | ⚡⚡ | ⭐⭐ | Advanced users |
| **Cloudinary Dashboard** | Images | ⚡ | ⭐⭐⭐ | Small datasets |
| **Cloudinary API Script** | Images | ⚡⚡ | ⭐⭐ | Automation |

---

## Recommended Full Backup Strategy

1. **MongoDB:** Use Atlas Backup (automatic + manual)
2. **Cloudinary:** Run the API script monthly
3. **Local Storage:** Backup `/uploads/images/` folder if using fallback

This ensures you have multiple copies of all data!
