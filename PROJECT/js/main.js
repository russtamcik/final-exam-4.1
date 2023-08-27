import { ENDPOINT } from "./const.js";

const request = axios.create({
  baseURL: ENDPOINT,
  timeout: 10000,
});

export default request;
