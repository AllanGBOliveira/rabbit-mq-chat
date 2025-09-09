import amqp from 'amqplib';
import * as readline from 'node:readline';
import { saveMessage, getMessagesByQueue } from './db';

const user = 'meu_usuario';
const password = 'minha_senha';
const host = 'localhost';
const port = 5672;
const exchange = 'send-chat-message'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function sanitizeName(name: string): string {
    const sanitized = name.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    
    return sanitized;
}

async function postMessage(message: string, queue: string, senderName: string) {
    try {
        const connection = await amqp.connect(`amqp://${user}:${password}@${host}:${port}`);
        const channel = await connection.createChannel();
        await channel.assertExchange(exchange, 'direct', { durable: false });
        await channel.prefetch(1);
        const routingKey = `key_${queue}`;
        
        // Save message to database
        await saveMessage(senderName, message, queue);
        
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify({
            sender: senderName,
            content: message,
            timestamp: new Date().toISOString()
        })));
        
        console.log(`[${senderName}] Mensagem enviada: ${message}`);
        setTimeout(() => connection.close(), 500);
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
    }
}

async function consumeMessages(queue: string, otherUserName: string) {
    try {
        const connection = await amqp.connect(`amqp://${user}:${password}@${host}:${port}`);
        const channel = await connection.createChannel();
        await channel.assertExchange(exchange, 'direct', { durable: false });
        await channel.assertQueue(queue, { durable: false });
        const bindingKey = `key_${queue}`;
        await channel.bindQueue(queue, exchange, bindingKey);
        await channel.prefetch(1);

        // Load message history
        const history = await getMessagesByQueue(queue);
        console.log(`\n--- Histórico de mensagens (${history.length}) ---`);
        history.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            console.log(`[${time}] ${msg.sender}: ${msg.content}`);
        });
        console.log('--- Fim do histórico ---\n');

        console.log(`\nAguardando mensagens em '${queue}'...`);

        channel.consume(queue, async (msg) => {
            if (msg) {
                const { sender, content, timestamp } = JSON.parse(msg.content.toString());
                console.log(`\n[${new Date(timestamp).toLocaleTimeString()}] ${sender}: ${content}`);
                console.log(`Digite sua mensagem (ou 'sair' para sair):`);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Erro ao consumir mensagens:", error);
    }
}

async function startChat() {
    rl.question('Qual é o seu nome? ', async (myUserName) => {
        const myQueue = `${sanitizeName(myUserName)}_fila`;

        rl.question('Para qual usuário você quer conversar? ', async (otherUserName) => {
            const otherQueue = `${sanitizeName(otherUserName)}_fila`;

            console.log(`\nBem-vindo, ${myUserName}! Você está conectado com ${otherUserName}.\n`);
            console.log(`Suas mensagens serão enviadas para a fila '${otherQueue}'`);
            console.log(`E você ouvirá na fila '${myQueue}'`);

            consumeMessages(myQueue, otherUserName);

            rl.on('line', (input) => {
                postMessage(input, otherQueue, myUserName);
            });
        });
    });
}

startChat();