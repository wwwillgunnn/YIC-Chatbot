import deviceDefaults from "@/services/device_defaults.json";

export type DeviceDefaults = typeof deviceDefaults;
export type DeviceName = keyof DeviceDefaults;
export type DeviceAction = keyof DeviceDefaults[DeviceName]["payloads"];

// Minimal whitelist the router/NLU needs
export const DEVICE_WHITELIST = Object.fromEntries(
  Object.entries(deviceDefaults).map(([name, cfg]) => [
    name,
    { actions: Object.keys(cfg.payloads) }
  ])
) as Record<DeviceName, { actions: DeviceAction[] }>;
