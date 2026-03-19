# CRM Real Estate

A comprehensive CRM system for real estate businesses to manage properties, customers, opportunities, and events.

## Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Tech Stack](#tech-stack)

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) section)
4. Set up the database and other required services
5. Run the development server

## Environment Variables

The application requires several environment variables to be set in a `.env` file at the root of the project. These are necessary for connecting to MongoDB, Google Maps API, and Cloudinary services.

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```properties
# MongoDB Connection URI
MONGODB_URI=your_mongodb_connection_string

# Server Port
PORT=5432

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_key

# Google Maps API Key for Property Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Node Environment
NODE_ENV=development

# Cloudinary Configuration for Image Upload
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

### How to Obtain API Keys

1. **MongoDB URI**:

   - Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Under "Database Access", create a new database user
   - Under "Network Access", add your IP address
   - Go to "Clusters" > "Connect" > "Connect your application" to get your connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your database credentials

2. **Google Maps API Key**:

   - Go to [Google Cloud Platform](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Maps JavaScript API, Places API, and Geocoding API
   - Create an API key under "Credentials"
   - Restrict the API key to your domains for security

3. **Cloudinary Configuration**:
   - Create an account on [Cloudinary](https://cloudinary.com/)
   - Go to your dashboard to find your cloud name, API key, and API secret
   - Create an upload preset under Settings > Upload > Upload presets

## Running the Application

1. Start the backend server:

```bash
npm run server
```

2. In a separate terminal, start the frontend development server:

```bash
npm run dev
```

3. Access the application at `http://localhost:5173` (or the port shown in your terminal)

## Features

- Property management
- Customer database
- Opportunity tracking
- Calendar and event scheduling
- Document management
- User authentication and authorization
- Activity logging
- Reporting and analytics

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Vite
- Backend: Node.js, Express
- Database: MongoDB
- Maps: Google Maps API
- Image Storage: Cloudinary
- Authentication: JWT

---

## Development

The following is the default Vite + React + TypeScript setup information:

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```
