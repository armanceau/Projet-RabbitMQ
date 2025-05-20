const amqplib = require("amqplib");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const WebSocket = require("ws");

const rabbitmq_url = process.env.RABBITMQ_URL;

const queue_result = "queue_result";
let channel;

const wss = new WebSocket.Server({ port: 8080 });
console.log("🟢 WebSocket server lancé sur ws://localhost:8080");

const clients = new Set();
wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

async function receive() {
  const conn = await amqplib.connect(rabbitmq_url);
  try {
    channel = await conn.createChannel();

    await channel.assertQueue(queue_result, {
      durable: true,
      exclusive: false,
    });

    channel.consume(queue_result, (message) => {
      if (!message) return;

      try {
        const { n1, n2, op, result } = JSON.parse(message.content.toString());

        if (
          n1 !== undefined &&
          n2 !== undefined &&
          op &&
          result !== undefined
        ) {
          console.log(`${n1} ${op} ${n2} = ${result}`);
          const finalResult = `${n1} ${op} ${n2} = ${result}`;
          console.log("💡 Simulation:", finalResult);

          for (let client of clients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(finalResult);
            }
          }
        } else {
          console.warn("Message incomplet ou mal formé");
        }
      } catch (err) {
        console.error("❌ Erreur de parsing JSON:", err);
      }

      channel.ack(message);
    });

    console.log("Consumer en attente de résultats...");
  } catch (error) {
    console.error("Erreur lors de la lecture des résultats:", error);
  }
}

receive();
