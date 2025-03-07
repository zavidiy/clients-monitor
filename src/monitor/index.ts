import {io} from 'socket.io-client';
import si from 'systeminformation';
import * as dotenv from 'dotenv';

import {ClientRole, TemperatureAlertData} from '../server2/types';

dotenv.config();

async function bootstrap() {
    const {hostname} = await si.osInfo();

    const {PORT: port, SERVER_URL: url} = process.env;

    if (!port) {
        throw new Error('PORT is not defined');
    }

    if (!url) {
        throw new Error('SERVER_URL is not defined');
    }

    const SERVER_URL = `${url}:${port}`;

    console.log(`Connect to ${SERVER_URL}`)

    const socket = io(SERVER_URL, {
        auth: {
            role: ClientRole.MONITOR
        },
    });

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('temperatureAlert', ({threshold, sensorData: {hostname, temperature}}: TemperatureAlertData) => {
        console.log(`Sensor "${hostname}" exceeded maximum temperature: ${temperature} (max ${threshold}) °C`);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

bootstrap();