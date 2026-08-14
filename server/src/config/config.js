import dotenv from 'dotenv';

// Load .env file for local development if present (production services like Render inject vars directly into process.env)
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not defined in environment variables.');
}

export const PORT = process.env.PORT || 4500;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aianalyiser';
export const JWT_SECRET = process.env.JWT_SECRET;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;