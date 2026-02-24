const questions = require("../db/question.json");

function assertQuestions() {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("db/question.json이 비어있거나 형식이 잘못됐어요.");
  }
}

function getAllQuestions() {
  assertQuestions();
  return questions;
}

function pickUnsolvedQuestion(user) {
  const all = getAllQuestions();

  // ✅ 오답 노트(wrong)에 있는 문제는 normal 출제에서 제외
  const wrongSet = new Set(Array.isArray(user.wrong) ? user.wrong : []);

  // 안전장치: solved에 attempts가 있는데 correct=false면 사실상 오답이므로 제외
  const unsolved = all.filter((q) => {
    const rec = user.solved?.[q.id];
    const isSolved = rec?.correct === true;
    const wasTriedButNotSolved = rec?.attempts > 0 && rec?.correct !== true;
    const isWrong = wrongSet.has(q.id) || wasTriedButNotSolved;

    return !isSolved && !isWrong;
  });

  if (unsolved.length === 0) return null;
  return unsolved[Math.floor(Math.random() * unsolved.length)];
}

function pickWrongQuestion(user) {
  const wrongIds = Array.isArray(user.wrong) ? user.wrong : [];
  if (wrongIds.length === 0) return null;

  const all = getAllQuestions();
  const qid = wrongIds[Math.floor(Math.random() * wrongIds.length)];
  return all.find((q) => q.id === qid) ?? null;
}

module.exports = { getAllQuestions, pickUnsolvedQuestion, pickWrongQuestion };