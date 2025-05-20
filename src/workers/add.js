import connection_rabbitmq from "../utils/connection_rabbitmq";

async function AddWorker() {
  const channel = await connection_rabbitmq();
  const queue_requete = "operation_queue_add";
  const queue_resultat = "queue_result";
  const exchange = "narg_exchange";

  try {

    await channel.assertExchange(exchange, "topic", { durable: true });
    await channel.assertQueue(queue_requete, { durable: true });
    await channel.bindQueue(queue_requete, exchange, "operation.add");

    await channel.assertQueue(queue_resultat, { durable: true });

    // ecoute la file rabbitmq et reagit a chaque message recue
    channel.consume(queue_requete, async (message) => {
      if (message != null) {
        const content = JSON.parse(message.content.toString());
        const { n1, n2 } = content;
        console.log(`Calcul de ${n1} + ${n2}`);

        const randomDelay = Math.floor(Math.random() * 10000) + 5000;
        console.log(
          `Délai avant de renvoyer le résultat: ${randomDelay / 1000} secondes`
        );

        await new Promise((resolve) => setTimeout(resolve, randomDelay));

        const result = n1 + n2;

        const resultMessage = {
          n1,
          n2,
          op: "add",
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

export default AddWorker;