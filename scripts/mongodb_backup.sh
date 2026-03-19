#!/bin/bash

# MongoDB Atlas backup script
# Set the date format for the backup filename
DATE=$(date +"%Y-%m-%d-%H-%M")
BACKUP_DIR="/var/www/CRM_Realstate/backups/mongodb"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# MongoDB Atlas connection string (using the one from your .env file)
CONNECTION_STRING="mongodb+srv://glasslumina:glasslumina%40123@cluster0.kabrgfg.mongodb.net/crm?retryWrites=true&w=majority&appName=Cluster0"

# Database name
DB_NAME="crm"

# Execute mongodump
mongodump --uri="$CONNECTION_STRING" --db=$DB_NAME --out="$BACKUP_DIR/$DATE"

# Keep only the last 7 backups to save space (adjust as needed)
ls -td $BACKUP_DIR/*/ | tail -n +8 | xargs rm -rf

echo "MongoDB backup completed: $BACKUP_DIR/$DATE"
