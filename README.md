# Backend Template

A modern, full-stack application template featuring a Node.js/Express backend with TypeScript and a React Admin frontend.

## Features

- **Robust Authentication System**

  - JWT-based authentication
  - Social login (Facebook, Google, Apple)
  - OTP-based authentication
  - Password reset functionality

- **RESTful API**

  - User management
  - Device tokens
  - File uploads with S3 integration
  - In-app purchases and notifications

- **Admin Dashboard**

  - Built with React Admin
  - User management interface
  - Configuration management
  - In-app purchase tracking

- **Security Features**

  - Helmet for HTTP security headers
  - Rate limiting
  - Password hashing with bcrypt
  - CORS configuration

- **Database**
  - MongoDB with Mongoose ODM
  - Schema validation
  - Pagination support

## Tech Stack

### Backend

- Node.js & Express
- TypeScript
- MongoDB & Mongoose
- Passport.js for authentication
- Redis for caching
- Firebase Admin SDK
- AWS S3 for file storage
- Mailgun for email services

### Frontend

- React
- React Admin
- JWT authentication

## Prerequisites

- [Docker (at least 1.10)](https://www.docker.com/)
- [Docker Compose (at least 1.6)](https://docs.docker.com/compose/install/)
- Node.js (v14+) and npm/yarn for local development
- SSH access to private repositories

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend-template
```

### 2. Quick Start (Basic Usage)

The application can run without additional key configuration for basic API functionality:

1. **Copy the example environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Setup SSH for private repositories:**

   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_rsa  # or your specific SSH key file
   ```

3. **Build and start the containers:**

   ```bash
   DOCKER_BUILDKIT=1 docker compose build
   docker-compose up
   ```

4. **Access the application:**
   - Backend API: <http://localhost:3000/api/v1>
   - Admin Dashboard: <http://localhost:3001>

✅ **The core API will work without additional configuration!**

### 3. Optional Key Files Configuration

⚠️ **Only required if you need to use specific features:**

#### When do you need these keys?

- **Payment Module**: If using `@astraler/payment-module` for in-app purchases
- **Push Notifications**: If using Firebase services for mobile notifications
- **Apple Services**: If integrating with Apple App Store Connect

#### Key Files Location: `backend/keys/`

```
backend/keys/
├── androidServiceAccount.json          # Required for: Android push notifications
├── Astraler_SubscriptionKey_4Z3C99395C.p8  # Required for: Apple in-app purchases
├── googlePlayServiceAccountKey.json    # Required for: Google Play in-app purchases
└── iosServiceAccount.json              # Required for: iOS push notifications
```

#### Current Status

ℹ️ **All key files currently contain example/dummy data. Replace only if you need the related features.**

#### How to get actual keys (if needed)

1. **For Push Notifications (androidServiceAccount.json & iosServiceAccount.json)**

   - Download from Firebase Console → Project Settings → Service Accounts
   - Generate new private key for your Firebase project
   - Replace the example files with downloaded keys

2. **For Apple In-App Purchases (Astraler_SubscriptionKey_4Z3C99395C.p8)**

   - Download from Apple Developer → App Store Connect API → Keys
   - Create new key with App Store Connect Access
   - Replace the example .p8 file

3. **For Google Play In-App Purchases (googlePlayServiceAccountKey.json)**
   - Download from Google Cloud Console → IAM & Admin → Service Accounts
   - Create service account with Google Play Developer API access
   - Download JSON key file and replace the example

#### Environment Variables (if using these features)

Update your `.env` file with the correct paths and identifiers

### Example Workflow

1. **For a new project:**

   ```bash
   # Clone the template
   git clone <repository-url>
   cd backend-template

   # Setup generator
   cd generators
   npm install -g yo
   npm install
   npm run link

   # Create new project
   cd ~/your-projects-folder
   yo backend:app
   ```

2. **For adding API modules to existing project:**

   ```bash
   # Navigate to the folder where your API modules are located
   cd your-backend-project/backend/src/api

   # Generate new API module
   yo backend:api
   ```

### Customizing Templates

To customize the generated code:

1. Modify files in `generators/app/templates/` for project templates
2. Modify files in `generators/api/templates/` for API module templates
3. Update the generator logic in `generators/app/index.ts` or `generators/api/index.ts`

### Local Development

#### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

**Note:** The API will work normally without key configuration. Only payment and notification features will be unavailable.

#### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Start the development server:

   ```bash
   yarn dev
   ```

## Testing

Run tests for the backend:

```bash
cd backend
npm test
```

## Deployment

### Basic Deployment (without payment/notification features)

No additional key configuration needed. Follow standard deployment process.

### Full Feature Deployment

If you need payment module or Firebase services:

#### Pre-Deployment Checklist

- [ ] Key files configured for required features only
- [ ] Environment variables updated for active features
- [ ] Keys have appropriate permissions for the target environment
- [ ] Keys are environment-specific (dev/staging/prod)
- [ ] Git assume-unchanged is set for all key files

### Staging Environment

```bash
ssh to-your-staging-server
cd ~/backend-template

# Update the main repository
git pull origin develop

# Configure keys only if using payment/notification features
# Verify: ls -la backend/keys/ (optional step)

# Build and start containers
docker-compose -f docker-compose.staging.yml build
docker-compose -f docker-compose.staging.yml up -d
```

### Production Environment

```bash
ssh to-your-production-server
cd ~/backend-template

# Update the main repository
git pull origin main

# Configure keys only if using payment/notification features
# Verify: ls -la backend/keys/ (optional step)

# Build and start containers
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Feature Dependencies

| Feature            | Required Keys     | Status without Keys   |
| ------------------ | ----------------- | --------------------- |
| Basic API          | None              | ✅ Fully functional   |
| User Management    | None              | ✅ Fully functional   |
| Authentication     | None              | ✅ Fully functional   |
| File Upload        | None              | ✅ Fully functional   |
| Push Notifications | Firebase keys     | ❌ Feature disabled   |
| In-App Purchases   | Apple/Google keys | ❌ Feature disabled   |
| Payment Module     | All payment keys  | ❌ Module unavailable |

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Keys are optional** - only configure what you need
2. **Never commit actual key files** to version control
3. **Example key files are included** only for structure reference
4. **Use `git update-index --assume-unchanged`** to prevent accidental commits
5. **Use different keys** for different environments (dev/staging/prod)
6. **Rotate keys regularly** especially for production
7. **Restrict key permissions** to minimum required access
8. **Store production keys securely** using secret management tools

## Project Structure

```
backend-template/
├── backend/                # Node.js Express backend
│   ├── src/
│   │   ├── api/            # API routes and controllers
│   │   ├── config/         # Configuration files
│   │   ├── core/           # Core functionality
│   │   ├── helpers/        # Helper functions
│   │   ├── middlewares/    # Express middlewares
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── keys/               # Optional service account keys
│   │   ├── androidServiceAccount.json      # (Firebase Android)
│   │   ├── Astraler_SubscriptionKey_4Z3C99395C.p8  # (Apple Store)
│   │   ├── googlePlayServiceAccountKey.json # (Google Play)
│   │   └── iosServiceAccount.json          # (Firebase iOS)
│   ├── tests/              # Test files
│   └── package.json        # Backend dependencies
├── frontend/               # React Admin frontend
├── compose/                # Docker Compose configuration
├── scripts/                # Utility scripts
├── docker-compose.yml      # Docker Compose for development
├── docker-compose.prod.yml # Docker Compose for production
├── .env.example           # Example environment variables
└── .gitignore             # Includes keys/ directory to prevent commits
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
