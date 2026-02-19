(function () {
  const readMoreButtons = document.querySelectorAll('.read-more');
  readMoreButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const fullReview = button.previousElementSibling;
      if (!fullReview) return;
      if (fullReview.style.display === 'none' || fullReview.style.display === '') {
        fullReview.style.display = 'block';
        button.textContent = 'Show Less';
      } else {
        fullReview.style.display = 'none';
        button.textContent = 'Read More';
      }
    });
  });

  const form = document.querySelector('.recommend-form');
  const formFeedback = document.getElementById('form-feedback');
  if (form && formFeedback) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        formFeedback.textContent = 'Please fill out all required fields correctly.';
        formFeedback.className = 'feedback lose';
        return;
      }
      formFeedback.textContent = 'Thanks! Your recommendation has been saved locally in this demo.';
      formFeedback.className = 'feedback win';
      form.reset();
    });
  }

  const grid = document.getElementById('memory-grid');
  const startBtn = document.getElementById('memory-start');
  const resetBtn = document.getElementById('memory-reset');
  if (!grid || !startBtn || !resetBtn) return;

  const timeEl = document.getElementById('memory-time');
  const movesEl = document.getElementById('memory-moves');
  const matchesEl = document.getElementById('memory-matches');
  const bestEl = document.getElementById('memory-best');
  const messageEl = document.getElementById('memory-message');

  const icons = ['🎬', '🍿', '🎭', '✨', '📽️', '🌙', '🎵', '💫'];
  let cards = [];
  let opened = [];
  let matches = 0;
  let moves = 0;
  let timeLeft = 45;
  let timerId = null;
  let started = false;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function setMessage(text, tone) {
    messageEl.textContent = text;
    messageEl.classList.remove('win', 'lose', 'tie');
    if (tone) messageEl.classList.add(tone);
  }

  function updateStats() {
    timeEl.textContent = String(timeLeft);
    movesEl.textContent = String(moves);
    matchesEl.textContent = String(matches);
    bestEl.textContent = localStorage.getItem('movieMemoryBest') || '--';
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function createBoard() {
    const deck = shuffle([...icons, ...icons]);
    cards = deck.map((icon, id) => ({ id, icon, matched: false }));
    grid.innerHTML = '';

    cards.forEach((card) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memory-card';
      btn.dataset.id = String(card.id);
      btn.textContent = '?';
      btn.setAttribute('aria-label', 'Memory card');
      card.el = btn;
      grid.appendChild(btn);
    });
  }

  function resetGame(text) {
    started = false;
    opened = [];
    matches = 0;
    moves = 0;
    timeLeft = 45;
    stopTimer();
    createBoard();
    updateStats();
    setMessage(text || 'Press Start Game to begin.', 'tie');
  }

  function finish(win) {
    started = false;
    stopTimer();
    if (win) {
      const oldBest = Number(localStorage.getItem('movieMemoryBest') || '0');
      if (!oldBest || moves < oldBest) localStorage.setItem('movieMemoryBest', String(moves));
      setMessage(`You win! Finished in ${moves} moves.`, 'win');
    } else {
      setMessage('Time is up! Press Reset and try again.', 'lose');
    }
    updateStats();
  }

  grid.addEventListener('click', (event) => {
    const target = event.target;
    if (!started || !target.classList.contains('memory-card')) return;
    const id = Number(target.dataset.id);
    const card = cards.find((item) => item.id === id);
    if (!card || card.matched || opened.includes(card)) return;

    card.el.classList.add('is-flipped');
    card.el.textContent = card.icon;
    opened.push(card);

    if (opened.length < 2) return;
    moves += 1;

    const [a, b] = opened;
    if (a.icon === b.icon) {
      a.matched = true;
      b.matched = true;
      a.el.classList.add('is-matched');
      b.el.classList.add('is-matched');
      opened = [];
      matches += 1;
      setMessage('Nice match!', 'win');
      updateStats();
      if (matches === icons.length) finish(true);
      return;
    }

    setMessage('Not a match. Try again.', 'lose');
    updateStats();
    setTimeout(() => {
      a.el.classList.remove('is-flipped');
      b.el.classList.remove('is-flipped');
      a.el.textContent = '?';
      b.el.textContent = '?';
      opened = [];
    }, 700);
  });

  startBtn.addEventListener('click', () => {
    resetGame('Game started! Match all pairs before time runs out.');
    started = true;
    timerId = setInterval(() => {
      timeLeft -= 1;
      updateStats();
      if (timeLeft <= 0) finish(false);
    }, 1000);
  });

  resetBtn.addEventListener('click', () => {
    resetGame('Board reset. Press Start Game to play.');
  });

  resetGame();
})();
