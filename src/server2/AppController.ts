import {IAppModel} from './AppModel';
import {SensorData} from './types';

export class AppController {
    constructor(readonly model: IAppModel) {
        this.startCycleOnRequestSensorsData();
    }

    handleSensorData(data: SensorData): void {
        let {temperatureThreshold: threshold} = this.model;

        if (data.temperature > threshold) {
            this.model.setTemperatureAlert(data);
        }
    }

    finishSensorsDataRequest() {
        this.model.resetSensorsDataRequestMark();
    }

    private startCycleOnRequestSensorsData() {
        setInterval(() => {
            this.model.setTimeToRequestSensorsData();
        }, this.model.requestSensorsInterval);
    }
}