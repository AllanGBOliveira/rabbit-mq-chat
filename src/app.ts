// import * as readline from 'node:readline';
// import * as dotenv from 'dotenv';
// import { MqChat } from './MqChat';

// dotenv.config();

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const mqChat = new MqChat();
// const { sanitizeName, consumeMessages, postMessage } = mqChat;

// async function startChat() {
//   rl.question('Qual é o seu nome? ', async myUserName => {
//     const myQueue = `${sanitizeName(myUserName)}_fila`;

//     rl.question(
//       'Para qual usuário você quer conversar? ',
//       async otherUserName => {
//         const otherQueue = `${sanitizeName(otherUserName)}_fila`;

//         console.log(
//           `\nBem-vindo, ${myUserName}! Você está conectado com ${otherUserName}.\n`,
//         );
//         console.log(
//           `Suas mensagens serão enviadas para a fila '${otherQueue}'`,
//         );
//         console.log(`E você ouvirá na fila '${myQueue}'`);

//         consumeMessages(myQueue);

//         rl.on('line', input => {
//           postMessage(input, otherQueue, myUserName);
//         });
//       },
//     );
//   });
// }

