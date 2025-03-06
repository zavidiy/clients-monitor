import { Schema, model } from 'mongoose';

const chatSchema = new Schema({
    chatId: { type: Number, required: true, unique: true },
    temperatureThreshold: { type: Number, default: 60 },
});

const Chat = model('Chat', chatSchema);

export default Chat;