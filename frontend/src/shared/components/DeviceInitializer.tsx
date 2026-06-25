"use client";

import { useEffect } from "react";
import { ensureDeviceId } from "@/shared/utils/device";

export function DeviceInitializer() {
  useEffect(() => {
    ensureDeviceId();
  }, []);

  return null;
}
