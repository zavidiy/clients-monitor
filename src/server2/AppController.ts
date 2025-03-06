import {AppModel} from './AppModel';
import {SensorData} from './types';

export class AppController {
    constructor(readonly model: AppModel) {
        this.startRequestSensorsCycle();
    }

    reportSensorData(data: SensorData): void {
        let {temperatureThreshold: threshold} = this.model;

        if (data.temperature > threshold) {
            this.model.setTemperatureAlert(data);
        }
    }

    finishSensorsDataRequestBroadcast() {
        this.model.finishSensorsDataRequestBroadcast();
    }

    private startRequestSensorsCycle() {
        setInterval(() => {
            this.model.broadcastSensorsDataRequest();
        }, this.model.requestSensorsInterval);
    }
}