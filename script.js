// --- Core Data ---
const textArray = [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is learning to tame chaos.",
    "A journey of a thousand miles begins with a single step.",
    "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    "Innovation distinguishes between a leader and a follower.",
    "The only way to do great work is to love what you do.",
    "Life is 10% what happens to you and 90% how you react to it."
];

let currentTextIndex = 0;
let startTime = 0;
let timer = null;
let isTyping = false;
let errors = 0;
let scoreHistory = []; // Stores WPM of past tests

// --- DOM Elements ---
const textDisplay = document.getElementById('text-display');
const userInput = document.getElementById('user-input');
const restartBtn = document.getElementById('restart-btn');
const wpmSpan = document.getElementById('wpm');
const accuracySpan = document.getElementById('accuracy');
const errorsSpan = document.getElementById('errors');
const timeSpan = document.getElementById('time');
const messageBox = document.getElementById('message');
const historyList = document.getElementById('score-history');

// --- Feature 1: Load Text and Setup ---
function loadText() {
    // Cycle through texts for variety
    currentTextIndex = (currentTextIndex + 1) % textArray.length;
    const text = textArray[currentTextIndex];
    textDisplay.innerHTML = '';
    
    // Wrap each character in a span for styling/tracking
    text.split('').forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        if (index === 0) {
            charSpan.classList.add('current'); // Mark the first character as current
        }
        textDisplay.appendChild(charSpan);
    });
}

// --- Timer Functionality ---
function startTimer() {
    startTime = new Date().getTime();
    timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        timeSpan.textContent = elapsedTime + 's';
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

// --- Typing Input Handler ---
userInput.addEventListener('input', () => {
    const typedText = userInput.value;
    const originalText = textDisplay.textContent;
    const characters = textDisplay.querySelectorAll('span');
    
    // Start the timer on the very first keystroke
    if (typedText.length === 1 && !isTyping) {
        isTyping = true;
        startTimer();
    }

    errors = 0; // Recalculate errors on every input change

    for (let i = 0; i < originalText.length; i++) {
        const charSpan = characters[i];
        const typedChar = typedText[i];

        // 1. Reset classes
        charSpan.classList.remove('correct', 'incorrect', 'current');

        if (typedChar == null) {
            // Untyped character
            if (i === typedText.length) {
                charSpan.classList.add('current');
            }
        } else if (typedChar === originalText[i]) {
            // Correct character
            charSpan.classList.add('correct');
        } else {
            // Incorrect character
            charSpan.classList.add('incorrect');
            errors++;
        }
    }
    
    // Move 'current' class to the next untyped character (or last if finished)
    const nextIndex = typedText.length;
    if (nextIndex < originalText.length) {
        characters[nextIndex].classList.add('current');
    }

    // Update error count immediately
    errorsSpan.textContent = errors;

    // Check for test completion
    if (typedText.length === originalText.length) {
        finishTest();
    }
});


// --- Feature 2 & 3: Calculation and Congratulation/Improvement ---
function finishTest() {
    stopTimer();
    isTyping = false;
    userInput.disabled = true; // Lock the input
    
    const totalTimeInMinutes = (new Date().getTime() - startTime) / 60000;
    const wordCount = textDisplay.textContent.split(' ').length;
    
    // WPM = (Total Characters / 5) / Time in Minutes (Standard WPM calculation)
    const calculatedWPM = Math.round((textDisplay.textContent.length / 5) / totalTimeInMinutes);
    
    // Accuracy = ((Total Characters - Errors) / Total Characters) * 100
    const calculatedAccuracy = Math.max(0, Math.round(((textDisplay.textContent.length - errors) / textDisplay.textContent.length) * 100));

    // Update results
    wpmSpan.textContent = calculatedWPM;
    accuracySpan.textContent = calculatedAccuracy + '%';

    // Save score and update history (Feature 3)
    scoreHistory.push({ wpm: calculatedWPM, accuracy: calculatedAccuracy });
    updateHistoryDisplay();
    
    // Feature 2: Congratulation and Improvement Message
    const lastScore = scoreHistory[scoreHistory.length - 2]; // Second to last score

    if (scoreHistory.length === 1) {
        messageBox.className = 'message success';
        messageBox.textContent = `🎉 Test Complete! Your first score is ${calculatedWPM} WPM!`;
    } else if (calculatedWPM > lastScore.wpm) {
        const improvement = calculatedWPM - lastScore.wpm;
        messageBox.className = 'message improvement';
        messageBox.textContent = `🚀 Great Job! You improved by ${improvement} WPM! Your new best is ${calculatedWPM} WPM.`;
    } else if (calculatedWPM >= 50 && calculatedAccuracy > 95) {
        messageBox.className = 'message success';
        messageBox.textContent = `🏆 Excellent Work! ${calculatedWPM} WPM with ${calculatedAccuracy}% accuracy!`;
    } else {
        messageBox.className = 'message';
        messageBox.textContent = `Test finished. You did great! Try again to improve!`;
    }
}

// --- Feature 4: Score History and Improvement Tracking ---
function updateHistoryDisplay() {
    // Keep only the last 5 scores for display
    const recentScores = scoreHistory.slice(-5).reverse(); 

    historyList.innerHTML = '';
    if (recentScores.length === 0) {
        historyList.innerHTML = '<li>No scores yet.</li>';
        return;
    }

    recentScores.forEach((score, index) => {
        const li = document.createElement('li');
        const displayIndex = recentScores.length - index;
        li.textContent = `Run ${displayIndex}: ${score.wpm} WPM | ${score.accuracy}% Accuracy`;
        historyList.appendChild(li);
    });
}

// --- Restart Function ---
function restartTest() {
    stopTimer();
    isTyping = false;
    errors = 0;
    userInput.value = '';
    userInput.disabled = false;
    messageBox.textContent = '';
    messageBox.className = 'message';
    
    // Reset results
    wpmSpan.textContent = 0;
    accuracySpan.textContent = '100%';
    errorsSpan.textContent = 0;
    timeSpan.textContent = '0s';

    // Load new text
    loadText();
    userInput.focus();
}

// --- Initialization ---
loadText();
userInput.addEventListener('focus', () => {
    // Clear input on focus if it was the initial placeholder state
    if (!isTyping && userInput.value === '') {
        userInput.value = ''; 
    }
});

restartBtn.addEventListener('click', restartTest);