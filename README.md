# 🐰 RabbitMQ Chat - TypeScript

## 📚 Meu Projeto de Estudos - Aprendendo Mensageria

Este é um projeto que criei para aprender os conceitos básicos de **mensageria** e **RabbitMQ**. Desenvolvi este chat simples para entender na prática como funcionam sistemas de filas de mensagens e comunicação assíncrona.

Um sistema de chat em tempo real utilizando **RabbitMQ** como message broker e **TypeScript**, que me ajudou a compreender como as mensagens são enviadas, recebidas e processadas em um sistema distribuído.

## 🎯 O que aprendi desenvolvendo este projeto

- 📖 **Conceitos básicos de mensageria** - Como funcionam filas de mensagens
- 🐰 **RabbitMQ na prática** - Configuração e uso de um message broker
- 🔄 **Comunicação assíncrona** - Envio e recebimento de mensagens
- 📦 **Filas personalizadas** - Como criar e gerenciar diferentes filas
- 🔗 **Conexões AMQP** - Protocolo de mensageria avançado
- 🛠️ **TypeScript + Node.js** - Desenvolvimento tipado para mensageria
- 🎯 **Direct Exchange** - Implementação de roteamento direto de mensagens
- 🔑 **Routing Keys** - Sistema de chaves para roteamento específico

## 📋 Características do Projeto

- ✅ Chat simples entre dois usuários (implementação básica para aprendizado)
- ✅ Sistema de filas personalizadas por usuário
- ✅ **Direct Exchange** para roteamento eficiente de mensagens
- ✅ **Routing Keys** com padrão `key-{nome_da_fila}`
- ✅ Interface via terminal (fácil de testar e entender)
- ✅ Código comentado e didático
- ✅ Configuração Docker simplificada
- ✅ Implementação focada no aprendizado

## 🛠️ Pré-requisitos

### Node.js
- **Node.js versão 18.x ou superior** (recomendado: 20.x)
- npm (incluído com Node.js)

Para verificar sua versão do Node.js:
```bash
node --version
npm --version
```

### RabbitMQ Server
Você tem duas opções para executar o RabbitMQ:

#### Opção 1: Docker (Recomendado) 🐳
- Docker instalado em sua máquina
- Docker Compose

#### Opção 2: Instalação Local
- RabbitMQ Server instalado localmente
- Erlang/OTP (dependência do RabbitMQ)

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

### Exemplo de Uso

**Terminal 1:**
```
Qual é o seu nome? Alice
Para qual usuário você quer conversar? Bob

Bem-vindo, Alice! Você está conectado com Bob.

Suas mensagens serão enviadas para a fila 'bob_fila'
E você ouvirá na fila 'alice_fila'

[Bob] - Aguardando mensagens em 'alice_fila'...
Olá Bob, como você está?
[Bob]: Oi Alice! Estou bem, obrigado!
```

**Terminal 2:**
```
Qual é o seu nome? Bob
Para qual usuário você quer conversar? Alice

Bem-vindo, Bob! Você está conectado com Alice.

Suas mensagens serão enviadas para a fila 'alice_fila'
E você ouvirá na fila 'bob_fila'

[Alice] - Aguardando mensagens em 'bob_fila'...
[Alice]: Olá Bob, como você está?
Oi Alice! Estou bem, obrigado!
```

## 🔧 Scripts Disponíveis

- `npm start`: Executa o aplicativo usando ts-node
- `npm run dev`: Executa em modo desenvolvimento com hot-reload

## 🏗️ Arquitetura do Sistema

```
┌─────────────┐    ┌─────────────────────────────┐    ┌─────────────┐
│   Alice     │    │        RabbitMQ Server      │    │    Bob      │
│ (Terminal 1)│    │                             │    │ (Terminal 2)│
└─────────────┘    │  ┌─────────────────────────┐ │    └─────────────┘
       │           │  │  Direct Exchange        │ │           │
       │           │  │ "send-chat-message"     │ │           │
       │ Publica   │  └─────────────────────────┘ │  Publica  │
       │ com       │           │         │        │  com      │
       │ routing   │           │         │        │  routing  │
       │ key:      │  ┌────────▼─┐   ┌──▼────────┐ │  key:     │
       │"key-bob_  │  │alice_fila│   │ bob_fila  │ │"key-alice_│
       │ fila"     │  │          │   │           │ │ fila"     │
       └──────────►│  │(binding: │   │(binding:  │ │◄──────────┘
                   │  │key-alice_│   │key-bob_   │ │
       ┌──────────►│  │ fila)    │   │ fila)     │ │◄──────────┐
       │ Consome   │  └────────▲─┘   └──▲────────┘ │  Consome  │
       │           │           │         │        │           │
       │           └───────────┼─────────┼────────┘           │
       │                       │         │                    │
       └───────────────────────┘         └────────────────────┘
```

### 🔄 Fluxo de Mensagens com Direct Exchange

1. **Alice** envia mensagem para **Bob**:
   - Publica no exchange `send-chat-message`
   - Usa routing key `key-bob_fila`
   - Exchange roteia para a fila `bob_fila`

2. **Bob** recebe a mensagem:
   - Consome da fila `bob_fila`
   - Fila está vinculada ao exchange com binding key `key-bob_fila`

3. **Vantagens do Direct Exchange**:
   - Roteamento preciso baseado em routing keys
   - Melhor performance que outros tipos de exchange
   - Controle granular sobre o destino das mensagens

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

## 📁 Estrutura do Projeto

```
rabbit-mq-chat/
├── src/
│   └── app.ts              # Aplicação principal
├── docker-compose.yml      # Configuração Docker do RabbitMQ
├── Dockerfile             # Imagem personalizada do RabbitMQ
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração TypeScript
├── LICENSE                # Licença MIT
└── README.md              # Este arquivo
```

## 🔒 Configurações de Segurança

As credenciais padrão são:
- **Usuário**: `meu_usuario`
- **Senha**: `minha_senha`

⚠️ **Para produção**, altere essas credenciais no arquivo `docker-compose.yml` e `src/app.ts`.

## 📚 Próximos Passos para Estudos

Depois de dominar este projeto básico, você pode evoluir seus conhecimentos em mensageria:

1. **Padrões de Mensageria**: Explore outros padrões como Publish/Subscribe, Work Queues
2. **Persistência**: Aprenda sobre filas duráveis e mensagens persistentes
3. **Roteamento**: Estude exchanges e routing keys
4. **Monitoramento**: Use a interface web do RabbitMQ para acompanhar as filas
5. **Outros Message Brokers**: Teste Apache Kafka, Redis Pub/Sub, etc.

## 📝 Licença

Este projeto educacional está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🚀 Melhorias Futuras

Algumas ideias para expandir este projeto de estudos:

### 📈 Funcionalidades
- [ ] **Múltiplos usuários**: Expandir para suportar mais de 2 usuários simultaneamente
- [ ] **Salas de chat**: Implementar diferentes canais/salas de conversa
- [ ] **Histórico de mensagens**: Salvar e recuperar mensagens anteriores
- [ ] **Interface web**: Criar uma UI web simples com HTML/CSS/JS
- [ ] **Notificações**: Adicionar sons ou alertas visuais para novas mensagens
- [ ] **Status de usuário**: Mostrar quando usuários estão online/offline

### 🔧 Melhorias Técnicas
- [ ] **Tratamento de erros**: Melhorar o handling de conexões perdidas
- [ ] **Reconexão automática**: Implementar retry automático em caso de falha
- [ ] **Validação de mensagens**: Adicionar sanitização e validação de input
- [ ] **Logs estruturados**: Implementar sistema de logging mais robusto
- [ ] **Testes**: Adicionar testes unitários e de integração
- [ ] **Configuração externa**: Mover credenciais para arquivo de ambiente

### 🎓 Conceitos Avançados para Estudar
- [x] **Direct Exchange**: ✅ **Implementado** - Roteamento direto com routing keys
- [ ] **Topic Exchange**: Implementar padrões de roteamento com wildcards
- [ ] **Fanout Exchange**: Broadcast de mensagens para múltiplas filas
- [ ] **Headers Exchange**: Roteamento baseado em headers das mensagens
- [ ] **Dead Letter Queues**: Tratamento de mensagens com falha
- [ ] **Message TTL**: Implementar tempo de vida das mensagens
- [ ] **Clustering**: Configurar RabbitMQ em cluster
- [ ] **Monitoring**: Adicionar métricas e dashboards
- [ ] **Load Balancing**: Distribuir carga entre múltiplos consumers

### 🔄 Outros Padrões de Mensageria
- [ ] **Publish/Subscribe**: Implementar padrão pub/sub
- [ ] **Work Queues**: Distribuir tarefas entre workers
- [ ] **RPC Pattern**: Request/Reply usando RabbitMQ
- [ ] **Event Sourcing**: Implementar log de eventos
- [ ] **CQRS**: Separar comandos de queries

---

**Projeto de estudos desenvolvido com ❤️ para aprender TypeScript e RabbitMQ**
