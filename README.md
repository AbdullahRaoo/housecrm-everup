# CRM Real Estate Application

A comprehensive real estate customer relationship management (CRM) system built with the MERN stack (MongoDB, Express, React, Node.js). This application helps real estate professionals manage properties, customers, opportunities, and schedule viewings.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [Running the Application](#running-the-application)
6. [Deployment](#deployment)
7. [Project Structure](#project-structure)
8. [API Documentation](#api-documentation)
9. [Database Backups](#database-backups)
10. [Contributing](#contributing)

## Features

- **Property Management**: Add, edit, and delete property listings with detailed information including location, features, and media
- **Customer Database**: Manage customer information and interaction history
- **Opportunity Tracking**: Track sales opportunities and their current status
- **Interactive Calendar**: Schedule and manage property viewings and appointments
- **Document Management**: Upload and manage property-related documents
- **Interactive Maps**: Visualize property locations using Google Maps integration
- **Dashboard**: Get an overview of key business metrics and activities
- **Comparison Sheets**: Compare different properties side by side
- **User Authentication**: Secure login system with protected routes

## Architecture

- **Frontend**: React with TypeScript, managed with Vite
- **Backend**: Node.js with Express
- **Database**: MongoDB (Atlas)
- **State Management**: React Context API
- **Styling**: CSS with modern styling approaches
- **File Storage**: Image uploads handled by Cloudinary
- **Maps**: Google Maps integration for property location visualization

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v9+)
- [MongoDB](https://www.mongodb.com/) (or access to MongoDB Atlas)
- [PM2](https://pm2.keymetrics.io/) (for production deployment)
- [NGINX](https://www.nginx.com/) (for production deployment)

## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/Tabish5858/CRM_Realstate
cd CRM_Realstate
```

### Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the server directory with the following variables:

```
# MongoDB Connection URI
MONGODB_URI=your_mongodb_connection_string

# Server Port
PORT=5432

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_key

# Node Environment
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Running the Application

### Development Mode

1. Start the backend server:

```bash
cd server
npm start
```

2. In a new terminal, start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:3000`

### Production Mode

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Start both frontend and backend using PM2:

```bash
cd ..
pm2 start ecosystem.config.js
```

## Deployment

This project is configured for deployment on Linux using PM2 and NGINX. The setup includes:

### Using PM2

PM2 is configured to manage both frontend and backend processes:

```bash
# Start all processes
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs

# Stop all processes
pm2 stop all
```

### Using NGINX

NGINX is configured as a reverse proxy to:

- Serve the frontend application on port 80/443
- Forward API requests to the backend service
- Handle HTTPS when configured

### SSL Setup

SSL certificates can be configured using Certbot:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Database Backups

Automated MongoDB backups are configured to run daily at 2:00 AM using the script at `scripts/mongodb_backup.sh`. Backups are stored in the `backups/mongodb/` directory.

## Project Structure

```
├── ecosystem.config.js          # PM2 configuration
├── backups/                     # Database backup storage
├── frontend/                    # Frontend React application
│   ├── public/                  # Public assets
│   ├── src/                     # Source code
│   │   ├── assets/              # Images and static files
│   │   ├── components/          # Reusable React components
│   │   ├── context/             # React context providers
│   │   ├── data/                # Data handling utilities
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Top-level page components
│   │   ├── services/            # API service functions
│   │   └── types/               # TypeScript type definitions
│   └── vite.config.ts           # Vite configuration
├── nginx/                       # NGINX configuration
├── scripts/                     # Utility scripts
└── server/                      # Backend Node.js application
    ├── config/                  # Server configuration
    ├── data/                    # Seed data
    ├── middleware/              # Express middleware
    ├── models/                  # Mongoose data models
    ├── routes/                  # API route definitions
    ├── scripts/                 # Server utility scripts
    └── services/                # Server-side service functions
```

## API Documentation

The backend API provides the following endpoints:

### Authentication

- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration

### Properties

- `GET /api/properties`: List all properties
- `GET /api/properties/:id`: Get property details
- `POST /api/properties`: Create new property
- `PUT /api/properties/:id`: Update property
- `DELETE /api/properties/:id`: Delete property

### Customers

- `GET /api/customers`: List all customers
- `GET /api/customers/:id`: Get customer details
- `POST /api/customers`: Create new customer
- `PUT /api/customers/:id`: Update customer
- `DELETE /api/customers/:id`: Delete customer

### Opportunities

- `GET /api/opportunities`: List all opportunities
- `GET /api/opportunities/:id`: Get opportunity details
- `POST /api/opportunities`: Create new opportunity
- `PUT /api/opportunities/:id`: Update opportunity
- `DELETE /api/opportunities/:id`: Delete opportunity

### Events

- `GET /api/events`: List all events
- `POST /api/events`: Create new event
- `PUT /api/events/:id`: Update event
- `DELETE /api/events/:id`: Delete event

### Uploads

- `POST /api/uploads`: Upload files to Cloudinary

## Database Backups

Automated MongoDB Atlas backups are scheduled using the script at `scripts/mongodb_backup.sh`. The backups are stored in the `backups/mongodb/` directory and are configured to maintain the last 7 days of backups.

To manually trigger a backup:

```bash
./scripts/mongodb_backup.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a pull request
