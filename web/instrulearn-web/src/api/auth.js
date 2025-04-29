import axios from "axios";

const API_BASE_URL =
  "https://instrulearnapplication.azurewebsites.net/api/Auth";
if (
  axios.interceptors.request.handlers &&
  axios.interceptors.request.handlers.length > 0
) {
  axios.interceptors.request.eject(axios.interceptors.request.handlers[0]);
}

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error(
        "Unauthorized error detected. Token may be invalid or expired."
      );
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Login`, credentials);

    if (
      response.data &&
      response.data.isSucceed &&
      response.data.data &&
      response.data.data.token
    ) {
      localStorage.setItem("authToken", response.data.data.token);

      if (response.data.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }

      return response.data.data;
    } else {
      throw new Error("Token not received from server");
    }
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const loginWithGoogle = async (idToken, displayName) => {
  try {
    console.log("Sending Google login request with:", {
      idToken: idToken,
      fullName: displayName,
    });

    const response = await axios.post(`${API_BASE_URL}/google-login`, {
      idToken: idToken,
      fullName: displayName,
    });

    console.log("Google login response:", response.data);

    if (response.data && response.data.isSucceed && response.data.data) {
      // Lưu token và refresh token
      localStorage.setItem("authToken", response.data.data.token);
      if (response.data.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }

      // Lưu thông tin người dùng
      if (response.data.data.user) {
        localStorage.setItem("fullName", response.data.data.user.fullName);
        localStorage.setItem("email", response.data.data.user.email);
        localStorage.setItem("avatar", response.data.data.user.avatar);
      }

      return response.data;
    } else {
      throw new Error(response.data?.message || "Google login failed");
    }
  } catch (error) {
    console.error("Google login error:", error.response?.data || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Register`, userData);
    return response.data;
  } catch (error) {
    console.error(
      "Registration failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  return !!token;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("Authentication token not found");
    throw new Error("Không tìm thấy token xác thực");
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/Profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.isSucceed && response.data.data) {
      return response.data.data;
    } else {
      console.error("API error:", response.data.message);
      throw new Error(
        response.data.message || "Không thể lấy thông tin người dùng"
      );
    }
  } catch (error) {
    console.error(
      "Profile request failed:",
      error.response?.data || error.message
    );

    if (error.response && error.response.status === 401) {
      console.error("Unauthorized: Invalid or expired token");
    }

    throw error;
  }
};

export const verifyToken = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const response = await axios.get(`${API_BASE_URL}/ValidateToken`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data && response.data.isSucceed;
  } catch (error) {
    console.error("Token validation failed:", error.response?.status);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      return false;
    }
    return false;
  }
};

export const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const token = localStorage.getItem("authToken");

  if (!refreshToken || !token) {
    console.error("Refresh token or auth token not found");
    return false;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/RefreshToken`, {
      token: token,
      refreshToken: refreshToken,
    });

    if (
      response.data &&
      response.data.isSucceed &&
      response.data.data &&
      response.data.data.token
    ) {
      localStorage.setItem("authToken", response.data.data.token);

      if (response.data.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error(
      "Token refresh failed:",
      error.response?.data || error.message
    );
    return false;
  }
};
