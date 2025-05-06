const heart = document.querySelector('.heart');
const passwordBox = document.getElementById('passwordBox');
const secretLetter = document.getElementById('secretLetter');
const errorMessage = document.getElementById('errorMessage');
const input = document.getElementById('passwordInput');
const button = passwordBox.querySelector('button');

const correctPassword = "hogar";
const maxAttempts = 3;
const lockDuration = 1 * 60 * 1000; // 1 minuto (en milisegundos)

let attempts = parseInt(localStorage.getItem('attempts')) || 0;
let lockedUntil = localStorage.getItem('lockedUntil');
lockedUntil = lockedUntil ? parseInt(lockedUntil) : null;

let cartaDesbloqueada = localStorage.getItem('cartaDesbloqueada') === 'true';

//localStorage.clear()

const audio = new Audio('love.mp3');
audio.volume = 0.5;

function showErrorMessage(message) {
  errorMessage.textContent = message;
  setTimeout(() => {
    errorMessage.textContent = "";
  }, 3000);
}

function updateLockStatus() {
  if (lockedUntil) {
    const now = Date.now();
    if (now < lockedUntil) {
      lockInput(true);
      startCountdown(lockedUntil - now);
    } else {
      localStorage.removeItem('lockedUntil');
      attempts = 0;
      localStorage.setItem('attempts', attempts);
      lockInput(false);
    }
  }
}

function lockInput(state) {
  input.disabled = state;
  button.disabled = state;
}

function startCountdown(duration) {
  lockInput(true);
  let remaining = duration;

  const countdownInterval = setInterval(() => {
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      errorMessage.textContent = "";
      lockInput(false);
      localStorage.removeItem('lockedUntil');
      localStorage.setItem('attempts', 0);
      attempts = 0;
      return;
    }

    const hours = String(Math.floor(remaining / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((remaining % (1000 * 60)) / 1000)).padStart(2, '0');

    errorMessage.textContent = `⏳ Vuelve a intentarlo en ${hours}h ${minutes}min ${seconds}segundos`;
    remaining -= 1000;
  }, 1000);
}

heart.addEventListener('click', () => {
  input.value = "";
  errorMessage.textContent = "";
  cartaDesbloqueada = false;

  localStorage.removeItem('cartaDesbloqueada');
  localStorage.removeItem('attempts');

  attempts = 0;

  passwordBox.style.display = 'block';
  secretLetter.style.display = 'none';

  updateLockStatus(); 
});



button.addEventListener('click', handleAttempt);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAttempt();
});

function handleAttempt() {
  if (input.disabled) return;

  const userInput = input.value.trim().toLowerCase();
  if (userInput === '') {
    showErrorMessage("💬 Por favor, escribe algo");
    return;
  }

  if (userInput === correctPassword) {
    passwordBox.style.display = 'none';
    secretLetter.style.display = 'block';
    audio.play();
    lanzarMuchoConfeti(); // 🎉
    cartaDesbloqueada = true;
    localStorage.setItem('cartaDesbloqueada', 'true');
    localStorage.removeItem('attempts');
    localStorage.removeItem('lockedUntil');
    
  } else {
    attempts++;
    localStorage.setItem('attempts', attempts);

    if (attempts >= maxAttempts) {
      const lockTime = Date.now() + lockDuration;
      localStorage.setItem('lockedUntil', lockTime);
      lockedUntil = lockTime; 
      showErrorMessage("❌ Agotaste tus intentos. Espérate 1 minuto.");
      startCountdown(lockDuration);
      lockInput(true);
      updateLockStatus();
    } else {
      const remaining = maxAttempts - attempts;
      showErrorMessage(`❌ Contraseña incorrecta. ${remaining === 1 ? 'Te queda 1 oportunidad.' : `Te quedan ${remaining} oportunidades.`}`);
    }
  }
}

updateLockStatus();

if (cartaDesbloqueada) {
  secretLetter.style.display = 'block';
}

const pistas = [
  "Pista 1: Que eres para mi ❤️",
  "Pista 2: empieza con H...",
  "Pista 3: lo que siempre te digo" 
];

let pistaIndex = 0;

setInterval(() => {
  pistaIndex = (pistaIndex + 1) % pistas.length;
  input.placeholder = pistas[pistaIndex];
}, 2500);


function lanzarMuchoConfeti() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random(), y: Math.random() - 0.2 }
    });
  }, 250);
}

document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', e => {
  // F12
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
  }

  if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
    e.preventDefault();
  }

  if (e.ctrlKey && e.key.toLowerCase() === 'u') {
    e.preventDefault();
  }

  if (e.ctrlKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
  }
});
