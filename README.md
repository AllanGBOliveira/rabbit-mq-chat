# 🐰 RabbitMQ Chat - TypeScript

## 📚 Meu Projeto de Estudos - Aprendendo Mensageria

Este é um projeto que criei para aprender os conceitos básicos de **mensageria** e **RabbitMQ**. Desenvolvi este chat simples para entender na prática como funcionam sistemas de filas de mensagens e comunicação assíncrona.

Um sistema de chat em tempo real utilizando **RabbitMQ** como message broker e **TypeScript**, que me ajudou a compreender como as mensagens são enviadas, recebidas e armazenadas em um sistema distribuído.

## 🎯 O que aprendi desenvolvendo este projeto

- 📖 **Conceitos básicos de mensageria** - Como funcionam filas de mensagens
- 🐰 **RabbitMQ na prática** - Configuração e uso de um message broker
- 💾 **Persistência de mensagens** - Armazenamento local com lowdb
- 🔄 **Comunicação assíncrona** - Envio e recebimento de mensagens
- 📦 **Filas personalizadas** - Como criar e gerenciar diferentes filas
- 🔗 **Conexões AMQP** - Protocolo de mensageria avançado
- 🛠️ **TypeScript + Node.js** - Desenvolvimento tipado para mensageria
- 🎯 **Direct Exchange** - Implementação de roteamento direto de mensagens
- 🔑 **Routing Keys** - Sistema de chaves para roteamento específico

## 📋 Características do Projeto

- ✅ Chat simples entre dois usuários (implementação básica para aprendizado)
- ✅ Sistema de filas personalizadas por usuário
- ✅ **Persistência de mensagens** usando lowdb
- ✅ **Histórico de conversas** disponível ao reconectar
- ✅ **Direct Exchange** para roteamento eficiente de mensagens
- ✅ **Routing Keys** com padrão `key-{nome_da_fila}`
- ✅ Interface via terminal (fácil de testar e entender)
- ✅ Código comentado e didático
- ✅ Configuração Docker simplificada
- ✅ Implementação focada no aprendizado

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd rabbit-mq-chat
```

### 2. Instale as dependências do Node.js
```bash
npm install
```

### 3. Configure o RabbitMQ

#### Usando Docker (Recomendado)
```bash
# Inicie o RabbitMQ com Docker Compose
docker-compose up -d

# Verifique se o container está rodando
docker ps
```

O RabbitMQ estará disponível em:
- **AMQP**: `localhost:5672`
- **Interface Web**: `http://localhost:8080`
  - Usuário: `meu_usuario`
  - Senha: `minha_senha`

#### Usando Instalação Local
Se preferir instalar o RabbitMQ localmente:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install rabbitmq-server
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server
```

**macOS (Homebrew):**
```bash
brew install rabbitmq
brew services start rabbitmq
```

**Windows:**
Baixe e instale do site oficial: https://www.rabbitmq.com/download.html

## 💬 Como Usar o Chat

### ⚠️ IMPORTANTE: Você precisa de DOIS TERMINAIS

Para simular uma conversa entre dois usuários, você deve abrir **dois terminais separados** e executar o aplicativo em cada um.

### Terminal 1 (Usuário A)
```bash
npm run dev
# ou
npm start
```

1. Digite seu nome (ex: "Alice")
2. Digite o nome da pessoa com quem quer conversar (ex: "Bob")
3. Comece a digitar suas mensagens

### Terminal 2 (Usuário B)
```bash
npm run dev
# ou
npm start
```

1. Digite seu nome (ex: "Bob")
2. Digite o nome da pessoa com quem quer conversar (ex: "Alice")
3. Comece a digitar suas mensagens

### Novas Funcionalidades

#### 📚 Histórico de Mensagens
- Todas as mensagens são armazenadas localmente em `db.json`
- Ao conectar, o histórico completo da conversa é exibido
- As mensagens são organizadas por fila de conversa

#### 💾 Armazenamento Local
- Utiliza `lowdb` para armazenamento simples em JSON
- Dados persistidos entre reinicializações do aplicativo
- Estrutura simples e fácil de entender

### Exemplo de Uso

**Terminal 1:**
```
Qual é o seu nome? Alice
Para qual usuário você quer conversar? Bob

Bem-vindo, Alice! Você está conectado com Bob.

Suas mensagens serão enviadas para a fila 'bob_fila'
E você ouvirá na fila 'alice_fila'

--- Histórico de mensagens (2) ---
[14:30] Alice: Olá Bob, como você está?
[14:31] Bob: Oi Alice! Estou bem, obrigado!
--- Fim do histórico ---

Aguardando mensagens em 'alice_fila'...
```

**Terminal 2:**
```
Qual é o seu nome? Bob
Para qual usuário você quer conversar? Alice

Bem-vindo, Bob! Você está conectado com Alice.

Suas mensagens serão enviadas para a fila 'alice_fila'
E você ouvirá na fila 'bob_fila'

--- Histórico de mensagens (2) ---
[14:30] Alice: Olá Bob, como você está?
[14:31] Bob: Oi Alice! Estou bem, obrigado!
--- Fim do histórico ---

Aguardando mensagens em 'bob_fila'...
```

## 🏗️ Estrutura do Projeto

```
rabbit-mq-chat/
├── src/
│   ├── app.ts          # Lógica principal do chat
│   └── db.ts           # Configuração e funções do banco de dados
├── db.json             # Arquivo de armazenamento das mensagens
├── docker-compose.yml  # Configuração do RabbitMQ com Docker
├── package.json        # Dependências e scripts
└── tsconfig.json       # Configuração do TypeScript
```

## 📦 Dependências

- `amqplib`: Cliente AMQP para Node.js
- `lowdb`: Banco de dados JSON simples
- `@types/node`: Tipos para Node.js
- `typescript`: Compilador TypeScript
- `ts-node`: Execução de TypeScript sem compilação prévia
- `ts-node-dev`: Recarregamento automático em desenvolvimento

## 🔧 Scripts Disponíveis

- `npm start`: Executa o aplicativo usando ts-node
- `npm run dev`: Executa em modo desenvolvimento com hot-reload

## 🐛 Solução de Problemas

### RabbitMQ não conecta
- Verifique se o RabbitMQ está rodando: `docker ps` (se usando Docker)
- Verifique se as portas 5672 e 8080 estão livres
- Confirme as credenciais no arquivo `src/app.ts`

### Erro de dependências
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Mensagens não aparecem
- Certifique-se de que ambos os terminais estão rodando
- Verifique se os nomes dos usuários estão corretos
- Confirme a conexão com RabbitMQ na interface web

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Equipe do RabbitMQ por uma ferramenta incrível
- Comunidade TypeScript pelo suporte contínuo
- Todos os mantenedores das bibliotecas open source utilizadas

## 🚀 Melhorias Futuras

- [x] **Persistência de mensagens** com lowdb
- [ ] **Interface web** para o chat
- [ ] **Sistema de salas** para múltiplos canais
- [ ] **Notificações** para novas mensagens
- [ ] **Comandos especiais** (ex: /help, /clear)
- [ ] **Tratamento de erros**: Melhorar o handling de conexões perdidas
- [ ] **Reconexão automática**: Implementar retry automático em caso de falha
- [ ] **Validação de mensagens**: Adicionar sanitização e validação de input
- [ ] **Logs estruturados**: Implementar sistema de logging mais robusto
- [ ] **Testes**: Adicionar testes unitários e de integração
