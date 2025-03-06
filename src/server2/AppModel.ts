import {makeAutoObservable} from 'mobx';
import {SensorData, TemperatureAlertData} from './types';

export class AppModel {
    readonly temperatureThreshold: number
    readonly requestSensorsInterval: number

    temperatureAlert?: TemperatureAlertData;
    sensorsDataRequestBroadcast: boolean = false

    constructor(config: {
        temperatureThreshold: number
        requestSensorsInterval: number
    }) {
        ({
            temperatureThreshold: this.temperatureThreshold,
            requestSensorsInterval: this.requestSensorsInterval
        } = config);

        makeAutoObservable(this);
    }

    setTemperatureAlert(data: SensorData) {
        this.temperatureAlert = {
            threshold: this.temperatureThreshold,
            sensorData: data
        }
    }

    broadcastSensorsDataRequest() {
        this.sensorsDataRequestBroadcast = true;
    }

    finishSensorsDataRequestBroadcast() {
        this.sensorsDataRequestBroadcast = false;
    }
}