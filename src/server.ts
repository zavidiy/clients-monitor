import express from 'express';
import {createServer} from 'http';
import * as dotenv from 'dotenv';
import {Server, Socket} from 'socket.io';
import mongoose from 'mongoose';
import Chat from './server/Chat';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

async function bootstrap() {
    const {
        PORT: port,
        TELEGRAM_BOT_TOKEN: telegramBotToken,
        TEMPERATURE_THRESHOLD: thresholdStr,
        MONGO_DB_URL: mongoDbUrl
    } = process.env;

    if (!port) {
        throw new Error('PORT is not defined');
    }

    if (!telegramBotToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    if (!thresholdStr) {
        throw new Error('TEMPERATURE_THRESHOLD is not defined');
    }

    if (!mongoDbUrl) {
        throw new Error('MONGO_DB_URL is not defined');
    }

    const app = express();
    const server = createServer(app);
    const io = new Server(server);

    await mongoose.connect(mongoDbUrl);

    const bot = new TelegramBot(telegramBotToken, {polling: true});

    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            // Проверяем, существует ли уже чат в базе данных
            const existingChat = await Chat.findOne({chatId});

            if (existingChat) {
                bot.sendMessage(chatId, 'Вы уже зарегистрированы!');
            } else {
                // Создаем новый чат в базе данных
                const newChat = new Chat({chatId});
                await newChat.save();
                bot.sendMessage(chatId, 'Добро пожаловать! Ваш ID чата сохранен.');
            }
        } catch (error) {
            console.error('Ошибка при обработке команды /start:', error);
            bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз.');
        }
    });

    bot.onText(/\/settemp(.*)/, async (msg, match) => {
        const chatId = msg.chat.id;

        if (!match || !match[1]) {
            bot.sendMessage(chatId, 'Использование: /settemp <температура>');
            return;
        }

        const temperatureThreshold = parseFloat(match[1]);

        if (isNaN(temperatureThreshold)) {
            bot.sendMessage(chatId, 'Пожалуйста, укажите корректное число.');
            return;
        }

        try {
            // Обновляем пороговую температуру для чата
            await Chat.findOneAndUpdate(
                {chatId},
                {temperatureThreshold},
                {upsert: true, new: true}
            );

            bot.sendMessage(
                chatId,
                `Пороговая температура установлена на ${temperatureThreshold}°C.`
            );
        } catch (error) {
            console.error('Ошибка при установке температуры:', error);
            bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз.');
        }
    });

    async function broadcastMessage(message: string) {
        try {
            const chats = await Chat.find({});

            for (const chat of chats) {
                try {
                    await bot.sendMessage(chat.chatId, message);
                    console.log(`Сообщение отправлено в чат ${chat.chatId}`);
                } catch (error) {
                    console.error(`Ошибка при отправке сообщения в чат ${chat.chatId}:`, error);
                }
            }
        } catch (error) {
            console.error('Ошибка при получении чатов из базы данных:', error);
        }
    }

    interface ClientData {
        lastSeen: number;
        temperature: number | null;
    }

    const clients: Record<string, ClientData> = {};

    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        // Добавляем клиента в список
        clients[socket.id] = {
            lastSeen: Date.now(),
            temperature: null,
        };

        // Отправляем сообщение в Telegram о новом клиенте
        broadcastMessage(`Клиент ${socket.id} подключился.`);

        // Обработка данных от клиента
        socket.on('report', async (data: { hostname: string, temperature: number }) => {
            const {hostname, temperature} = data;

            // Обновляем данные клиента
            clients[socket.id] = {
                lastSeen: Date.now(),
                temperature,
            };

            console.log(`Data received from ${socket.id}:`, data);

            // Получаем пороговую температуру для всех чатов
            const chats = await Chat.find({});

            for (const chat of chats) {
                if (temperature > chat.temperatureThreshold) {
                    bot.sendMessage(
                        chat.chatId,
                        `Клиент ${socket.id} превысил температуру: ${temperature}°C`
                    );
                }
            }
        });

        // Обработка отключения клиента
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);

            // Отправляем сообщение в Telegram об отключении клиента
            broadcastMessage(`Клиент ${socket.id} отключился.`);

            // Удаляем клиента из списка
            delete clients[socket.id];
        });
    });

    function pollClients() {
        io.emit('requestData');
    }

    setInterval(pollClients, 5000);

    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

bootstrap();