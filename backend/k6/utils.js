import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

let cachedToken = null;
let tokenFetchedAt = 0;

export function authHeaders() {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function getToken() {
  const now = Date.now();
  if (cachedToken && now - tokenFetchedAt < 55 * 60 * 1000) return cachedToken; // reuse <55m
  const email = __ENV.LOGIN_EMAIL;
  const password = __ENV.LOGIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "LOGIN_EMAIL & LOGIN_PASSWORD env required for auth endpoints"
    );
  }
  const res = http.post(
    `${BASE_URL}/v1/api/login`,
    JSON.stringify({ email, password }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(res, { "login status 200": (r) => r.status === 200 });
  const json = res.json();
  cachedToken = json?.access_token;
  tokenFetchedAt = now;
  if (!cachedToken) throw new Error("Failed to obtain access_token");
  return cachedToken;
}

export function randomString(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export { BASE_URL, check, sleep, http };
