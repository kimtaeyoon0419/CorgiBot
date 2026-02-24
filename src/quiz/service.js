const { loadUsers, saveUsers, getUser } = require("../db/store");
const { getAllQuestions } = require("./questions");
const { pickUnsolvedQuestion, pickWrongQuestion } = require("./questions");
const { buildChoiceRows, disableRows, buildResetRow } = require("./buttons");
const {
    fmtPct,
    msgLoading,
    msgAlreadyActive,
    msgNeedResetFirst,
    msgWrongEmpty,
    msgUnknownMode,
    msgStartNormal,
    msgStartWrong,
    msgExpired,
    renderQuestionText,
    renderResultText,
    msgCleared,
    msgResetYes,
    msgResetNo,
    msgNotOwnerQuiz,
    msgNotOwnerReset,
    msgQuizInvalid,
    msgChoiceInvalid,
    msgMyStats,
} = require("./render");
const {
    isLocked,
    lock,
    unlock,
    hasActive,
    setActive,
    getActiveByMessage,
    clearActive,
} = require("./state");

function calcAccuracy(u) {
    if (!u.totalAttempts) return 0;
    return (u.totalCorrect / u.totalAttempts) * 100;
}

async function startQuiz(message, mode) {
    const userId = message.author.id;

    if (isLocked(userId)) {
        await message.reply(msgLoading());
        return;
    }
    if (hasActive(userId)) {
        await message.reply(msgAlreadyActive());
        return;
    }

    lock(userId);
    try {
        const db = loadUsers();
        const u = getUser(db, userId);

        if (u.awaitingReset) {
            await message.reply(msgNeedResetFirst());
            return;
        }

        let q = null;

        if (mode === "normal") {
            q = pickUnsolvedQuestion(u);
            if (!q) {
                const accuracy = fmtPct(calcAccuracy(u));
                u.awaitingReset = true;
                saveUsers(db);

                await message.channel.send({
                    content: msgCleared(message.author.toString(), accuracy),
                    components: [buildResetRow(userId)],
                });
                return;
            }
        } else if (mode === "wrong") {
            q = pickWrongQuestion(u);
            if (!q) {
                await message.reply(msgWrongEmpty());
                return;
            }
        } else {
            await message.reply(msgUnknownMode());
            return;
        }

        const prefix =
            mode === "wrong"
                ? msgStartWrong(message.author.toString())
                : msgStartNormal(message.author.toString());

        const sent = await message.channel.send({
            content: prefix + renderQuestionText(q),
            components: buildChoiceRows(q, userId, mode),
        });

        setActive(userId, sent.id, { userId, question: q, mode });

        // 3분 만료
        setTimeout(async () => {
            const data = getActiveByMessage(sent.id);
            if (!data) return;

            try {
                await sent.edit({
                    content: sent.content + msgExpired(),
                    components: disableRows(sent.components),
                });
            } catch {
                // ignore
            }
            clearActive(userId, sent.id);
        }, 3 * 60 * 1000);
    } finally {
        unlock(userId);
    }
}

async function handleResetButton(interaction, yesNo, ownerUserId) {
    if (interaction.user.id !== ownerUserId) {
        await interaction.reply({ content: msgNotOwnerReset(), ephemeral: true });
        return;
    }

    const db = loadUsers();
    const u = getUser(db, ownerUserId);

    if (yesNo === "yes") {
        u.totalAttempts = 0;
        u.totalCorrect = 0;
        u.solved = {};
        u.wrong = [];
        u.awaitingReset = false;
        saveUsers(db);

        await interaction.update({
            content: msgResetYes(interaction.user.toString()),
            components: [],
        });
        return;
    }

    if (yesNo === "no") {
        u.awaitingReset = false;
        saveUsers(db);

        await interaction.update({
            content: msgResetNo(interaction.user.toString()),
            components: [],
        });
        return;
    }
}

async function handleQuizButton(interaction, mode, qid, choiceIndex, ownerUserId) {
    if (interaction.user.id !== ownerUserId) {
        await interaction.reply({ content: msgNotOwnerQuiz(), ephemeral: true });
        return;
    }

    const data = getActiveByMessage(interaction.message.id);
    if (!data || data.userId !== ownerUserId || data.question.id !== qid) {
        await interaction.reply({ content: msgQuizInvalid(), ephemeral: true });
        return;
    }

    const q = data.question;

    if (!Number.isFinite(choiceIndex) || choiceIndex < 0 || choiceIndex >= q.choices.length) {
        await interaction.reply({ content: msgChoiceInvalid(), ephemeral: true });
        return;
    }

    const isCorrect = choiceIndex === q.answerIndex;

    // 저장
    const db = loadUsers();
    const u = getUser(db, ownerUserId);

    u.totalAttempts += 1;
    if (isCorrect) u.totalCorrect += 1;

    if (!u.solved[q.id]) u.solved[q.id] = { attempts: 0, correct: false };
    u.solved[q.id].attempts += 1;
    if (isCorrect) u.solved[q.id].correct = true;

    const wrongSet = new Set(Array.isArray(u.wrong) ? u.wrong : []);
    if (!isCorrect) wrongSet.add(q.id);
    if (isCorrect) wrongSet.delete(q.id);
    u.wrong = Array.from(wrongSet);

    saveUsers(db);

    await interaction.update({
        content:
            interaction.message.content +
            `\n\n---\n${renderResultText(interaction.user.toString(), q, choiceIndex, isCorrect)}`,
        components: disableRows(interaction.message.components),
    });

    clearActive(ownerUserId, interaction.message.id);
}

async function showMyStats(message) {
  const db = loadUsers();
  const u = getUser(db, message.author.id);

  const totalQuestions = getAllQuestions().length;
  const solvedCount = Object.values(u.solved ?? {}).filter(v => v?.correct === true).length;
  const wrongCount = Array.isArray(u.wrong) ? u.wrong.length : 0;

  const accuracy = u.totalAttempts ? (u.totalCorrect / u.totalAttempts) * 100 : 0;

  const stats = {
    totalAttempts: u.totalAttempts,
    totalCorrect: u.totalCorrect,
    accuracyPct: fmtPct(accuracy),
    solvedCount,
    totalQuestions,
    wrongCount,
  };

  await message.reply(msgMyStats(message.author.toString(), stats));
}

module.exports = { startQuiz, handleResetButton, handleQuizButton, showMyStats };