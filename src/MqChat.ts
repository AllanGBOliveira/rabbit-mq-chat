import amqp from 'amqplib';
import * as dotenv from 'dotenv';
import { saveMessage, getMessagesByQueue } from './db';

dotenv.config();

const user = process.env.RABBITMQ_DEFAULT_USER || '';
const password = process.env.RABBITMQ_DEFAULT_PASS || '';
const host = process.env.RABBIT_HOST || 'localhost';
const port = parseInt(process.env.RABBIT_PORT || '5672');
const exchange = process.env.RABBIT_EXCHANGE || 'send-chat-message';

export class MqChat {
  constructor() {}

  sanitizeName(name: string): string {
    const sanitized = name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    return sanitized;
  }

  async postMessage(message: string, queue: string, senderName: string) {
    try {
      const connection = await amqp.connect(
        `amqp://${user}:${password}@${host}:${port}`,
      );
      const channel = await connection.createChannel();
      await channel.assertExchange(exchange, 'direct', { durable: false });
      await channel.prefetch(1);
      const routingKey = `key_${queue}`;
  
      await saveMessage(senderName, message, queue);
  
      channel.publish(
        exchange,
        routingKey,
        Buffer.from(
          JSON.stringify({
            sender: senderName,
            content: message,
            timestamp: new Date().toISOString(),
          }),
        ),
      );
  
      console.log(`[${senderName}] Mensagem enviada: ${message}`);
      setTimeout(() => connection.close(), 500);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }


  async consumeMessages(queue: string) {
    try {
      const connection = await amqp.connect(
        `amqp://${user}:${password}@${host}:${port}`,
      );
      const channel = await connection.createChannel();
      await channel.assertExchange(exchange, 'direct', { durable: false });
      await channel.assertQueue(queue, { durable: false });
      const bindingKey = `key_${queue}`;
      await channel.bindQueue(queue, exchange, bindingKey);
      await channel.prefetch(1);
  
      const history = await getMessagesByQueue(queue);
      console.log(`\n--- Histórico de mensagens (${history.length}) ---`);
      history.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        console.log(`[${time}] ${msg.sender}: ${msg.content}`);
      });
      console.log('--- Fim do histórico ---\n');
  
      console.log(`\nAguardando mensagens em '${queue}'...`);
  
      channel.consume(queue, async msg => {
        if (msg) {
          const { sender, content, timestamp } = JSON.parse(
            msg.content.toString(),
          );
          console.log(
            `\n[${new Date(timestamp).toLocaleTimeString()}] ${sender}: ${content}`,
          );
          console.log(`Digite sua mensagem (ou 'sair' para sair):`);
          channel.ack(msg);
        }
      });
    } catch (error) {
      console.error('Erro ao consumir mensagens:', error);
    }
  }
}
