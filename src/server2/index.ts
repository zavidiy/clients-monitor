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
    requestSensorsInterval: 1000,
    temperatureThreshold: 28
});

const controller = new AppController(model);

const view = new AppView(io, model, controller);


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});