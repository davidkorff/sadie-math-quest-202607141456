const STORAGE_KEY = "math-quest-v2";
const MAX_ANSWER_DIGITS = 3;
const SESSION_POINTS_PER_QUESTION = 100;
const APP_TITLE = "Math Quest";
const LEVEL_MAX = 10;

const LEVEL_CONFIG = {
  1: { maxOperand: 5, resultMax: 10, mulMax: 0, divMax: 0 },
  2: { maxOperand: 8, resultMax: 12, mulMax: 0, divMax: 0 },
  3: { maxOperand: 10, resultMax: 15, mulMax: 0, divMax: 0 },
  4: { maxOperand: 10, resultMax: 30, mulMax: 5, divMax: 0 },
  5: { maxOperand: 12, resultMax: 40, mulMax: 6, divMax: 0 },
  6: { maxOperand: 12, resultMax: 65, mulMax: 7, divMax: 6 },
  7: { maxOperand: 15, resultMax: 90, mulMax: 8, divMax: 7 },
  8: { maxOperand: 18, resultMax: 120, mulMax: 8, divMax: 8 },
  9: { maxOperand: 20, resultMax: 150, mulMax: 9, divMax: 9 },
  10: { maxOperand: 22, resultMax: 180, mulMax: 9, divMax: 9 },
};

const BASE_OPERATION_WEIGHTS = {
  "+": 4,
  "-": 3,
  "*": 2,
  "/": 2,
};

const OP_DISPLAY = {
  "+": "＋",
  "-": "－",
  "*": "×",
  "/": "÷",
};

const OP_NAMES = {
  "+": "addition",
  "-": "subtraction",
  "*": "multiplication",
  "/": "division",
};

const STORY_CHARS = ["Luna", "Milo", "Noah", "Iris", "Sam", "Zoe", "Kai", "Aria", "Nina"];

const LEVEL_OPS = {
  1: [["+", 1]],
  2: [["+", 3], ["-", 1]],
  3: [["+", 3], ["-", 2]],
  4: [["+", 3], ["-", 2], ["*", 1]],
  5: [["+", 2], ["-", 2], ["*", 2]],
  6: [["+", 2], ["-", 2], ["*", 2], ["/", 1]],
  7: [["+", 2], ["-", 2], ["*", 2], ["/", 1]],
  8: [["+", 2], ["-", 2], ["*", 2], ["/", 1]],
  9: [["+", 2], ["-", 2], ["*", 2], ["/", 1]],
  10: [["+", 2], ["-", 2], ["*", 2], ["/", 1]],
};

const opEls = {
  dateLabel: document.getElementById("dateLabel"),
  activeStudentPill: document.getElementById("activeStudentPill"),
  studentName: document.getElementById("studentName"),
  startBtn: document.getElementById("startBtn"),
  startPracticeBtn: document.getElementById("startPracticeBtn"),
  todayDoneHint: document.getElementById("todayDoneHint"),
  quickStats: document.getElementById("quickStats"),
  lastScore: document.getElementById("lastScore"),
  streakDisplay: document.getElementById("streakDisplay"),
  bestScore: document.getElementById("bestScore"),
  loginView: document.getElementById("login-view"),
  gameView: document.getElementById("game-view"),
  resultView: document.getElementById("result-view"),
  levelLabel: document.getElementById("levelLabel"),
  questionIndexLabel: document.getElementById("questionIndexLabel"),
  liveScoreLabel: document.getElementById("liveScoreLabel"),
  questionText: document.getElementById("questionText"),
  answerTiles: document.getElementById("answerTiles"),
  hintText: document.getElementById("hintText"),
  ledger: document.getElementById("ledger"),
  keypad: document.getElementById("keypad"),
  delBtn: document.getElementById("delBtn"),
  submitBtn: document.getElementById("submitBtn"),
  resultDate: document.getElementById("resultDate"),
  resultScore: document.getElementById("resultScore"),
  resultAccuracy: document.getElementById("resultAccuracy"),
  resultBest: document.getElementById("resultBest"),
  resultStreak: document.getElementById("resultStreak"),
  lessonPlan: document.getElementById("lessonPlan"),
  recentList: document.getElementById("recentList"),
  exportTodayBtn: document.getElementById("exportTodayBtn"),
  downloadAllBtn: document.getElementById("downloadAllBtn"),
  rawJsonBtn: document.getElementById("rawJsonBtn"),
  storyWords: document.getElementById("storyWords"),
  readStoryBtn: document.getElementById("readStoryBtn"),
  storyHint: document.getElementById("storyHint"),
  clearBtn: document.getElementById("clearBtn"),
  backToLoginBtn: document.getElementById("backToLoginBtn"),
  playAgainBtn: document.getElementById("playAgainBtn"),
};

let appData = null;
let activeStudent = null;
let currentSession = null;

function init() {
  appData = loadAppData();
  opEls.dateLabel.textContent = `Today: ${toDateString()}`;
  opEls.startBtn.addEventListener("click", () => startFlow(false));
  opEls.startPracticeBtn.addEventListener("click", () => startFlow(true));
  opEls.delBtn.addEventListener("click", onDeleteDigit);
  opEls.submitBtn.addEventListener("click", onSubmitTap);
  opEls.keypad.addEventListener("click", onPadTap);
  opEls.exportTodayBtn.addEventListener("click", onExportToday);
  opEls.downloadAllBtn.addEventListener("click", onDownloadAll);
  opEls.rawJsonBtn.addEventListener("click", onCopyRawStore);
  opEls.storyWords.addEventListener("click", onStoryWordTap);
  opEls.readStoryBtn.addEventListener("click", onReadStoryTap);
  opEls.clearBtn.addEventListener("click", onClearStudent);
  opEls.backToLoginBtn.addEventListener("click", showLogin);
  opEls.playAgainBtn.addEventListener("click", () => startFlow(true));

  opEls.studentName.value = localStorage.getItem("math_quest_last_name") || "Sadie";
  showLogin();
}

function startFlow(practiceMode) {
  const name = normalizeName(opEls.studentName.value);
  if (!name) {
    opEls.studentName.focus();
    return;
  }

  const student = getOrCreateStudent(name);
  activeStudent = student;
  localStorage.setItem("math_quest_last_name", name);

  const summaryToday = student.days?.[toDateString()] || null;
  if (!practiceMode && summaryToday) {
    renderResult(summaryToday, student);
    return;
  }

  currentSession = buildSession(student, practiceMode);
  renderGame();
}

function showLogin() {
  switchView("login");
  if (!activeStudent) {
    const firstStudent = getFirstStudent() || createGuest();
    if (firstStudent) {
      opEls.studentName.value = firstStudent.name;
      activeStudent = firstStudent;
      renderLoginStats(firstStudent);
      return;
    }
    opEls.quickStats.classList.add("hidden");
    opEls.activeStudentPill.textContent = "No player yet";
    opEls.studentName.value = "";
  } else {
    opEls.studentName.value = activeStudent.name;
    renderLoginStats(activeStudent);
  }
  opEls.activeStudentPill.textContent = activeStudent ? activeStudent.name : "No player yet";
}

function buildSession(student, practiceMode) {
  const date = toDateString();
  const level = student.level;
  const cfg = LEVEL_CONFIG[Math.min(level, LEVEL_MAX)];
  const focusOps = deriveFocusOps(student, date);
  const seedLabel = `${student.id}|${date}|${level}|${(focusOps[0] || "all")}`;
  const rng = createRNG(seedLabel);
  const questionCount = Math.min(12, 7 + Math.floor(level / 2));

  const session = {
    studentId: student.id,
    date,
    levelStart: level,
    questionCount,
    startedAt: Date.now(),
    practiceMode,
    questions: [],
    questionStates: [],
    input: "",
    currentIndex: 0,
    points: 0,
    seedLabel,
  };

  for (let i = 0; i < questionCount; i++) {
    const op = chooseOperation(level, focusOps, rng);
    session.questions.push(createQuestion(level, op, rng));
    session.questionStates.push({
      status: "pending",
      attempts: [],
      points: 0,
      lastResult: null,
    });
  }

  return session;
}

function createQuestion(level, op, rng) {
  const cfg = LEVEL_CONFIG[Math.min(level, LEVEL_MAX)];
  const opSafe = op || "+";

  if (opSafe === "+") {
    let a = randomInt(rng, 0, cfg.maxOperand);
    let b = randomInt(rng, 0, cfg.maxOperand);
    const tries = 40;
    for (let i = 0; i < tries; i++) {
      a = randomInt(rng, 0, cfg.maxOperand);
      b = randomInt(rng, 0, cfg.maxOperand);
      if (a + b <= cfg.resultMax && a + b >= 1) break;
    }
    return { a, b, op: "+", answer: a + b };
  }

  if (opSafe === "-") {
    let a = randomInt(rng, 0, cfg.resultMax);
    let b = randomInt(rng, 0, cfg.resultMax);
    const tries = 40;
    for (let i = 0; i < tries; i++) {
      b = randomInt(rng, 0, cfg.maxOperand);
      a = randomInt(rng, b, cfg.resultMax);
      if (a - b >= 0) break;
    }
    return { a, b, op: "-", answer: a - b };
  }

  if (opSafe === "*") {
    const multMax = Math.max(2, cfg.mulMax || 4);
    const a = randomInt(rng, 2, multMax);
    const b = randomInt(rng, 2, multMax);
    const answer = a * b;
    return { a, b, op: "*", answer };
  }

  if (opSafe === "/") {
    const divMax = Math.max(2, cfg.divMax || 5);
    const divisor = randomInt(rng, 2, divMax);
    const answer = randomInt(rng, 2, divMax);
    return { a: divisor * answer, b: divisor, op: "/", answer };
  }

  return { a: 1, b: 1, op: "+", answer: 2 };
}

function chooseOperation(level, focusOps, rng) {
  const allowed = LEVEL_OPS[Math.min(level, LEVEL_MAX)] || LEVEL_OPS[LEVEL_MAX];
  const weighted = allowed.map(([op, w]) => {
    const focusBonus = focusOps.includes(op) ? 1.75 : 1;
    const base = BASE_OPERATION_WEIGHTS[op] || 1;
    return { op, weight: w * focusBonus * base };
  });
  const total = weighted.reduce((acc, item) => acc + item.weight, 0);
  let r = rng() * total;

  for (const item of weighted) {
    r -= item.weight;
    if (r <= 0) return item.op;
  }

  return weighted[0].op;
}

function renderLoginStats(student) {
  const todaySummary = student.days?.[toDateString()] || null;
  const lastDate = student.lastCompletedDate || "-";
  const lastSummary =
    student.days && lastDate && student.days[lastDate]
      ? student.days[lastDate]
      : null;

  if (todaySummary) {
    opEls.todayDoneHint.classList.remove("hidden");
    opEls.todayDoneHint.textContent =
      "You already finished today’s mission. Tap Start Bonus Practice or review below.";
  } else {
    opEls.todayDoneHint.classList.add("hidden");
    opEls.todayDoneHint.textContent = "";
  }

  opEls.quickStats.classList.remove("hidden");
  opEls.lastScore.textContent = lastSummary ? `${lastSummary.scorePercent}%` : "-";
  opEls.streakDisplay.textContent = `${student.streak || 0} day`;
  opEls.bestScore.textContent = `${student.highestScore || 0}%`;
}

function renderGame() {
  switchView("game");
  opEls.activeStudentPill.textContent = activeStudent.name;
  opEls.levelLabel.textContent = `Lv ${currentSession.levelStart}`;
  opEls.liveScoreLabel.textContent = `${currentSession.points} / ${
    currentSession.questionCount * SESSION_POINTS_PER_QUESTION
  }`;
  renderCurrentQuestion();
  renderLedger();
}

function renderCurrentQuestion() {
  const index = currentSession.currentIndex;
  const q = currentSession.questions[index];
  const text = `${q.a} ${OP_DISPLAY[q.op]} ${q.b} = ?`;
  opEls.questionText.textContent = text;
  opEls.questionIndexLabel.textContent = `${index + 1}/${currentSession.questionCount}`;
  const state = currentSession.questionStates[index];
  opEls.hintText.textContent =
    state.status === "retry" ? state.lastResult?.hint || "Try again." : "";
  renderQuestionStory(q, state.status);
  renderInputTiles();
}

function renderInputTiles() {
  const text = currentSession.input.padEnd(MAX_ANSWER_DIGITS, "");
  opEls.answerTiles.innerHTML = "";
  for (let i = 0; i < MAX_ANSWER_DIGITS; i++) {
    const tile = document.createElement("div");
    tile.className = "tile" + (text[i] ? " filled" : "");
    tile.textContent = text[i] || "";
    opEls.answerTiles.appendChild(tile);
  }
}

function renderLedger() {
  opEls.ledger.innerHTML = "";
  currentSession.questionStates.forEach((state, index) => {
    const q = currentSession.questions[index];
    const row = document.createElement("div");
    row.className = "attempt-row";

    const top = document.createElement("div");
    top.className = "top";

    const left = document.createElement("strong");
    left.textContent = `${q.a} ${OP_DISPLAY[q.op]} ${q.b} =`;
    const right = document.createElement("span");
    right.textContent = state.attempts.length ? state.attempts.join(" • ") : "not yet";
    top.append(left, right);

    const note = document.createElement("p");
    note.className = "row-note";
    note.textContent = rowStatusText(state, q);
    row.append(top, note);

    const tileRow = document.createElement("div");
    tileRow.className = "tile-row";
    const displayText =
      state.status === "solved" || state.status === "revealed"
        ? String(state.status === "revealed" ? q.answer : state.attempts[state.attempts.length - 1])
        : state.attempts.length
        ? String(state.attempts[state.attempts.length - 1])
        : "";
    for (let i = 0; i < MAX_ANSWER_DIGITS; i++) {
      const t = document.createElement("div");
      t.className = "tile";
      const ch = displayText[i] || "";
      t.textContent = ch || " ";
      if (state.lastResult) {
        t.classList.add(state.lastResult.tileClass);
      } else if (state.status === "pending") {
        t.classList.add("blank");
      }
      tileRow.appendChild(t);
    }
    row.appendChild(tileRow);
    opEls.ledger.appendChild(row);
  });
}

function onPadTap(e) {
  const target = e.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const digit = target.dataset.digit;
  if (digit === undefined) return;
  if (currentSession.input.length >= MAX_ANSWER_DIGITS) return;
  currentSession.input += digit;
  renderInputTiles();
}

function onDeleteDigit() {
  if (!currentSession) return;
  currentSession.input = currentSession.input.slice(0, -1);
  renderInputTiles();
}

function onSubmitTap() {
  if (!currentSession) return;
  const trimmed = currentSession.input.trim();
  if (!trimmed) return;
  const guess = Number(trimmed);
  if (Number.isNaN(guess)) return;

  const idx = currentSession.currentIndex;
  const q = currentSession.questions[idx];
  const state = currentSession.questionStates[idx];

  if (state.status !== "pending" && state.status !== "retry") return;

  const result = evaluateGuess(q.answer, guess);
  state.attempts.push(guess);
  state.lastResult = {
    status: result.status,
    tileClass: result.tileClass,
    hint: result.hint,
  };

  if (result.status === "correct") {
    state.status = "solved";
    state.points = state.attempts.length === 1 ? 100 : 60;
    currentSession.points += state.points;
    currentSession.input = "";
    opEls.hintText.textContent = "Great job!";
    onQuestionComplete();
    return;
  }

  if (state.attempts.length === 1) {
    state.status = "retry";
    opEls.hintText.textContent = `Close. ${result.hint}`;
    opEls.storyHint.textContent = "Still stuck? Tap a word in the story to hear it.";
    currentSession.input = "";
    renderCurrentQuestion();
    renderLedger();
    return;
  }

  state.status = "revealed";
  state.points = 0;
  currentSession.input = "";
  opEls.hintText.textContent = `Answer is ${q.answer}`;
  onQuestionComplete();
}

function onQuestionComplete() {
  renderLedger();
  opEls.liveScoreLabel.textContent = `${currentSession.points} / ${
    currentSession.questionCount * SESSION_POINTS_PER_QUESTION
  }`;
  if (currentSession.currentIndex < currentSession.questionCount - 1) {
    currentSession.currentIndex += 1;
    setTimeout(() => renderCurrentQuestion(), 260);
  } else {
    finalizeSession();
  }
}

function rowStatusText(state, q) {
  if (state.status === "pending") return "Not started";
  if (state.status === "retry") {
    return `Try again — last: ${state.attempts[0]}`;
  }
  if (state.status === "solved") {
    return `Correct`;
  }
  return `Correct answer: ${q.answer}`;
}

function renderQuestionStory(question, questionStatus) {
  const story = question.story || generateQuestionStory(question);
  question.story = story;

  opEls.storyWords.innerHTML = "";

  if (!isSpeechSupported()) {
    opEls.readStoryBtn.disabled = true;
    opEls.storyHint.textContent =
      questionStatus === "pending" || questionStatus === "retry"
        ? "Voice is not available in this browser."
        : "";
    return;
  }

  const parts = tokenizeStory(story);
  opEls.readStoryBtn.disabled = false;

  parts.forEach((part) => {
    if (part.trim() === "") {
      opEls.storyWords.append(document.createTextNode(part));
      return;
    }
    if (isStoryWord(part)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "story-word";
      button.textContent = part;
      button.dataset.word = part;
      button.setAttribute("aria-label", `Read ${part}`);
      opEls.storyWords.appendChild(button);
      return;
    }
    opEls.storyWords.append(document.createTextNode(part));
  });

  opEls.storyHint.textContent = "Tap a story word to hear it.";
}

function onStoryWordTap(event) {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement) || !target.classList.contains("story-word")) {
    return;
  }
  speakText(target.dataset.word || target.textContent || "");
}

function onReadStoryTap() {
  if (!currentSession) return;
  const q = currentSession.questions[currentSession.currentIndex];
  if (!q?.story) return;
  speakText(q.story);
}

function generateQuestionStory(question) {
  const character =
    STORY_CHARS[(question.a * 5 + question.b * 11 + question.answer) % STORY_CHARS.length];
  if (question.op === "+") {
    return `${character} found ${question.a} shiny stars and then found ${question.b} more stars. How many stars are there now?`;
  }
  if (question.op === "-") {
    return `${character} had ${question.a} cookies and gave ${question.b} cookies to a friend. How many cookies are left?`;
  }
  if (question.op === "*") {
    return `${character} packed ${question.a} stickers into each of ${question.b} folders. How many stickers did ${character} use?`;
  }
  if (question.op === "/") {
    return `${character} split ${question.a} balloons into ${question.b} equal groups. How many balloons are in each group?`;
  }
  return `${character} saw ${question.a} and ${question.b}. Can you find the answer?`;
}

function tokenizeStory(storyText) {
  return storyText.match(/\s+|[A-Za-z']+|[0-9]+|[^\w\s]/g) || [];
}

function isStoryWord(part) {
  return /^[A-Za-z']+$/.test(part);
}

function isSpeechSupported() {
  return (
    typeof window.speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

function speakText(rawText) {
  if (!isSpeechSupported()) {
    alert("Speech is not supported in this browser.");
    return;
  }
  const text = sanitizeSpeechText(String(rawText || ""));
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function sanitizeSpeechText(rawText) {
  return String(rawText)
    .replace(/\s+/g, " ")
    .replace(/([A-Za-z])\s*'/g, "$1'")
    .trim();
}

function evaluateGuess(expected, guess) {
  const diff = guess - expected;
  if (guess === expected) {
    return {
      status: "correct",
      tileClass: "correct",
      hint: "You got it.",
    };
  }
  if (Math.abs(diff) <= 2) {
    return {
      status: "close",
      tileClass: "close",
      hint: guess < expected ? "Try a little higher." : "Try a little lower.",
    };
  }
  return {
    status: "wrong",
    tileClass: "wrong",
    hint: guess < expected ? "Too low." : "Too high.",
  };
}

function finalizeSession() {
  const endedAt = Date.now();
  const total = currentSession.questionCount;
  let correct = 0;
  let firstTryCorrect = 0;
  const opTotals = {};
  let totalAttempts = 0;

  currentSession.questionStates.forEach((state, index) => {
    const q = currentSession.questions[index];
    totalAttempts += state.attempts.length;
    if (state.status === "solved") {
      correct++;
      if (state.attempts.length === 1) firstTryCorrect++;
    }
    opTotals[q.op] = opTotals[q.op] || { correct: 0, total: 0 };
    opTotals[q.op].total++;
    if (state.status === "solved") opTotals[q.op].correct++;
  });

  const accuracy = correct / total;
  const scorePercent = Math.round((currentSession.points / (total * 100)) * 100);
  const avgAttempts = parseFloat((totalAttempts / total).toFixed(1));
  const durationSec = Math.round((endedAt - currentSession.startedAt) / 1000);

  const opAccuracy = {};
  Object.keys(opTotals).forEach((op) => {
    opAccuracy[op] = {
      correct: opTotals[op].correct,
      total: opTotals[op].total,
      accuracy: Math.round((opTotals[op].correct / opTotals[op].total) * 100),
    };
  });

  const levelEnd = computeNextLevel(currentSession.levelStart, scorePercent);
  const date = currentSession.date;
  const lessonPlan = computeLessonPlan(opAccuracy, correct, total);

  const summary = {
    appVersion: "2.0",
    studentId: activeStudent.id,
    date,
    levelStart: currentSession.levelStart,
    levelEnd,
    scorePercent,
    totalQuestions: total,
    correct,
    firstTryCorrect,
    avgAttempts,
    points: currentSession.points,
    durationSec,
    totalAttempts,
    accuracy,
    streak: nextStreak(activeStudent, date),
    opAccuracy,
    lessonPlan,
    questionStates: currentSession.questionStates.map((state, idx) => ({
      index: idx,
      q: currentSession.questions[idx],
      attempts: state.attempts,
      status: state.status,
      points: state.points,
    })),
    seedLabel: currentSession.seedLabel,
  };

  if (!currentSession.practiceMode) {
    activeStudent.level = levelEnd;
    activeStudent.lastCompletedDate = date;
    activeStudent.streak = summary.streak;
    activeStudent.highestScore = Math.max(
      activeStudent.highestScore || 0,
      scorePercent
    );
    activeStudent.days = activeStudent.days || {};
    activeStudent.days[date] = summary;

    saveAppData();
  }

  renderResult(summary, activeStudent);
  currentSession = null;
}

function computeNextLevel(currentLevel, scorePercent) {
  if (scorePercent >= 80) return Math.min(currentLevel + 1, LEVEL_MAX);
  return currentLevel;
}

function nextStreak(student, today) {
  const prevDate = student.lastCompletedDate;
  if (!prevDate) return 1;
  const yesterday = toDateString(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  if (prevDate === yesterday) return (student.streak || 0) + 1;
  if (prevDate === today) return student.streak || 1;
  return 1;
}

function computeLessonPlan(opAccuracy, correct, total) {
  let targetOp = null;
  let low = 101;
  Object.entries(opAccuracy).forEach(([op, metrics]) => {
    if (metrics.total >= 2 && metrics.accuracy < low) {
      low = metrics.accuracy;
      targetOp = op;
    }
  });

  const accuracyText = `${correct}/${total}`;
  if (!targetOp) {
    return {
      message: "Great coverage across all skills today. Keep the same mix tomorrow.",
      focus: null,
      targetQuestions: Math.max(4, total + 1),
      tags: ["mixed"],
    };
  }

  return {
    message: `Focus more on ${OP_NAMES[targetOp]} in tomorrow’s review.`,
    focus: targetOp,
    targetQuestions: total,
    tags: ["targeted", OP_NAMES[targetOp]],
    fromToday: accuracyText,
  };
}

function renderResult(summary, student) {
  switchView("result");
  opEls.activeStudentPill.textContent = student.name;
  opEls.resultDate.textContent = `${formatDateHuman(summary.date)} · Level ${summary.levelEnd}`;
  opEls.resultScore.textContent = `${summary.scorePercent}%`;
  opEls.resultAccuracy.textContent = `${Math.round(summary.accuracy * 100)}%`;
  opEls.resultBest.textContent = `${student.highestScore || 0}%`;
  opEls.resultStreak.textContent = `${summary.streak} days`;
  opEls.lessonPlan.innerHTML = `<strong>Coach note:</strong> ${summary.lessonPlan.message}`;

  const recent = getRecentSummaries(student, 7);
  opEls.recentList.innerHTML = "";
  if (!recent.length) {
    opEls.recentList.innerHTML = "<p>No history yet.</p>";
    return;
  }

  recent.forEach((item) => {
    const row = document.createElement("div");
    row.className = "recent-item";
    const left = document.createElement("span");
    left.textContent = formatDateHuman(item.date);
    const right = document.createElement("span");
    right.textContent = `${item.scorePercent}% • ${item.correct}/${item.totalQuestions}`;
    row.append(left, right);
    opEls.recentList.appendChild(row);
  });
}

function getRecentSummaries(student, limit = 7) {
  const list = Object.entries(student.days || {}).map(([date, summary]) => ({
    date,
    ...summary,
  }));
  list.sort((a, b) => b.date.localeCompare(a.date));
  return list.slice(0, limit).reverse();
}

async function onExportToday() {
  if (!activeStudent || !currentSession) {
    const date = toDateString();
    const summary = activeStudent?.days?.[date];
    if (!summary) {
      alert("No current day summary to export.");
      return;
    }
    await copyToClipboard(JSON.stringify(summary, null, 2), "Today’s summary copied.");
    return;
  }
  const summary = activeStudent?.days?.[toDateString()];
  if (!summary) {
    alert("No saved summary yet. Finish today’s mission first.");
    return;
  }
  await copyToClipboard(JSON.stringify(summary, null, 2), "Today’s summary copied.");
}

function onDownloadAll() {
  if (!activeStudent) return;
  const payload = {
    exportDate: new Date().toISOString(),
    appVersion: "2.0",
    students: appData.students,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `math-quest-${sanitizeFileName(activeStudent.name)}-${toDateString()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function onCopyRawStore() {
  copyToClipboard(localStorage.getItem(STORAGE_KEY) || "{}");
}

function onClearStudent() {
  if (!activeStudent) return;
  if (!confirm(`Clear ${activeStudent.name}'s saved data?`)) return;
  delete appData.students[activeStudent.id];
  activeStudent = null;
  localStorage.setItem("math_quest_last_name", "");
  saveAppData();
  showLogin();
}

async function copyToClipboard(payload, message = "Copied to clipboard.") {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload);
      alert(message);
      return;
    } catch (err) {
      // fallthrough to prompt
    }
  }
  window.prompt("Copy this JSON:", payload);
}

function switchView(name) {
  opEls.loginView.classList.toggle("active", name === "login");
  opEls.gameView.classList.toggle("active", name === "game");
  opEls.resultView.classList.toggle("active", name === "result");
}

function getOrCreateStudent(name) {
  appData.students = appData.students || {};
  const key = String(name || "").trim().toLowerCase();
  const existing = appData.students[key];
  if (existing) return (activeStudent = existing);

  const id = `s-${Date.now().toString(36)}`;
  const student = {
    id,
    key,
    name,
    level: 1,
    streak: 0,
    highestScore: 0,
    createdAt: Date.now(),
    days: {},
  };
  appData.students[key] = student;
  saveAppData();
  return (activeStudent = student);
}

function getFirstStudent() {
  const keys = Object.keys(appData.students || {});
  if (!keys.length) return null;
  return appData.students[keys[0]];
}

function createGuest() {
  const last = localStorage.getItem("math_quest_last_name");
  if (last) {
    return getOrCreateStudent(last);
  }
  const guest = getOrCreateStudent("Sadie");
  activeStudent = guest;
  return guest;
}

function deriveFocusOps(student, today) {
  const dayKeys = Object.keys(student.days || {});
  if (!dayKeys.length) return [];
  const yesterday = toDateString(
    new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
  );
  const previous = student.days[yesterday] || null;
  if (previous?.opAccuracy) {
    return Object.entries(previous.opAccuracy)
      .filter(([, v]) => v.total >= 2)
      .sort((a, b) => a[1].accuracy - b[1].accuracy)
      .slice(0, 2)
      .map(([op]) => op);
  }
  return [];
}

function toDateString(d = new Date()) {
  return d.toLocaleDateString("en-CA");
}

function formatDateHuman(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

function randomInt(rng, min, maxInclusive) {
  return Math.floor(rng() * (maxInclusive - min + 1)) + min;
}

function createRNG(seedText) {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return mulberry32(h >>> 0);
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeName(name) {
  return String(name || "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadAppData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const data = { version: 2, students: {} };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const data = { version: 2, students: {} };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }
}

function saveAppData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function sanitizeFileName(value) {
  return String(value || "data").replace(/[^a-z0-9-_]/gi, "_").toLowerCase();
}

document.addEventListener("DOMContentLoaded", init);
