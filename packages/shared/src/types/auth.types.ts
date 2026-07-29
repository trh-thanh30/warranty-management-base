export type AuthUserRole = "admin" | "moderator" | "customer" | null;

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AuthUserRole;
  permissions: string[];
  status: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminLoginBody = {
  usernameOrEmail: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

export type RefreshResponse = {
  access_token: string;
};

export type UpdateProfileBody = {
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

export type ChangePasswordBody = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};
