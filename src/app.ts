import amqp from 'amqplib';
import * as readline from 'node:readline';

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


async function postMessage(message: string, queue: string) {
    try {
        const connection = await amqp.connect(`amqp://${user}:${password}@${host}:${port}`);
        const channel = await connection.createChannel();
        await channel.assertExchange(exchange, 'direct', { durable: false });
        await channel.prefetch(1);
        const routingKey = `key_${queue}`;
        channel.publish(exchange, routingKey, Buffer.from(message));
        setTimeout(() => connection.close(), 500);
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
    }
}

async function consumeMessages(queue: string, senderName: string) {
    try {
        const connection = await amqp.connect(`amqp://${user}:${password}@${host}:${port}`);
        const channel = await connection.createChannel();
        await channel.assertExchange(exchange, 'direct', { durable: false });
        await channel.assertQueue(queue, { durable: false });
        const bindingKey = `key_${queue}`;
        await channel.bindQueue(queue, exchange, bindingKey);
        await channel.prefetch(1);

        console.log(`\n[${senderName}] - Aguardando mensagens em '${queue}'...`);

        channel.consume(queue, (msg) => {
            if (msg) {
                console.log(`[${senderName}]: ${msg.content.toString()}`);
                channel.ack(msg);
            }
        }, { noAck: false });
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
                postMessage(input, otherQueue);
            });
        });
    });
}

startChat();