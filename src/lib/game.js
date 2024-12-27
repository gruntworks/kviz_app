import {_menu, _question} from "./templates.js";

export function game() {
    let easyQuestions = []
    let hardQuestions = []
    let usedQuestions = [];
    let sessionRunning = false;
    let sessionDuration = 0; // Keeping seconds for timer here
    let timerId = null;
    let paused = false;
    let score = 0;
    let mode = 'easy';

    const start = async (duration) => {
        score = 0;
        sessionDuration = duration * 60
        document.body.replaceChildren();
        addBackNavigation();
        addScoreTracker();
        // Create and add timer
        const timer = document.createElement('div');
        timer.id = 'timer'
        timer.innerText = sessionDuration;
        document.body.appendChild(timer)

        startTimer();
        sessionRunning = true;
        addRandomQuestion();
    }

    const startTimer = () => {
        timerId = setInterval(() => {
            if (paused) {
                return;
            }
            if (sessionDuration === 0) {
                endSession();
                return;
            }
            sessionDuration--;
            document.getElementById('timer').textContent = sessionDuration.toString();
        }, 1000);
    }

    const endSession = () => {
        sessionDuration = 0;
        sessionRunning = false;
        clearTimeout(timerId);
    }

    const loadHarderQuestions = () => {
        fetch('./public/assets/questions_harder.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                hardQuestions = data;
            })
            .catch(error => {
                console.error(error);
            });

    }

    const loadEasierQuestions = () => {
        fetch('./public/assets/questions_easier.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                easyQuestions = data;
            })
            .catch(error => {
                console.error(error);
            });

    }

    const markQuestionAsCorrect = () => {
        paused = false;
        if (!sessionRunning) return;
        score++;
        addRandomQuestion();
        updateScoreTracker();
    }

    const markQuestionAsWrong = () => {
        paused = false;
        if (!sessionRunning) return;
        addRandomQuestion()
    }

    const togglePause = () => {
        paused = !paused;
        // Set pause or play sign
        document.getElementById('pause').innerText = paused ? '\u23F5' : '\u23F8';

    }

    const addScoreTracker = () => {
        const tracker = document.createElement('div');
        tracker.id = 'score_tracker';
        tracker.innerText = `Točnih: ${score}`;
        document.body.appendChild(tracker);
    }

    const updateScoreTracker = () => {
        const tracker = document.getElementById('score_tracker');
        if (!tracker) return;
        tracker.innerText = `Točnih: ${score}`;
    }

    const addBackNavigation = () => {
        const button = document.createElement('button');
        button.id = 'back_nav';
        button.textContent = '←';
        document.body.appendChild(button);
        button.onclick = () => {
            endSession();
            showMenu();
        }
    }

    const addRandomQuestion = () => {
        let questions;

        // Remove previous question so that we can add a new one
        const element = document.getElementById('question-container');
        if (element) {
            element.remove();
        }

        if (mode === 'easy') {
            questions = easyQuestions;
        } else {
            questions = hardQuestions;
        }

        const questionContainer = document.createElement('div');
        let randomIndex;
        let randomQuestion;

        // If we used all questions, start over, otherwise use do-while to find index that has not been used
        if (usedQuestions.length === questions.length) {
            usedQuestions = [];
            randomIndex = Math.floor(Math.random() * questions.length);
        } else {
            // Keep generating a random index until we find one that hasn't been used
            do {
                randomIndex = Math.floor(Math.random() * questions.length);
            } while (usedQuestions.includes(randomIndex));
        }

        // Now we know the randomIndex is not in usedQuestions
        randomQuestion = questions[randomIndex];

        // Add the random question to usedQuestions so we don't reuse it
        usedQuestions.push(randomIndex);

        // Append the question element
        questionContainer.id = 'question-container';
        questionContainer.innerHTML = _question; // Assuming _question is your template

        document.body.appendChild(questionContainer);

        // Add question elements
        document.getElementById('question_text').innerText = randomQuestion.pitanje;
        document.getElementById('correct').onclick = markQuestionAsCorrect;
        document.getElementById('incorrect').onclick = markQuestionAsWrong;
        document.getElementById('pause').onclick = togglePause;

        const choices = document.getElementById('question_choices');

        // Add answers
        randomQuestion.odgovori.forEach((q, idx) => {
            const choice = document.createElement('span');
            choice.classList.add('choice');
            if (randomQuestion.tocan === idx + 1) {
                choice.classList.add('answer');
            }
            choice.innerText = q;
            choices.appendChild(choice);
        });
    }


    const showMenu = () => {
        mode = 'easy';
        document.body.replaceChildren();
        const menu = document.createElement('div');
        menu.classList.add('menu')
        menu.innerHTML = _menu
        document.body.appendChild(menu);
        document.getElementById('1min').onclick = () => start(1)
        document.getElementById('2min').onclick = () => start(2)
        document.getElementById('difficulty_toggle').onchange = (e) => {
            if (e.target.checked) {
                mode = 'hard';
            } else {
                mode = 'easy';
            }
        }
    }

    const init = async () => {
        await loadEasierQuestions();
        await loadHarderQuestions();
        showMenu();
    }

    return {
        init,
        start,
    }
}

window.onload = () => {
    game().init();
}