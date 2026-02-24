const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("../config.json");
const { startQuiz, handleResetButton, handleQuizButton, showMyStats } = require("./quiz/service");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!문제 출제") {
    await startQuiz(message, "normal");
    return;
  }

  if (message.content === "!오답 노트") {
    await startQuiz(message, "wrong");
    return;
  }

  if (message.content === "!내 기록") {
    await showMyStats(message);
    return;
  }

  if (message.content === "멍멍") {
    await message.reply("왈왈");
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const parts = interaction.customId.split(":");
  const kind = parts[0];

  if (kind === "reset") {
    const yesNo = parts[1];
    const ownerUserId = parts[2];
    await handleResetButton(interaction, yesNo, ownerUserId);
    return;
  }

  if (kind === "quiz") {
    const mode = parts[1];
    const qid = parts[2];
    const choiceIndex = Number(parts[3]);
    const ownerUserId = parts[4];
    await handleQuizButton(interaction, mode, qid, choiceIndex, ownerUserId);
    return;
  }
});

client.login(token);