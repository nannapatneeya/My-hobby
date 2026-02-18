(function () {
  const gameButtons = document.querySelectorAll(".game-btn");
  const startBtn = document.getElementById("start-game");
  const resetBtn = document.getElementById("reset-game");
  const playerScoreEl = document.getElementById("player-score");
  const computerScoreEl = document.getElementById("computer-score");
  const roundCountEl = document.getElementById("round-count");
  const gameMessageEl = document.getElementById("game-message");

  let gameStarted = false;
  let playerScore = 0;
  let computerScore = 0;
  let rounds = 0;

  const picks = ["rock", "paper", "scissors"];

  function setMessage(text, tone) {
    if (!gameMessageEl) return;
    gameMessageEl.textContent = text;
    gameMessageEl.classList.remove("win", "lose", "tie");
    if (tone) gameMessageEl.classList.add(tone);
  }

  function updateScoreboard() {
    if (playerScoreEl) playerScoreEl.textContent = String(playerScore);
    if (computerScoreEl) computerScoreEl.textContent = String(computerScore);
    if (roundCountEl) roundCountEl.textContent = String(rounds);
  }

  function lockIfDone() {
    if (playerScore >= 5 || computerScore >= 5) {
      const playerWon = playerScore > computerScore;
      setMessage(playerWon ? "You won the match! 🎉 Press Reset to play again." : "Computer wins this match. Press Reset and try again!", playerWon ? "win" : "lose");
      gameStarted = false;
    }
  }

  function playRound(playerPick) {
    if (!gameStarted) {
      setMessage("Press Start Match first.", "tie");
      return;
    }

    const computerPick = picks[Math.floor(Math.random() * picks.length)];
    rounds += 1;

    if (playerPick === computerPick) {
      setMessage(`Round ${rounds}: tie! You both picked ${playerPick}.`, "tie");
      updateScoreboard();
      return;
    }

    const playerWins =
      (playerPick === "rock" && computerPick === "scissors") ||
      (playerPick === "paper" && computerPick === "rock") ||
      (playerPick === "scissors" && computerPick === "paper");

    if (playerWins) {
      playerScore += 1;
      setMessage(`Round ${rounds}: ${playerPick} beats ${computerPick}. You score!`, "win");
    } else {
      computerScore += 1;
      setMessage(`Round ${rounds}: ${computerPick} beats ${playerPick}. Computer scores.`, "lose");
    }

    updateScoreboard();
    lockIfDone();
  }

  if (startBtn && resetBtn && gameButtons.length) {
    startBtn.addEventListener("click", function () {
      gameStarted = true;
      setMessage("Match started! Choose rock, paper, or scissors.");
    });

    resetBtn.addEventListener("click", function () {
      gameStarted = false;
      playerScore = 0;
      computerScore = 0;
      rounds = 0;
      updateScoreboard();
      setMessage("Game reset. Press Start Match to begin.");
    });

    gameButtons.forEach((button) => {
      button.addEventListener("click", function () {
        playRound(button.dataset.choice);
      });
    });
  }

  const form = document.querySelector(".recommend-form");
  const formFeedback = document.getElementById("form-feedback");

  if (form && formFeedback) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        formFeedback.textContent = "Please fill out all required fields correctly.";
        formFeedback.className = "feedback lose";
        return;
      }

      formFeedback.textContent = "Thanks! Your recommendation has been saved locally in this demo.";
      formFeedback.className = "feedback win";
      form.reset();
    });
  }
})();
