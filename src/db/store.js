const fs = require("fs");
const path = require("path");

const USER_DB_PATH = path.join(__dirname, "user.json");

function ensureUserDbFile() {
  if (!fs.existsSync(USER_DB_PATH)) {
    fs.writeFileSync(USER_DB_PATH, JSON.stringify({}, null, 2), "utf-8");
  }
}

function loadUsers() {
  ensureUserDbFile();
  const raw = fs.readFileSync(USER_DB_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    // 깨졌으면 백업 후 초기화
    fs.writeFileSync(USER_DB_PATH + ".broken", raw, "utf-8");
    fs.writeFileSync(USER_DB_PATH, JSON.stringify({}, null, 2), "utf-8");
    return {};
  }
}

function saveUsers(db) {
  ensureUserDbFile();
  fs.writeFileSync(USER_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function getUser(db, userId) {
  if (!db[userId]) {
    db[userId] = {
      totalAttempts: 0,
      totalCorrect: 0,
      solved: {},       // qid -> { attempts: number, correct: boolean }
      wrong: [],        // qid[]
      awaitingReset: false
    };
  }
  return db[userId];
}

module.exports = { loadUsers, saveUsers, getUser };