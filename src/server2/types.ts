export enum ClientRole {
    SENSOR = 'sensor',
    MONITOR = 'monitor',
    ADMIN = 'admin',
}

export type SensorData = {
    hostname: string,
    temperature: number
};

export type TemperatureAlertData = {
    threshold: number,
    sensorData: SensorData
}
