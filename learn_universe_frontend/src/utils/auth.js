import { useAuthStore } from "../store/auths.js";
import { apiInstance } from "./axios.js";
import jwt_decode from "jwt-decode";
import Cookie from "js-cookie";
import Swal from "sweetalert2";

export const getRefreshToken = async () => {
  const refreshToken = Cookie.get("refresh_token");
  if (!refreshToken) {
    console.warn("No refresh token found.");
    return null;
  }

  try {
    const { data } = await apiInstance.post("user/token/refresh/", { refresh: refreshToken });
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || "Failed to refresh token.";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
    });
    return null;
  }
};

export const login = async (email, password) => {
  try {
    const { data, status } = await apiInstance.post("user/token", {
      email,
      password,
    });

    if (status === 200) {
      setAuthUser(data.access, data.refresh);
    }

    return { data, error: null };
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || "Something went wrong";

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
    });

    return {
      data: null,
      error: error.response?.data || "Something went wrong",
    };
  }
};

export const register = async (full_name, email, password, password2, teacher_request) => {
  try {
    Cookie.remove("access_token");
    Cookie.remove("refresh_token");
    const { data, status } = await apiInstance.post("user/register/", {
      full_name,
      email,
      password,
      password2,
    });
    if (teacher_request) {
      await apiInstance.post(`user/request-teacher/${data.id}/`);
    }
    if (status === 201) {
      await Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Your account has been created successfully.",
      });

      await login(email, password);
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
     const errorMessage = error.response?.data?.detail || error.message || "Something went wrong";

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
    });

    return {
      data: null,
      error: error.response?.data || "Something went wrong",
    };
  }
};

export const logout = () => {
  Cookie.remove("access_token");
  Cookie.remove("refresh_token");
  useAuthStore.getState().setUser(null);
};

export const setUser = async () => {

  const access_token = Cookie.get("access_token");
  const refresh_token = Cookie.get("refresh_token");

  if (!access_token || !refresh_token) {
    throw new Error("No tokens found");
  }


  if (isAccessTokenExpired(access_token)) {
    try {
      const response = await getRefreshToken();

      if (!response || !response.access) {
        throw new Error("Invalid refresh response");
      }

      setAuthUser(response.access, response.refresh || refresh_token);
    } catch (error) {
      Cookie.remove("access_token");
      Cookie.remove("refresh_token");
      throw new Error("refreshed the tokens");
    }
  } else {
    setAuthUser(access_token, refresh_token);
  }
};

export const setAuthUser = (access_token, refresh_token) => {
  Cookie.set("access_token", access_token, {
    expires: 1,
    secure: window.location.protocol === "https:",
    sameSite: "lax",
  });
  Cookie.set("refresh_token", refresh_token, {
    expires: 5,
    secure: window.location.protocol === "https:",
    sameSite: "lax",
  });

  let user = null;
try {
  user = jwt_decode(access_token);
} catch (error) {
  console.error("Error decoding access token");
    // Consider additional error handling:
    Cookie.remove("access_token");
    Cookie.remove("refresh_token");
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setLoading(false);
    return;
}

if (user) {
  useAuthStore.getState().setUser(user);
}
  useAuthStore.getState().setLoading(false);
};

export const isAccessTokenExpired = (token) => {
  if (!token) {
    return true;
  }
  try {
    const decoded = jwt_decode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Consider the token expired if decoding fails
  }
};