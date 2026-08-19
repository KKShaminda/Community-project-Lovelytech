import { buildUrl, request, getAuthHeaders } from './api.js'

const API_URL = buildUrl('/users')


export const loginUser = async (credentials, rememberMe = true) => {
  try {
    const data = await request(`${API_URL}/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const storage = rememberMe ? localStorage : sessionStorage;

    if (data.token) {
      storage.setItem("token", data.token);
    }
    if (data.user) {
      storage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
};

export const signIn = async (email, password, rememberMe = true) => {
  return loginUser({ email, password }, rememberMe);
};

export const registerUser = async (userData) => {
  try {
    return await request(`${API_URL}/register`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  } catch (error) {
    throw new Error(error.message || "Registration failed");
  }
};

export const signUp = async (userData) => {
  return registerUser(userData);
};

export const logoutUser = async () => {
  try {
    const data = await request(`${API_URL}/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberEmail");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return data;
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberEmail");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    throw new Error(error.message || "Logout failed");
  }
};

export const signOut = logoutUser;

export const changePassword = async (currentPassword, newPassword) => {
  try {
    return await request(`${API_URL}/change-password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (error) {
    throw new Error(error.message || "Failed to change password");
  }
};

export const getUserProfile = async () => {
  try {
    return await request(`${API_URL}/profile`, {
      method: "GET",
    });
  } catch (error) {
    throw new Error(error.message || "Failed to fetch profile");
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const data = await request(`${API_URL}/update-profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update profile");
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const rememberEmail = (email) => {
  if (email) {
    localStorage.setItem("rememberEmail", email);
  } else {
    localStorage.removeItem("rememberEmail");
  }
};

export const getRememberedEmail = () => {
  return localStorage.getItem("rememberEmail");
};