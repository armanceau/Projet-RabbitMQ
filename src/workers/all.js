const amqplib = require('amqplib');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const rabbitmq_url = process.env.RABBITMQ_URL;

async function AllWorker() {
  const conn = await amqplib.connect(rabbitmq_url);
  const channel = await conn.createChannel();

  const exchange = "narg_exchange";
  const queue_request = "queue_all";
  const queue_result = "queue_result";

  await channel.assertExchange(exchange, "topic", { durable: true });
  await channel.assertQueue(queue_request, { durable: true });
  await channel.bindQueue(queue_request, exchange, "operation.all");

  await channel.assertQueue(queue_result, { durable: true });

  channel.consume(queue_request, async (message) => {
    if (message) {
      const content = JSON.parse(message.content.toString());
      let { n1, n2 } = content;

      n1 = Number(n1);
      n2 = Number(n2);

      console.log(`🔁 Calculs pour ${n1} et ${n2}`);

      const operations = [
        { op: "add", result: n1 + n2 },
        { op: "sub", result: n1 - n2 },
        { op: "mul", result: n1 * n2 },
        { op: "div", result: n2 !== 0 ? n1 / n2 : "Erreur: division par 0" }
      ];

      for (const { op, result } of operations) {
        const resultMessage = {
          n1,
          n2,
          op,
          result,
        };

        // Simuler un délai (optionnel)
        const delay = Math.floor(Math.random() * 1000) + 100;
        await new Promise(res => setTimeout(res, delay));

        channel.sendToQueue(
          queue_result,
          Buffer.from(JSON.stringify(resultMessage)),
          { persistent: true }
        );

        console.log(`✅ Résultat envoyé : ${n1} ${getSymbol(op)} ${n2} = ${result}`);
      }

      channel.ack(message);
    }
  });

  console.log("🎯 Worker 'ALL' en attente de messages...");
}

function getSymbol(op) {
  return {
    add: "+",
    sub: "-",
    mul: "*",
    div: "/"
  }[op] || "?";
}

AllWorker();
