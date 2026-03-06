import { Request } from "express";

// Match the existing user structure from Express Request
export interface AuthRequest extends Request {
  userId: string; // If you need a separate userId field
  user?: {
    _id: string;  // Use _id instead of id to match the base type
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: "user" | "admin";
  };
}

export interface JwtPayload {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}