// src/quiz/state.js
const userLocks = new Map();        // userId -> boolean
const userActiveMsg = new Map();    // userId -> messageId
const activeQuizzes = new Map();    // messageId -> { userId, question, mode }

function isLocked(userId) {
  return userLocks.get(userId) === true;
}

function lock(userId) {
  userLocks.set(userId, true);
}

function unlock(userId) {
  userLocks.set(userId, false);
}

function hasActive(userId) {
  return userActiveMsg.has(userId);
}

function setActive(userId, messageId, payload) {
  userActiveMsg.set(userId, messageId);
  activeQuizzes.set(messageId, payload);
}

function getActiveByMessage(messageId) {
  return activeQuizzes.get(messageId);
}

function clearActive(userId, messageId) {
  activeQuizzes.delete(messageId);
  if (userActiveMsg.get(userId) === messageId) userActiveMsg.delete(userId);
}

module.exports = {
  isLocked,
  lock,
  unlock,
  hasActive,
  setActive,
  getActiveByMessage,
  clearActive,
};