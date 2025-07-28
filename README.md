# Billing Application

A comprehensive billing and invoice management system built with React and Material UI, designed to help businesses manage their invoices, track payments, and maintain business details.

## Features

1. **User Authentication**
   - Email & Password Login
   - Google Authentication
   - Registration/Signup
   - Forgot Password Recovery
   - Password Reset

2. **Dashboard**
   - Overview of invoices and business metrics
   - Quick access to key features

3. **Business Management**
   - Add/Update/Delete Business Details
   - Manage multiple office addresses
   - Store business information (GSTIN, PAN, etc.)

4. **Invoice Management**
   - Create new invoices
   - Edit existing invoices
   - Delete invoices
   - Mark invoices as paid
   - Restore deleted invoices
   - GST calculation (IGST, CGST, SGST)

5. **Export Options**
   - Export invoices as PDF
   - Preview invoice PDFs
   - Export all invoices as CSV

## Technologies Used

- **Frontend**
  - React 18
  - React Router v7
  - Material UI v7
  - Formik & Yup for form validation
  - Axios for API requests
  - JWT for authentication

- **Backend**
  - Spring Boot (Java)
  - Spring Security
  - Spring Data JPA
  - MySQL/PostgreSQL
  - Swagger for API documentation

## Installation and Setup

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/billing-app.git
   cd billing-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8087/invokta
   REACT_APP_ENV=development
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```
   
   > **Important:** Replace `your-google-client-id` with your actual Google OAuth client ID from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Without a valid client ID, Google Sign-In will not work.

4. **Start the frontend development server**
   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000

### Backend Setup

1. **Clone the backend repository** (if separate from frontend)
   ```bash
   git clone https://github.com/yourusername/billing-service.git
   cd billing-service
   ```

2. **Configure the database**
   
   Edit the `application.properties` or `application.yml` file to set up your database connection:
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

> **Note:** Make sure the backend is running before starting the frontend application to ensure proper integration.

## Usage

1. **Authentication**
   - Register a new account or login with existing credentials
   - Alternatively, use Google authentication

2. **Business Setup**
   - Add your business details including name, GSTIN, PAN, etc.
   - Add office addresses with contact information

3. **Creating Invoices**
   - Navigate to the Invoices page
   - Click "New Invoice"
   - Fill in the invoice details including billed to, amount, GST details
   - Save the invoice

4. **Managing Invoices**
   - View all invoices in the invoice list
   - Edit, delete, or mark invoices as paid
   - Export invoices as PDF or preview them
   - Export all invoices as CSV

## API Endpoints

The application interacts with the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/authenticate` - Login with email and password
- `POST /api/auth/google` - Login with Google
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Refresh authentication token

### Business Management
- `GET /api/business/all` - Get all businesses
- `GET /api/business/get/{id}` - Get business by ID
- `POST /api/business/add` - Create a new business
- `PUT /api/business/update/{id}` - Update business details
- `POST /api/business/add/office-address/{id}` - Add office address to business

### Invoice Management
- `GET /api/invoices/all` - Get all invoices
- `GET /api/invoices/get/{id}` - Get invoice by ID
- `POST /api/invoices/add` - Create a new invoice
- `PUT /api/invoices/update/{id}` - Update invoice details
- `DELETE /api/invoices/delete/{id}` - Delete invoice
- `PATCH /api/invoices/{id}/mark-paid` - Mark invoice as paid
- `PATCH /api/invoices/restore/{id}` - Restore deleted invoice
- `GET /api/invoices/{id}/export/pdf` - Export invoice as PDF
- `GET /api/invoices/{id}/preview/pdf` - Preview invoice as PDF
- `GET /api/invoices/export/pdf` - Export all invoices as PDF
- `GET /api/invoices/export/csv` - Export all invoices as CSV
- `GET /api/invoices/search` - Search invoices

## Frontend-Backend Integration Status

The frontend application is fully integrated with the backend API as defined in the OpenAPI specification. The integration includes:

### Authentication Integration
- ✅ Email/Password Login: Implemented using `/api/auth/authenticate` endpoint
- ✅ User Registration: Implemented using `/api/auth/register` endpoint
- ✅ Google Sign-In: Implemented using `/api/auth/google` endpoint
- ✅ Token Refresh: Implemented using `/api/auth/refresh-token` endpoint
  - Automatic token refresh when expired
  - Seamless retry of failed requests after token refresh

### Business Management Integration
- ✅ Create Business: Implemented using `/api/business/add` endpoint
- ✅ Update Business: Implemented using `/api/business/update/{id}` endpoint
- ✅ Get Business Details: Implemented using `/api/business/get/{id}` endpoint
- ✅ List All Businesses: Implemented using `/api/business/all` endpoint
- ✅ Add Office Address: Implemented using `/api/business/add/office-address/{id}` endpoint

### Invoice Management Integration
- ✅ Create Invoice: Implemented using `/api/invoices/add` endpoint
- ✅ Update Invoice: Implemented using `/api/invoices/update/{id}` endpoint
- ✅ Delete Invoice: Implemented using `/api/invoices/delete/{id}` endpoint
- ✅ Get Invoice Details: Implemented using `/api/invoices/get/{id}` endpoint
- ✅ List All Invoices: Implemented using `/api/invoices/all` endpoint
- ✅ Mark Invoice as Paid: Implemented using `/api/invoices/{id}/mark-paid` endpoint
- ✅ Restore Deleted Invoice: Implemented using `/api/invoices/restore/{id}` endpoint
- ✅ Export Invoice as PDF: Implemented using `/api/invoices/{id}/export/pdf` endpoint
- ✅ Preview Invoice as PDF: Implemented using `/api/invoices/{id}/preview/pdf` endpoint
- ✅ Export All Invoices: Implemented using `/api/invoices/export/pdf` and `/api/invoices/export/csv` endpoints

### Recent Improvements
1. **Enhanced Token Management**:
   - Implemented automatic token refresh when expired
   - Added refresh token storage and management
   - Improved error handling for authentication failures

2. **Seamless Authentication Experience**:
   - Added retry mechanism for failed requests due to expired tokens
   - Implemented proper token validation and expiration checking

3. **Google Authentication Setup**:
   - Added clear instructions for setting up Google OAuth client ID
   - Ensured proper integration with Google authentication API

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:8087/invokta |
| REACT_APP_ENV | Environment (development/production) | development |
| REACT_APP_GOOGLE_CLIENT_ID | Google OAuth Client ID | - |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
