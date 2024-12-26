import {_menu, _question} from "./templates.js";

export function game() {
    let allQuestions = [];
    let usedQuestions = [];
    let sessionRunning = false;
    let sessionDuration = 0; // Keeping seconds for timer here
    let timerId = null;
    let score = 0;

    const start = async (duration) => {
        await loadAllQuestions();

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

    const loadAllQuestions = () => {
        fetch('./public/assets/questions2k.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                allQuestions = data;
            })
            .catch(error => {
                console.error(error);
            });

    }

    const markQuestionAsCorrect = () => {
        if (!sessionRunning) return;
        score++;
        addRandomQuestion();
        updateScoreTracker();
    }

    const markQuestionAsWrong = () => {
        if (!sessionRunning) return;
        addRandomQuestion()
    }

    const addScoreTracker = () => {
        const tracker = document.createElement('div');
        tracker.id = 'score_tracker';
        tracker.innerText = `Točnih: ${score}`;
        document.body.appendChild(tracker);
    }

    const updateScoreTracker = () => {
        const tracker = document.getElementById('score_tracker');
        if(!tracker) return;
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
        // First remove previous question
        const element = document.getElementById('question-container');
        if (element) {
            element.remove();
        }

        const questionContainer = document.createElement('div');
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        const randomQuestion = allQuestions[randomIndex];

        // If question was used, repeat adding question
        if (usedQuestions.includes(randomIndex)) {
            addRandomQuestion();
            return;
        }

        // Add to usedQuestions so that we do not repeat questions
        usedQuestions.push(randomIndex);

        // Append the question element
        questionContainer.id = 'question-container';
        questionContainer.innerHTML = _question;
        document.body.appendChild(questionContainer);

        // Add question elements
        document.getElementById('question_text').innerText = randomQuestion.pitanje;
        document.getElementById('right').onclick = markQuestionAsCorrect;
        document.getElementById('wrong').onclick = markQuestionAsWrong;
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
        })

    }

    const showMenu = () => {
        document.body.replaceChildren();
        const menu = document.createElement('div');
        menu.classList.add('menu')
        menu.innerHTML = _menu
        document.body.appendChild(menu);
        document.getElementById('1min').onclick = () => start(1)
        document.getElementById('2min').onclick = () => start(2)
    }

    const init = async () => {
        await loadAllQuestions();
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