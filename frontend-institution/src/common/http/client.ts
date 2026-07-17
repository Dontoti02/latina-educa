import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axiosInstance from "axios";
import { FormRequest } from "../util/form-requests";
import { tryHttpRequest } from "./try";
import { SessionStore } from "@/common/store";
import { Environment } from "@/common/services/environment";

const FORM_DATA_HEADERS = { "Content-Type": "multipart/form-data" };

const JSON_HEADERS: {
  [key: string]: string | string[];
} = {
  "Content-Type": "application/json",
};

const urlBrowser = window.location.href;

const getAllDomain = (url: string) => {
  url = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");

  const parts = url.split("/");

  return parts[0];
};

JSON_HEADERS["X-subdomain"] = getAllDomain(urlBrowser);

const isProduction = Environment.isProduction;

if (!isProduction) JSON_HEADERS["X-subdomain"] = Environment.tenantSubdomain;

export class HttpClient {
  readonly #http: AxiosInstance;

  constructor() {
    this.#http = axiosInstance.create({
      baseURL: Environment.serverUrl,
      headers: JSON_HEADERS,
    });
    this.#http.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const sessionStore = SessionStore();
        if (!sessionStore.token) return config;

        config.headers.Authorization = `Bearer ${sessionStore.token}`;

        return config;
      }
    );
  }

  async get<T>(url: string) {
    return tryHttpRequest<T>(() => this.#http.get(url));
  }

  async post<T>(url: string, data: object) {
    return tryHttpRequest<T>(() => this.#http.post(url, data));
  }
  async postImage<T>(url: string, data: object, headers: object) {
    return tryHttpRequest<T>(() => this.#http.post(url, data, headers))
  }

  async put<T>(url: string, data?: object) {
    return tryHttpRequest<T>(() => this.#http.put(url, data));
  }

  async delete<T>(url: string) {
    return tryHttpRequest<T>(() => this.#http.delete(url));
  }

  async postFormData<T>(url: string, data: object) {
    const formData = FormRequest.build(data as object);
    return tryHttpRequest<T>(() =>
      this.#http.post(url, formData, {
        headers: {
          ...JSON_HEADERS,
          ...FORM_DATA_HEADERS,
        },
      })
    );
  }



  async getBlob(url: string) {
    return this.#http.get(url, {
      responseType: "blob",
    });
  }

  async postBlob(url: string, data: object) {
    return this.#http.post(url, data, {
      responseType: "blob",
    });
  }
}

export default new HttpClient();
