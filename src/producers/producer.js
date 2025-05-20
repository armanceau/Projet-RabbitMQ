const amqplib = require('amqplib');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

calcul_choices = ["add", "sub", "mul", "div"]
const exchange_name = "narg_exchange"
const queue_add = "queue_add"
const queue_sub = "queue_sub"
const queue_mul = "queue_mul"
const queue_div = "queue_div"

let calculation_ref
let n1_ref
let n2_ref

if (process.argv[2] && process.argv[3] && process.argv[4]) {
    calculation_ref = process.argv[2];
    n1_ref = process.argv[3]
    n2_ref = process.argv[4]
    console.log("choix du calcul", calculation_ref)
} else {
    console.log("dans else")
    //exit le script
}


async function send() {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    console.log(process.env.RABBITMQ_URL)
    const channel = await conn.createChannel();

    //création de l'exchange topic
    await channel.assertExchange(exchange_name, 'topic', { durable: false })
    await channel.assertQueue(queue_add, {durable: false, exclusive: true})
    await channel.assertQueue(queue_sub, {durable: false, exclusive: true})
    await channel.assertQueue(queue_mul, {durable: false, exclusive: true})
    await channel.assertQueue(queue_div, {durable: false, exclusive: true})

    const correlationId = Math.random().toString(16).slice(2);
    const message_content = JSON.stringify({n1: n1_ref, n2: n2_ref, correlationId: correlationId})
    //publier le channel avec id, n1, n2
    channel.publish(exchange_name, calculation_ref, Buffer.from(message_content), {correlationId})

    console.log(`[✓] Message publié sous "${calculation_ref}" => ${message_content}`);


    //await channel.bindQueue(queue_first, exchange, 'first')
}
send();