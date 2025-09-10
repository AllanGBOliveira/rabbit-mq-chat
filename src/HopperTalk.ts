import amqp from 'amqplib';
import * as dotenv from 'dotenv';
import pino from 'pino';
import { getUserById, findOrCreateUser, getUserByName, addContactToUser, removeContactFromUser, getUserWithContacts } from './db';
import { User } from '../types/db';

dotenv.config();

const logger = pino();
const user = process.env.RABBITMQ_DEFAULT_USER || '';
const password = process.env.RABBITMQ_DEFAULT_PASS || '';
const host = process.env.RABBIT_HOST || 'localhost';
const port = parseInt(process.env.RABBIT_PORT || '5672');
const exchange = process.env.RABBIT_EXCHANGE || 'de_.*._para_.*';

export class TopicExchangeExample {
  private user: User | null = null;
  private isInitialized: boolean = false;

  constructor(userName: string) {
    this.initializeUser(userName);
  }

  async initializeUser(userName: string): Promise<void> {
    try {
      this.user = await findOrCreateUser(userName);
      this.isInitialized = true;
      logger.info(`Usuário '${userName}' inicializado com sucesso. Fila: ${this.user.queue}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Erro ao inicializar usuário '${userName}': ${errorMessage}`);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.user) {
      throw new Error('Usuário não foi inicializado. Aguarde a inicialização ou chame initializeUser() novamente.');
    }
  }

  getUser(): User {
    this.ensureInitialized();
    return this.user!;
  }

  getUserQueue(): string {
    this.ensureInitialized();
    return this.user!.queue;
  }

  getUserName(): string {
    this.ensureInitialized();
    return this.user!.name;
  }

  getUserId(): string {
    this.ensureInitialized();
    return this.user!.id;
  }

  // ===== MÉTODOS DE GERENCIAMENTO DE CONTATOS =====

  async addContact(contactName: string): Promise<{ success: boolean; message: string; contact?: User }> {
    this.ensureInitialized();
    
    try {
      // Verifica se o contato existe na base de dados
      const contactUser = await getUserByName(contactName);
      
      if (!contactUser) {
        return {
          success: false,
          message: `Usuário '${contactName}' não existe na base de dados. Só é possível adicionar usuários existentes como contatos.`
        };
      }
      
      // Verifica se o usuário não está tentando adicionar a si mesmo
      if (contactUser.id === this.getUserId()) {
        return {
          success: false,
          message: "Você não pode adicionar a si mesmo como contato."
        };
      }
      
      // Adiciona o contato
      const wasAdded = await addContactToUser(this.getUserId(), contactUser.id);
      
      if (!wasAdded) {
        return {
          success: false,
          message: `'${contactName}' já está na sua lista de contatos.`
        };
      }
      
      logger.info(`Contato '${contactName}' adicionado com sucesso para ${this.getUserName()}`);
      
      return {
        success: true,
        message: `Contato '${contactName}' adicionado com sucesso!`,
        contact: contactUser
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Erro ao adicionar contato '${contactName}': ${errorMessage}`);
      
      return {
        success: false,
        message: `Erro ao adicionar contato: ${errorMessage}`
      };
    }
  }

  async removeContact(contactName: string): Promise<{ success: boolean; message: string }> {
    this.ensureInitialized();
    
    try {
      // Busca o contato pelo nome
      const contactUser = await getUserByName(contactName);
      
      if (!contactUser) {
        return {
          success: false,
          message: `Usuário '${contactName}' não encontrado.`
        };
      }
      
      // Remove o contato
      const wasRemoved = await removeContactFromUser(this.getUserId(), contactUser.id);
      
      if (!wasRemoved) {
        return {
          success: false,
          message: `'${contactName}' não está na sua lista de contatos.`
        };
      }
      
      logger.info(`Contato '${contactName}' removido com sucesso para ${this.getUserName()}`);
      
      return {
        success: true,
        message: `Contato '${contactName}' removido com sucesso!`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Erro ao remover contato '${contactName}': ${errorMessage}`);
      
      return {
        success: false,
        message: `Erro ao remover contato: ${errorMessage}`
      };
    }
  }

  async listContacts(): Promise<{ success: boolean; contacts: User[]; message: string }> {
    this.ensureInitialized();
    
    try {
      const userWithContacts = await getUserWithContacts(this.getUserId());
      
      if (!userWithContacts) {
        return {
          success: false,
          contacts: [],
          message: "Erro ao buscar dados do usuário."
        };
      }
      
      const contacts = (userWithContacts.contactsData || []).filter((c): c is User => c !== undefined);
      
      if (contacts.length === 0) {
        return {
          success: true,
          contacts: [],
          message: "Você ainda não possui contatos."
        };
      }
      
      logger.info(`${this.getUserName()} possui ${contacts.length} contato(s)`);
      
      return {
        success: true,
        contacts,
        message: `${contacts.length} contato(s) encontrado(s).`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Erro ao listar contatos: ${errorMessage}`);
      
      return {
        success: false,
        contacts: [],
        message: `Erro ao listar contatos: ${errorMessage}`
      };
    }
  }

  async getContactByName(contactName: string): Promise<{ success: boolean; contact?: User; message: string }> {
    this.ensureInitialized();
    
    try {
      const userWithContacts = await getUserWithContacts(this.getUserId());
      
      if (!userWithContacts) {
        return {
          success: false,
          message: "Erro ao buscar dados do usuário."
        };
      }
      
      const contacts = (userWithContacts.contactsData || []).filter((c): c is User => c !== undefined);
      const contact = contacts.find(c => c && c.name === contactName);
      
      if (!contact) {
        return {
          success: false,
          message: `'${contactName}' não está na sua lista de contatos.`
        };
      }
      
      return {
        success: true,
        contact,
        message: `Contato '${contactName}' encontrado.`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Erro ao buscar contato '${contactName}': ${errorMessage}`);
      
      return {
        success: false,
        message: `Erro ao buscar contato: ${errorMessage}`
      };
    }
  }


  async sendMessage(message: string, contactName: string): Promise<{ success: boolean; message: string }> {
    this.ensureInitialized();
    
    try {
      // Verifica se o contato está na lista de contatos do usuário
      const contactResult = await this.getContactByName(contactName);
      
      if (!contactResult.success || !contactResult.contact) {
        return {
          success: false,
          message: contactResult.message
        };
      }
      
      const contact = contactResult.contact;
      const senderName = this.getUserName();
      
      logger.info(
        `${senderName} enviando mensagem: "${message}" para ${contact.name}`
      );
      
      const connection = await amqp.connect(
        `amqp://${user}:${password}@${host}:${port}`,
      );
      const channel = await connection.createChannel();
      await channel.assertExchange(exchange, 'topic', { durable: false });
      await channel.prefetch(1);
      const routingKey = `de_.${senderName}._para_.${contact.name}`;

      channel.publish(
        exchange,
        routingKey,
        Buffer.from(
          JSON.stringify({
            sender: senderName,
            content: message,
            timestamp: new Date().toISOString(),
            recipientQueue: contact.queue
          }),
        ),
      );
      
      setTimeout(() => connection.close(), 500);
      
      return {
        success: true,
        message: `Mensagem enviada para ${contactName} com sucesso!`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Erro ao enviar mensagem para '${contactName}': ${errorMessage}`);
      
      return {
        success: false,
        message: `Erro ao enviar mensagem: ${errorMessage}`
      };
    }
  }

  // Método legado para compatibilidade - mas agora com validação
  async produce(message: string, contactId: string) {
    this.ensureInitialized();
    
    const contact = await getUserById(contactId);

    if (!contact) {
      logger.error(`Contato ${contactId} não encontrado`);
      return;
    }
    
    // Verifica se o contato está na lista de contatos
    const contactResult = await this.getContactByName(contact.name);
    
    if (!contactResult.success) {
      logger.error(`Usuário '${contact.name}' não está na sua lista de contatos`);
      return;
    }
    
    const senderName = this.getUserName();
    logger.info(
      `Producer: ${senderName} enviando mensagem: ${message} para a fila ${contact.name}`
    );
    
    const connection = await amqp.connect(
      `amqp://${user}:${password}@${host}:${port}`,
    );
    const channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'topic', { durable: false });
    await channel.prefetch(1);
    const routingKey = `de_.${senderName}._para_.${contact.name}`;

    channel.publish(
      exchange,
      routingKey,
      Buffer.from(
        JSON.stringify({
          sender: senderName,
          content: message,
          timestamp: new Date().toISOString(),
          recipientQueue: contact.queue
        }),
      ),
    );
    setTimeout(() => connection.close(), 500);
  }

  async consume(queue?: string) {
    this.ensureInitialized();
    
    const targetQueue = queue || this.getUserQueue();
    
    const connection = await amqp.connect(
      `amqp://${user}:${password}@${host}:${port}`,
    );
    const channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'direct', { durable: false });
    await channel.assertQueue(targetQueue, { durable: false });
    const bindingKey = `key_${targetQueue}`;
    await channel.bindQueue(targetQueue, exchange, bindingKey);
    await channel.prefetch(1);

    logger.info('--- Fim do histórico ---\n');

    logger.info(`\n${this.getUserName()} aguardando mensagens em '${targetQueue}'...`);

    channel.consume(targetQueue, async msg => {
      if (msg) {
        const { sender, content, timestamp } = JSON.parse(
          msg.content.toString(),
        );
        logger.info(
          `\n[${new Date(timestamp).toLocaleTimeString()}] ${sender}: ${content}`,
        );
        logger.info(`Digite sua mensagem (ou 'sair' para sair):`);
        channel.ack(msg);
      }
    });
  }
}
