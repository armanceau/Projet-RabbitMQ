const amqplib = require('amqplib');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const rabbitmq_url = process.env.RABBITMQ_URL;

async function DivWorker() {
  const conn =  await amqplib.connect(rabbitmq_url);
  const channel = await conn.createChannel();

  const queue_requete = "queue_div";
  const queue_resultat = "queue_result";
  const exchange = "narg_exchange";

  try {
    await channel.assertExchange(exchange, "topic", { durable: true });
        await channel.assertQueue(queue_requete, { durable: true });
    await channel.bindQueue(queue_requete, exchange, "operation.div");

    await channel.assertQueue(queue_resultat, { durable: true });

    channel.consume(queue_requete, async (message) => {
      if (message != null) {
        const content = JSON.parse(message.content.toString());
        let { n1, n2 } = content;

        n1 = Number(n1);
        n2 = Number(n2);

        console.log(`Calcul de ${n1} / ${n2}`);

        const randomDelay = Math.floor(Math.random() * 10000) + 5000;
        console.log(`Délai avant de renvoyer le résultat: ${randomDelay / 1000} secondes`);

        await new Promise((resolve) => setTimeout(resolve, randomDelay));

        const result = n1 / n2;

        const resultMessage = {
          n1,
          n2,
          op: "div",
          result,
        };

        channel.sendToQueue(
          queue_resultat,
          Buffer.from(JSON.stringify(resultMessage)),
          { persistent: true }
        );

        channel.ack(message);

        console.log("Le Worker a fait son travail et envoyé le résultat.");
      }
    });

    console.log("Le Worker est en attente de messages...");
  } catch (error) {
    console.error("Erreur dans la consommation des messages:", error);
  }
}

DivWorker();