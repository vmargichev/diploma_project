import { useAuthStore } from "../store/auths.js";
import { apiInstance } from "./axios.js";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Cookie from "js-cookie";
import Swal from "sweetalert2";

export const getRefreshToken = async () => {
  const refreshToken = Cookie.get("refresh_token");
  if (!refreshToken) {
    console.warn("No refresh token found.");
    return null; // Or throw an error if a refresh token is expected
  }

  try {
    const { data } = await axios.post("token/refresh/", { refresh: refreshToken });
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

export const register = async (full_name, email, password, password2) => {
  try {
    const { data, status } = await apiInstance.post("user/register/", {
      full_name,
      email,
      password,
      password2,
    });
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
    return;
  }

  if (isAccessTokenExpired(access_token)){
    const response = await getRefreshToken();
    if (response && response.access && response.refresh) {
    setAuthUser(response.access, response.refresh);
  } else {
    console.warn("Failed to refresh token or response was invalid.");
    // Handle the failure scenario (e.g., log user out)
  }
  } else{
    setAuthUser(access_token, refresh_token);
  }
};

export const setAuthUser = (access_token, refresh_token) => {
  Cookie.set("access_token", access_token, {
    expires: 1,
    secure: true,
  });
  Cookie.set("refresh_token", refresh_token, {
    expires: 5,
    secure: true,
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
    return true; // Or handle this case as needed
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