const amqplib = require("amqplib");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const calcul_choices = ["add", "sub", "mul", "div", "all"];
const exchange_name = "narg_exchange";
const queue_add = "queue_add";
const queue_sub = "queue_sub";
const queue_mul = "queue_mul";
const queue_div = "queue_div";

// Fonction pour générer un entier aléatoire entre min et max inclus
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function setup() {
  const conn = await amqplib.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange(exchange_name, "topic", { durable: true });

  await channel.assertQueue(queue_add, { durable: true });
  await channel.assertQueue(queue_sub, { durable: true });
  await channel.assertQueue(queue_mul, { durable: true });
  await channel.assertQueue(queue_div, { durable: true });

  await channel.bindQueue(queue_add, exchange_name, "operation.add");
  await channel.bindQueue(queue_sub, exchange_name, "operation.sub");
  await channel.bindQueue(queue_mul, exchange_name, "operation.mul");
  await channel.bindQueue(queue_div, exchange_name, "operation.div");

  console.log(
    "🎯 Producteur automatique lancé. Envoi toutes les 5 secondes..."
  );

  setInterval(() => {
    const calculation_ref =
      calcul_choices[randomInt(0, calcul_choices.length - 1)];
    const n1 = randomInt(1, 100);
    const n2 = randomInt(1, 100);
    const correlationId = Math.random().toString(16).slice(2);
    const message_content = JSON.stringify({ n1, n2, correlationId });

    if (calculation_ref === "all") {
      const ops = ["add", "sub", "mul", "div"];
      for (const op of ops) {
        const routingKey = `operation.${op}`;
        channel.publish(
          exchange_name,
          routingKey,
          Buffer.from(message_content),
          {
            correlationId,
          }
        );
        console.log(`[✓] ${routingKey} => ${message_content}`);
      }
    } else {
      const routingKey = `operation.${calculation_ref}`;
      channel.publish(exchange_name, routingKey, Buffer.from(message_content), {
        correlationId,
      });
      console.log(`[✓] ${routingKey} => ${message_content}`);
    }
  }, 5000);
}

setup().catch(console.error);
