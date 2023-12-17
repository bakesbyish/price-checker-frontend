import axios from "axios";
import { getCookieInBrowser } from "./utils";

const baseURL = `http://${getCookieInBrowser("ip")}:8080`;

export const productsAPI = axios.create({
  baseURL: `${baseURL}/algolia/products`,
});
productsAPI.defaults.headers.common["Content-Type"] = "application/json";
