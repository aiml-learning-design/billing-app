/**
 * Password strength utility functions
 */

// Check if password has at least 8 characters
export const hasMinLength = (password) => password.length >= 8;

// Check if password has at least one uppercase letter
export const hasUppercase = (password) => /[A-Z]/.test(password);

// Check if password has at least one lowercase letter
export const hasLowercase = (password) => /[a-z]/.test(password);

// Check if password has at least one number
export const hasNumber = (password) => /[0-9]/.test(password);

// Check if password has at least one special character
export const hasSpecialChar = (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

// Calculate password strength score (0-4)
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  if (hasMinLength(password)) score++;
  if (hasUppercase(password)) score++;
  if (hasLowercase(password)) score++;
  if (hasNumber(password)) score++;
  if (hasSpecialChar(password)) score++;
  
  return Math.min(score, 4);
};

// Get password strength label based on score
export const getPasswordStrengthLabel = (score) => {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return '';
  }
};

// Get password strength color based on score
export const getPasswordStrengthColor = (score) => {
  switch (score) {
    case 0:
      return '#e53935'; // Red
    case 1:
      return '#ff9800'; // Orange
    case 2:
      return '#fdd835'; // Yellow
    case 3:
      return '#8bc34a'; // Light Green
    case 4:
      return '#4caf50'; // Green
    default:
      return '#e0e0e0'; // Grey
  }
};

// Get password strength width percentage based on score
export const getPasswordStrengthWidth = (score) => {
  return `${(score / 4) * 100}%`;
};