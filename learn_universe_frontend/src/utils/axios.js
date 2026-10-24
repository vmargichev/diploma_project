import axios from "axios";
import Cookie from "js-cookie";
import { API_BASE_URL } from "./constants.js";
import { getRefreshToken, isAccessTokenExpired, logout, setAuthUser } from "./auth.js";

export const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { Accept: "application/json" },
});

let pendingRefresh = null;
apiInstance.interceptors.request.use(async (request) => {
  // Token endpoints must not invoke their own refresh interceptor.
  if (/^\/?user\/(token|register)/.test(request.url || "")) return request;
  let access = Cookie.get("access_token");
  if (Cookie.get("refresh_token") && isAccessTokenExpired(access)) {
    if (!pendingRefresh) {
      pendingRefresh = getRefreshToken().finally(() => { pendingRefresh = null; });
    }
    const tokens = await pendingRefresh;
    if (!tokens?.access) {
      logout();
      throw new Error("Your session expired. Please sign in again.");
    }
    setAuthUser(tokens.access, tokens.refresh || Cookie.get("refresh_token"));
    access = tokens.access;
  }
  if (access) request.headers.Authorization = `Bearer ${access}`;
  return request;
});
