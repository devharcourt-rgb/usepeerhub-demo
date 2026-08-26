export enum SystemStatus {
  OPERATIONAL = "operational",
  MAINTENANCE = "maintenance",
  DOWN = "down",
}

export interface ISystemInfo {
  status: SystemStatus;
  message: String;
}
