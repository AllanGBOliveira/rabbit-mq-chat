import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { randomUUID } from 'crypto';
import { User, HopperTalksDbSchema } from '../types/db'

const hopperTalksFile = path.join(process.cwd(), 'hopperTalksDb.json');
const hopperTalksAdapter = new JSONFile<HopperTalksDbSchema>(hopperTalksFile);
const hopperTalksDefaultData: HopperTalksDbSchema = { users: [] };
const hopperTalksDb = new Low(hopperTalksAdapter, hopperTalksDefaultData);


export function sanitizeName(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  return sanitized;
}

export async function saveUser(name: string): Promise<User> {
  await hopperTalksDb.read();
  
  // Verifica se já existe um usuário com o mesmo nome
  const existingUser = hopperTalksDb.data.users.find(user => user.name === name);
  if (existingUser) {
    throw new Error(`Já existe um usuário com o nome '${name}'. Os nomes devem ser únicos.`);
  }
  
  const id = randomUUID();

  const user: User = {
    id,
    name,
    created_at: new Date(),
    updated_at: new Date(),
    contacts: [],
    queue: `fila_${sanitizeName(name)}_${id}`,
  };

  hopperTalksDb.data.users.push(user);
  await hopperTalksDb.write();
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  await hopperTalksDb.read();
  return hopperTalksDb.data.users.find(user => user.id === id);
}

export async function getUserByName(name: string): Promise<User | undefined> {
  await hopperTalksDb.read();
  return hopperTalksDb.data.users.find(user => user.name === name);
}

export async function getUserByQueue(queue: string): Promise<User | undefined> {
  await hopperTalksDb.read();
  return hopperTalksDb.data.users.find(user => user.queue === queue);
}

export async function getAllUsers(): Promise<User[]> {
  await hopperTalksDb.read();
  return hopperTalksDb.data.users;
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
  await hopperTalksDb.read();
  const userIndex = hopperTalksDb.data.users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return null;
  }

  const user = hopperTalksDb.data.users[userIndex];
  hopperTalksDb.data.users[userIndex] = {
    ...user,
    ...updates,
    updated_at: new Date(),
  };

  await hopperTalksDb.write();
  return hopperTalksDb.data.users[userIndex];
}

export async function deleteUser(id: string): Promise<boolean> {
  await hopperTalksDb.read();
  const userIndex = hopperTalksDb.data.users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return false;
  }

  hopperTalksDb.data.users.splice(userIndex, 1);
  await hopperTalksDb.write();
  return true;
}

export async function addContactToUser(userId: string, contactId: string): Promise<boolean> {
  await hopperTalksDb.read();
  const user = hopperTalksDb.data.users.find(u => u.id === userId);
  
  if (!user || user.contacts.includes(contactId)) {
    return false;
  }

  user.contacts.push(contactId);
  user.updated_at = new Date();
  await hopperTalksDb.write();
  return true;
}

export async function removeContactFromUser(userId: string, contactId: string): Promise<boolean> {
  await hopperTalksDb.read();
  const user = hopperTalksDb.data.users.find(u => u.id === userId);
  
  if (!user) {
    return false;
  }

  const contactIndex = user.contacts.indexOf(contactId);
  if (contactIndex === -1) {
    return false;
  }

  user.contacts.splice(contactIndex, 1);
  user.updated_at = new Date();
  await hopperTalksDb.write();
  return true;
}

export async function updateUserQueue(userId: string, newQueue: string): Promise<User | null> {
  await hopperTalksDb.read();
  const userIndex = hopperTalksDb.data.users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }

  hopperTalksDb.data.users[userIndex].queue = newQueue;
  hopperTalksDb.data.users[userIndex].updated_at = new Date();
  
  await hopperTalksDb.write();
  return hopperTalksDb.data.users[userIndex];
}

export async function clearUsers() {
  hopperTalksDb.data.users = [];
  await hopperTalksDb.write();
}

export async function getUserWithContacts(userId: string) {
  const user = await getUserById(userId);
  if (!user) return null;
  
  const contacts = await Promise.all(
    user.contacts.map(contactId => getUserById(contactId))
  );
  
  return { ...user, contactsData: contacts.filter(Boolean) };
}

export async function findOrCreateUser(name: string): Promise<User> {
  // Primeiro tenta encontrar o usuário
  const existingUser = await getUserByName(name);
  
  if (existingUser) {
    return existingUser;
  }
  
  // Se não existe, cria um novo (mas vai dar erro se nome duplicado)
  return await saveUser(name);
}
