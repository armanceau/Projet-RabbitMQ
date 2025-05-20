const amqplib = require('amqplib');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const calcul_choices = ["add", "sub", "mul", "div"];
const exchange_name = "narg_exchange";
const queue_add = "queue_add";
const queue_sub = "queue_sub";
const queue_mul = "queue_mul";
const queue_div = "queue_div";

let calculation_ref;
let n1_ref;
let n2_ref;

if (process.argv[2] && process.argv[3] && process.argv[4]) {
    calculation_ref = process.argv[2];
    n1_ref = process.argv[3];
    n2_ref = process.argv[4];
    console.log("Choix du calcul :", calculation_ref);
} else {
    console.log("Usage : node producer.js <operation> <n1> <n2>");
    process.exit(1);
}

async function send() {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();

    await channel.assertExchange(exchange_name, 'topic', { durable: true });

    await channel.assertQueue(queue_add, { durable: true });
    await channel.assertQueue(queue_sub, { durable: true });
    await channel.assertQueue(queue_mul, { durable: true });
    await channel.assertQueue(queue_div, { durable: true });

    await channel.bindQueue(queue_add, exchange_name, "operation.add");
    await channel.bindQueue(queue_sub, exchange_name, "operation.sub");
    await channel.bindQueue(queue_mul, exchange_name, "operation.mul");
    await channel.bindQueue(queue_div, exchange_name, "operation.div");

    const correlationId = Math.random().toString(16).slice(2);
    const message_content = JSON.stringify({ n1: n1_ref, n2: n2_ref, correlationId });

    const routingKey = `operation.${calculation_ref}`;

    channel.publish(exchange_name, routingKey, Buffer.from(message_content), { correlationId });

    console.log(`[✓] Message publié sous "${routingKey}" => ${message_content}`);

    await channel.close();
    await conn.close();
}

send();