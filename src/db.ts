import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import {Message, DatabaseSchema} from '../types/db'

const file = path.join(process.cwd(), 'db.json');
const adapter = new JSONFile<DatabaseSchema>(file);
const defaultData: DatabaseSchema = { messages: [] };
const db = new Low(adapter, defaultData);

export async function saveMessage(
  sender: string,
  content: string,
  queue: string,
) {
  await db.read();

  const message: Message = {
    id: Date.now().toString(),
    sender,
    content,
    timestamp: new Date(),
    queue,
  };

  db.data.messages.push(message);
  await db.write();
  return message;
}

export async function getMessagesByQueue(queue: string): Promise<Message[]> {
  await db.read();
  return db.data.messages
    .filter(message => message.queue === queue)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
}

export async function clearMessages() {
  db.data.messages = [];
  await db.write();
}
