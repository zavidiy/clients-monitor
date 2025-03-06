import {io} from 'socket.io-client';
import si from 'systeminformation';
import * as dotenv from 'dotenv';

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

    const socket = io(SERVER_URL);

    // Обработка запроса данных от сервера
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