import {Server} from 'socket.io';
import http from 'http';
import {AppModel} from './AppModel';
import {AppView} from './AppView';
import {AppController} from './AppController';
import * as dotenv from 'dotenv';

dotenv.config();

const {
    PORT: port,
} = process.env;

if (!port) {
    throw new Error('PORT is not defined');
}

const server = http.createServer();
const io = new Server(server);

const model = new AppModel({
    requestSensorsInterval: 5000,
    temperatureThreshold: 28
});
const view = new AppView(io);
const presenter = new AppController(model, view);


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});