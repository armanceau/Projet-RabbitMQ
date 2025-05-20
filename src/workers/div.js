
import connection_rabbitmq from "../utils/connection_rabbitmq";
async function DivWorker() {
  const channel = await connection_rabbitmq();
  const queue_requete = "queue_div";
  const queue_resultat = "queue_result";
  const exchange = "narg_exchange";

  await channel.assertExchange(exchange, "topic", { durable: true });
  await channel.assertQueue(queue_requete, { durable: true });
  await channel.bindQueue(queue_requete, exchange, "operation.div");

  await channel.assertQueue(queue_resultat, { durable: true });

  channel.consume(queue_requete, async (message) => {
    if (message != null) {
      const content = JSON.parse(message.content.toString());
      const { n1, n2 } = content;
      console.log(`Calcul de ${n1} / ${n2}`);

      const randomDelay = Math.floor(Math.random() * 10000) + 5000;
      console.log(
        `Délai avant de renvoyer le résultat: ${randomDelay / 1000} secondes`
      );

      await new Promise((resolve) => setTimeout(resolve, randomDelay));

      const result = n2 !== 0 ? n1 / n2 : "Erreur: division par 0";
      const resultMessage = {
        n1,
        n2,
        op: "div",
        result,
      };
      channel.sendToQueue(
        queue_resultat,
        Buffer.from(JSON.stringify(resultMessage))
      );
      channel.ack(message);
    }
    console.log("Le Worker à fait son travail et envoyé le résultat.");
  });
}
export default DivWorker;
