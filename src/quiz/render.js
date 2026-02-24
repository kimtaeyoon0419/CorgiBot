function fmtPct(value) {
  return `${value.toFixed(1)}%`;
}

function msgLoading() {
  return "문제 준비 중입니다.. 기다려주세요!";
}
function msgAlreadyActive() {
  return "이미 풀이 중인 문제가 있어요. 기존 문제에서 버튼을 눌러주세요!";
}
function msgNeedResetFirst() {
  return "이미 모든 문제를 푸셨어요. 초기화 여부를 먼저 선택해주세요!";
}
function msgWrongEmpty() {
  return "오답 노트가 비어있어요! (`!문제 출제`로 먼저 풀어보세요.)";
}
function msgUnknownMode() {
  return "알 수 없는 모드예요.";
}

function msgStartNormal(userMention) {
  return `${userMention} 문제 갑니다! 🚀\n\n`;
}
function msgStartWrong(userMention) {
  return `${userMention} 오답 노트 문제 갑니다! 📝\n\n`;
}
function msgExpired() {
  return "\n\n⏰ 시간이 지나 이 문제는 만료되었습니다.";
}

function renderQuestionText(q) {
  const title = q.title ?? "프로그래밍 기능사";
  const choicesText = q.choices.map((c, i) => `${i + 1}️⃣ ${c}`).join("\n");
  return (
    `📘 **${title}**\n` +
    `**문제:** ${q.question}\n\n` +
    `${choicesText}\n\n` +
    `👉 아래 버튼으로 정답을 선택하세요!`
  );
}

function renderResultText(userMention, q, choiceIndex, isCorrect) {
  return (
    `${userMention} 선택: **${choiceIndex + 1}번 (${q.choices[choiceIndex] ?? "?"})**\n\n` +
    (isCorrect ? "✅ **정답입니다!**" : "❌ **오답입니다.**") +
    `\n\n🎯 **정답:** ${q.answerIndex + 1}번 (${q.choices[q.answerIndex]})` +
    `\n📝 **해설:** ${q.explanation ?? "해설이 없습니다."}`
  );
}

function msgCleared(userMention, accuracyPct) {
  return `${userMention} 모든 문제를 푸셨습니다. 당신의 정답률은: **${accuracyPct}** 입니다!\n초기화하고 다시 시작할까요?`;
}
function msgResetYes(userMention) {
  return `${userMention} 초기화 완료! 다시 \`!문제 출제\`로 시작하세요.`;
}
function msgResetNo(userMention) {
  return `${userMention} 기록을 유지했습니다. 원하면 \`!문제 출제\`로 다시 진행할 수 있어요.`;
}

function msgNotOwnerQuiz() {
  return "이 문제는 출제한 사람만 풀 수 있어요.";
}
function msgNotOwnerReset() {
  return "이 버튼은 해당 사용자만 사용할 수 있어요.";
}
function msgQuizInvalid() {
  return "이 퀴즈는 만료되었거나 정보를 찾을 수 없어요.";
}
function msgChoiceInvalid() {
  return "선택 정보가 올바르지 않아요.";
}

function msgMyStats(userMention, stats) {
  return (
    `📊 **내 기록** (${userMention})\n` +
    `- 푼 문제 수: **${stats.totalAttempts}**\n` +
    `- 맞춘 문제 수: **${stats.totalCorrect}**\n` +
    `- 정답률: **${stats.accuracyPct}**\n` +
    `- 올클리어 진행: **${stats.solvedCount} / ${stats.totalQuestions}**\n` +
    `- 오답 노트: **${stats.wrongCount}**개\n\n` +
    `명령어: \`!문제 출제\`, \`!오답 노트\`, \`!내기록\``
  );
}

module.exports = {
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
};