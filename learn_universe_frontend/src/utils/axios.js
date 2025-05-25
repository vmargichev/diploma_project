import axios from "axios";
import { API_BASE_URL} from "./constants.js";

export const apiInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
})