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

    private startRequestSensorsCycle() {
        setInterval(() => {
            this.view.requestSensorsData();
        }, this.model.requestSensorsInterval);
    }
}