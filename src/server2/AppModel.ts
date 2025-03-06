export class AppModel {
    readonly temperatureThreshold: number
    readonly requestSensorsInterval: number

    constructor(config: {
        temperatureThreshold: number
        requestSensorsInterval: number
    }) {
        ({
            temperatureThreshold: this.temperatureThreshold,
            requestSensorsInterval: this.requestSensorsInterval
        } = config);
    }
}