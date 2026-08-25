const normalizeUrlPart = (value = "") => value.replace(/\/+$/, "");
const ensureLeadingSlash = (value = "") => (value.startsWith("/") ? value : `/${value}`);

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").trim();
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ""));
const apiPrefix = ensureLeadingSlash(
  (import.meta.env.VITE_API_PREFIX || "/api/users").trim()
);
const API_URL = `${normalizedBaseUrl}${apiPrefix}`;

console.log("🔗 Auth API URL:", API_URL);

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const getActiveAuthStorage = () => {
  if (localStorage.getItem("token")) return localStorage;
  if (sessionStorage.getItem("token")) return sessionStorage;
  return localStorage;
};

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    throw new Error(
      `Unable to reach the authentication service at ${API_URL}. Make sure the backend is running on http://localhost:5000.`
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || "Request failed";
    throw new Error(message);
  }

  return data;
};

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

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-updated"));
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
    }).catch(() => ({ success: true }));

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberEmail");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-updated"));
    }

    return data || { success: true };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberEmail");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-updated"));
    }
    return { success: true };
  }
};

export const signOut = logoutUser;

export const changePassword = async (currentPassword, newPassword, confirmNewPassword = newPassword) => {
  try {
    return await request(`${API_URL}/change-password`, {
      method: "PUT",
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
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
      getActiveAuthStorage().setItem("user", JSON.stringify(data.user));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-updated"));
      }
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update profile");
  }
};

export const updateUserProfilePicture = async (profilePictureFile) => {
  try {
    const formData = new FormData();
    formData.append("profilePicture", profilePictureFile);

    const data = await request(`${API_URL}/update-profile-picture`, {
      method: "PUT",
      body: formData,
    });

    if (data.user) {
      getActiveAuthStorage().setItem("user", JSON.stringify(data.user));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-updated"));
      }
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update profile picture");
  }
};

export const deleteUserProfilePicture = async () => {
  try {
    const data = await request(`${API_URL}/delete-profile-picture`, {
      method: "DELETE",
    });

    if (data.user) {
      getActiveAuthStorage().setItem("user", JSON.stringify(data.user));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-updated"));
      }
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to delete profile picture");
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

export const getUserAddresses = async () => {
  return request(`${API_URL}/addresses`, { method: "GET" });
};

export const addUserAddress = async (address) => {
  return request(`${API_URL}/addresses`, {
    method: "POST",
    body: JSON.stringify(address),
  });
};

export const updateUserAddress = async (addressId, address) => {
  return request(`${API_URL}/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(address),
  });
};

export const deleteUserAddress = async (addressId) => {
  return request(`${API_URL}/addresses/${addressId}`, { method: "DELETE" });
};

export const setDefaultUserAddress = async (addressId) => {
  return request(`${API_URL}/addresses/${addressId}/default`, { method: "PATCH" });
};