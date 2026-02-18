(function () {
  const readMoreButtons = document.querySelectorAll(".read-more");
  readMoreButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const fullReview = button.previousElementSibling;
      if (!fullReview) return;
      const isOpen = fullReview.style.display === "block";
      fullReview.style.display = isOpen ? "none" : "block";
      button.textContent = isOpen ? "Read More" : "Show Less";
    });
  });

  const form = document.getElementById("recommend-form");
  const thankYou = document.getElementById("thank-you-msg");
  if (form && thankYou) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        thankYou.textContent = "Please complete all fields before submitting.";
        thankYou.className = "feedback lose";
        return;
      }
      thankYou.textContent = "Thank you! I've received your recommendation and added it to my list.";
      thankYou.className = "feedback win";
      form.reset();
    });
  }

  const grid = document.getElementById("memory-grid");
  const startBtn = document.getElementById("memory-start");
  const resetBtn = document.getElementById("memory-reset");
  const message = document.getElementById("memory-message");
  const timeEl = document.getElementById("memory-time");
  const movesEl = document.getElementById("memory-moves");
  const matchesEl = document.getElementById("memory-matches");
  const bestEl = document.getElementById("memory-best");

  if (!grid || !startBtn || !resetBtn) return;

  const icons = ["🎬", "🍿", "✨", "📺", "🎭", "💫", "🎵", "🌙"];
  let cards = [];
  let opened = [];
  let matched = 0;
  let moves = 0;
  let timeLeft = 45;
  let timerId = null;
  let active = false;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function updateStats() {
    movesEl.textContent = String(moves);
    matchesEl.textContent = String(matched);
    timeEl.textContent = String(timeLeft);
    const best = localStorage.getItem("movieMemoryBestMoves");
    bestEl.textContent = best || "--";
  }

  function setMessage(text, tone) {
    message.textContent = text;
    message.className = `feedback ${tone || ""}`.trim();
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function endGame(win) {
    active = false;
    stopTimer();
    if (win) {
      const best = Number(localStorage.getItem("movieMemoryBestMoves") || "0");
      if (!best || moves < best) {
        localStorage.setItem("movieMemoryBestMoves", String(moves));
      }
      setMessage(`You won in ${moves} moves! Amazing memory!`, "win");
    } else {
      setMessage("Time's up! Reset and try again.", "lose");
      cards.forEach((card) => {
        card.button.classList.add("is-flipped");
        card.button.textContent = card.icon;
      });
    }
    updateStats();
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(function () {
      timeLeft -= 1;
      updateStats();
      if (timeLeft <= 0) {
        endGame(false);
      }
    }, 1000);
  }

  function createBoard() {
    const deck = shuffle([...icons, ...icons]);
    cards = deck.map((icon, index) => ({ id: index, icon, matched: false }));
    grid.innerHTML = "";

    cards.forEach((card) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "memory-card";
      button.setAttribute("aria-label", "Hidden memory card");
      button.textContent = "?";
      button.dataset.id = String(card.id);
      card.button = button;
      grid.appendChild(button);
    });
  }

  function resetGame(messageText) {
    active = false;
    opened = [];
    matched = 0;
    moves = 0;
    timeLeft = 45;
    createBoard();
    stopTimer();
    updateStats();
    setMessage(messageText || "Press Start Game to begin your challenge.", "tie");
  }

  function flipCard(card) {
    card.button.classList.add("is-flipped");
    card.button.textContent = card.icon;
  }

  function hideCard(card) {
    card.button.classList.remove("is-flipped");
    card.button.textContent = "?";
  }

  grid.addEventListener("click", function (event) {
    const target = event.target;
    if (!active || !target.classList.contains("memory-card")) return;

    const id = Number(target.dataset.id);
    const card = cards.find((item) => item.id === id);
    if (!card || card.matched || opened.includes(card)) return;

    flipCard(card);
    opened.push(card);

    if (opened.length < 2) return;

    moves += 1;
    const [first, second] = opened;

    if (first.icon === second.icon) {
      first.matched = true;
      second.matched = true;
      first.button.classList.add("is-matched");
      second.button.classList.add("is-matched");
      opened = [];
      matched += 1;
      setMessage("Nice match! Keep going!", "win");
      if (matched === icons.length) {
        endGame(true);
      }
      updateStats();
      return;
    }

    setMessage("Not a match. Try again!", "lose");
    updateStats();

    setTimeout(function () {
      hideCard(first);
      hideCard(second);
      opened = [];
    }, 700);
  });

  startBtn.addEventListener("click", function () {
    resetGame("Game started! Match all pairs before time runs out.");
    active = true;
    setMessage("Game started! Match all pairs before time runs out.", "tie");
    startTimer();
  });

  resetBtn.addEventListener("click", function () {
    resetGame("Board reset. Press Start Game when you are ready.");
  });

  resetGame();
})();
