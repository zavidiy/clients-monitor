import {io} from 'socket.io-client';
import si from 'systeminformation';
import * as dotenv from 'dotenv';

import {ClientRole} from '../server2/types';

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
            role: ClientRole.SENSOR
        },
    });

    socket.on('requestData', async () => {
        const {main: temperature} = await si.cpuTemperature();

        let data = {hostname, temperature};

        socket.emit('report', data);

        console.log('Data sent', data);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

bootstrap();