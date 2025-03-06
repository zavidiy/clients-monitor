import {AppModel} from './AppModel';
import {AppView} from './AppView';
import {SensorData} from './types';

export class AppController {
    constructor(readonly model: AppModel, readonly view: AppView) {
        this.setupViewHandlers();
        this.startRequestSensorsCycle();
    }

    handleSensorReport(data: SensorData): void {
        let {temperatureThreshold: threshold} = this.model;

        if (data.temperature > threshold) {
            this.view.broadcastTemperatureExceed({
                threshold: threshold,
                sensorData: data,
            });
        }
    }

    private setupViewHandlers() {
        this.view.initHandlers(
            this.handleSensorReport.bind(this),
        );
    }

    private startRequestSensorsCycle() {
        setInterval(() => {
            this.view.requestSensorsData();
        }, this.model.requestSensorsInterval);
    }
}