# How to Run the Billing Application (UI + Backend)

This guide provides step-by-step instructions for running both the frontend (UI) and backend components of the billing application.

## Prerequisites

### Frontend Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Backend Prerequisites
- Java JDK 11 or higher
- Maven or Gradle
- MySQL or PostgreSQL database

## Running the Backend

1. **Clone the backend repository** (if separate from frontend)
   ```bash
   git clone https://github.com/yourusername/billing-service.git
   cd billing-service
   ```

2. **Configure the database**
   
   Edit the `application.properties` or `application.yml` file:
   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/billing_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Build and run the backend**
   
   Using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Or using Gradle:
   ```bash
   ./gradlew bootRun
   ```
   
   The backend API will be available at http://localhost:8087/invokta

## Running the Frontend (UI)

1. **Clone the frontend repository** (if not already done)
   ```bash
   git clone https://github.com/yourusername/billing-app.git
   cd billing-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create or edit the `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:8087/invokta
   REACT_APP_ENV=development
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Start the frontend development server**
   ```bash
   npm start
   ```
   
   The frontend will be available at http://localhost:3000

## Verifying the Integration

1. **Login or Register**
   - Navigate to http://localhost:3000
   - Register a new account or login with existing credentials

2. **Create Business Details**
   - After logging in, navigate to the Business Details section
   - Add your business information

3. **Create and Manage Invoices**
   - Navigate to the Invoices section
   - Create a new invoice

## Troubleshooting

1. **Backend Connection Issues**
   - Ensure the backend server is running at http://localhost:8087/invokta
   - Check that your database is properly configured and running
   - Verify that the REACT_APP_API_URL in the .env file matches the backend URL

2. **Authentication Issues**
   - If Google Sign-In doesn't work, verify your Google OAuth client ID
   - For regular authentication issues, check the backend logs for errors

Remember to always start the backend before the frontend to ensure proper integration.