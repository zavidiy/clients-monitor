import {Server} from 'socket.io';
import {ClientRole, SensorData, TemperatureAlertData} from './types';
import {AppController} from './AppController';
import {AppModel} from './AppModel';
import {reaction} from 'mobx';

export class AppView {
    constructor(readonly io: Server, readonly model: AppModel, readonly controller: AppController) {
        this.initModelHandlers();
        this.initUserInteraction();
    }

    private initUserInteraction() {
        this.io.use((socket, next) => {
            const role = socket.handshake.auth.role;

            if (!Object.values(ClientRole).includes(role)) {
                return next(new Error(`Role ${role} is not supported`));
            }

            next();
        })

        this.io.on('connection', (socket) => {
            const role = socket.handshake.auth.role;

            console.log(`Client connected with role: ${role}`);

            socket.join(role);

            switch (role) {
                case ClientRole.SENSOR:
                    socket.on('report', async (data: SensorData) => {
                        this.controller.reportSensorData(data);
                    });

                    break;
            }
        });
    }

    private initModelHandlers() {
        reaction(() => this.model.temperatureAlert, this.handleTemperatureAlert.bind(this));
        reaction(() => this.model.sensorsDataRequestBroadcast, this.handleSensorsDaraRequestBroadcast.bind(this))
    }

    private handleTemperatureAlert(data?: TemperatureAlertData) {
        if (!data) {
            return;
        }

        console.log('broadcastTemperatureExceed', data);

        this.io.to(ClientRole.MONITOR).emit('temperatureAlert', data);
    }

    private handleSensorsDaraRequestBroadcast(broadcast: boolean) {
        if (!broadcast) {
            return;
        }

        console.log('Request sensors data');

        this.io.to(ClientRole.SENSOR).emit('requestData');

        this.controller.finishSensorsDataRequestBroadcast();
    }
}