"use client";

const DEVICE_COOKIE_NAME = "device_id";
const DEVICE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length !== 2) return null;

  return parts.pop()?.split(";").shift() || null;
}

function writeDeviceCookie(deviceId: string) {
  document.cookie = `${DEVICE_COOKIE_NAME}=${deviceId}; path=/; max-age=${DEVICE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function getDeviceId() {
  return readCookie(DEVICE_COOKIE_NAME);
}

export function ensureDeviceId() {
  const existingDeviceId = getDeviceId();
  if (existingDeviceId) return existingDeviceId;

  const newDeviceId = crypto.randomUUID();
  writeDeviceCookie(newDeviceId);
  return newDeviceId;
}
