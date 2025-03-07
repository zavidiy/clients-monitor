import {makeAutoObservable} from 'mobx';
import {SensorData, TemperatureAlertData} from './types';

export interface IAppModelPresenter {
    get temperatureThreshold(): number;

    get requestSensorsInterval(): number;

    get lastTemperatureAlert(): TemperatureAlertData | undefined;

    get isTimeToRequestSensorsData(): boolean;
}

export interface IAppModel extends IAppModelPresenter {
    setTemperatureAlert(data: SensorData): void;

    setTimeToRequestSensorsData(): void;

    resetSensorsDataRequestMark(): void;
}

export class AppModel implements IAppModel {
    readonly temperatureThreshold: number
    readonly requestSensorsInterval: number

    private _lastTemperatureAlert?: TemperatureAlertData = undefined;
    private _isTimeToRequestSensorsData: boolean = false

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

    get isTimeToRequestSensorsData(): boolean {
        return this._isTimeToRequestSensorsData;
    }

    get lastTemperatureAlert(): TemperatureAlertData | undefined {
        return this._lastTemperatureAlert;
    }

    setTemperatureAlert(data: SensorData) {
        this._lastTemperatureAlert = {
            threshold: this.temperatureThreshold,
            sensorData: data
        }
    }

    setTimeToRequestSensorsData() {
        this._isTimeToRequestSensorsData = true;
    }

    resetSensorsDataRequestMark() {
        this._isTimeToRequestSensorsData = false;
    }
}