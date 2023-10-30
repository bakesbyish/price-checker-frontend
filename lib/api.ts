import axios from "axios";
import { getCookie } from "./utils";

const baseURL = `http://${getCookie("ip")}:8080`;

export const productsAPI = axios.create({
  baseURL: `${baseURL}/algolia/products`,
});
productsAPI.defaults.headers.common["Content-Type"] = "application/json";
