const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// customId: quiz:<mode>:<qid>:<choiceIndex>:<ownerUserId>
function buildChoiceRows(q, ownerUserId, mode) {
  const rows = [];
  for (let i = 0; i < q.choices.length; i += 5) {
    const chunk = q.choices.slice(i, i + 5);

    const row = new ActionRowBuilder().addComponents(
      ...chunk.map((_, idx) => {
        const choiceIndex = i + idx;
        return new ButtonBuilder()
          .setCustomId(`quiz:${mode}:${q.id}:${choiceIndex}:${ownerUserId}`)
          .setLabel(String(choiceIndex + 1))
          .setStyle(ButtonStyle.Primary);
      })
    );

    rows.push(row);
  }
  return rows;
}

function disableRows(components) {
  return components.map((row) => {
    const newRow = new ActionRowBuilder();
    newRow.addComponents(
      ...row.components.map((btn) => ButtonBuilder.from(btn).setDisabled(true))
    );
    return newRow;
  });
}

// customId: reset:<yes/no>:<ownerUserId>
function buildResetRow(ownerUserId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`reset:yes:${ownerUserId}`)
      .setLabel("초기화하고 다시 시작")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`reset:no:${ownerUserId}`)
      .setLabel("유지하고 종료")
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = { buildChoiceRows, disableRows, buildResetRow };