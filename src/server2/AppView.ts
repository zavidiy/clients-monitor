import {Server} from 'socket.io';
import {ClientRole, SensorData, TemperatureAlertData} from './types';

export class AppView {
    private handleSensorReport?: ((data: SensorData) => void);

    constructor(readonly io: Server) {
        this.initUserInteraction();
    }

    initHandlers(
        handleSensorReport?: ((data: SensorData) => void),
    ): void {
        this.handleSensorReport = handleSensorReport;
    }

    requestSensorsData(): void {
        this.io.to(ClientRole.SENSOR).emit('requestData');
    }

    broadcastTemperatureExceed(data: TemperatureAlertData): void {
        this.io.to(ClientRole.MONITOR).emit('temperatureAlert', data);
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
                        this.handleSensorReport?.(data);
                    });

                    break;
            }
        });
    }
}