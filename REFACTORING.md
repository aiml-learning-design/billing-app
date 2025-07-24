# API Refactoring Documentation

## Overview
This document outlines the changes made to refactor the codebase to align with the new API structure defined in the updated Swagger specification.

## Changes Made

### 1. API Service Updates
- Updated the token handling in `api.js` to work with the new response structure
- Modified token extraction to use `accessToken` instead of `token`
- Added support for the new authentication response structure

### 2. Authentication Context Updates
- Updated the `AuthContext.jsx` to handle the new authentication response structure
- Modified token extraction in login, register, and refresh token functions
- Updated JWT decoding to use the new token field names

### 3. Business Setup Page Refactoring
- Updated the validation schema to match the new `BusinessDetailsDTO` structure
- Added validation for office addresses with the required fields
- Changed the form's initial values to match the new structure
- Updated the API endpoint from `/app/businesses` to `/api/business/add`
- Completely redesigned the form UI to match the new data structure:
  - Renamed `name` field to `businessName`
  - Added fields for `gstin` and `pan`
  - Removed fields that are not in the new DTO (teamSize, currency, usingRefrensFor, creationReason)
  - Added a section for office addresses with all required fields
  - Implemented functionality to add and remove office addresses

## API Changes Summary

### Authentication Endpoints
- Response structure changed to include `accessToken` and nested `authentication` object
- Token refresh mechanism updated to handle the new structure

### Business Endpoints
- Changed from `/app/businesses` to `/api/business/add`
- Updated request/response structure to use `BusinessDetailsDTO`
- Added support for office addresses as a required array

## Testing
The following scenarios should be tested to ensure the refactoring works correctly:
1. User registration and login
2. Token refresh when expired
3. Creating a new business with the updated form
4. Adding and removing office addresses
5. Form validation for all required fields

## Future Considerations
- The Google login functionality may need further updates as it's not explicitly defined in the new Swagger specification
- Additional error handling may be needed for the new API response structures
- UI improvements could be made to enhance the user experience with the new form structure