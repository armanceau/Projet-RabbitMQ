// api.js
const express = require("express");
const amqplib = require("amqplib");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const cors = require("cors");

const app = express();
const PORT = 3000;
app.use(cors());
const exchange_name = "narg_exchange";

app.use(express.json());
app.use(express.static("public"));

app.post("/api/send-operation", async (req, res) => {
  const { n1, n2, operation } = req.body;

  if (!n1 || !n2 || !operation) {
    return res.status(400).json({ message: "Paramètres manquants." });
  }

  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();

    await channel.assertExchange(exchange_name, "topic", { durable: true });

    const correlationId = Math.random().toString(16).slice(2);
    const message_content = JSON.stringify({ n1, n2, correlationId });
    const routingKey = `operation.${operation}`;

    channel.publish(exchange_name, routingKey, Buffer.from(message_content), {
      correlationId,
    });

    await channel.close();
    await conn.close();

    res.json({ message: "✅ Opération envoyée avec succès." });
  } catch (err) {
    console.error("Erreur envoi RabbitMQ :", err);
    res.status(500).json({ message: "❌ Erreur interne." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API lancée sur http://localhost:${PORT}`);
});
