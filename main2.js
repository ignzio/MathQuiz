function play(e) {
    e.preventDefault();
    UIManager.getInstance().onStartGameEvent();
}


//classes
// GameManager > singletion : controls the state of the game
// GameController > singletion : controls the functions of the game
// UIManager > singletion : controle the UI of the game
// Player
// Game
// MessageBox > singletion
// MessageButtons  
class GameManager {
    static instance;
    _currentPlayer;
    _currentGame;
    _timer = 0;
    static getInstance() {
        if (GameManager.instance == null) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    setCurrentPlayer(player) {
        this._currentPlayer = player;
    }
    startGame(difficulty) {
        switch (difficulty) {
            case 'Beginner':
                this._timer = 60;
                break;
            case 'Intermediate':
                this._timer = 120;
                break;
            case 'Advanced':
                this._timer = 180;
                break;
            case 'Expert':
                this._timer = 240;
                break;
            default:
                throw new Error('Invalid difficulty');
        }

        this._currentGame = new Game(difficulty, this._currentPlayer, this._timer);
        const UIManagerInstance = UIManager.getInstance();
        UIManagerInstance.hideSelectDifficultyUI();
        UIManagerInstance.showQuestionUI();
        UIManagerInstance.showInfoUI();
        UIManagerInstance.showPlayerInfoUI(this._currentPlayer);
        UIManagerInstance.showGameInfoUI(this._currentGame);
        UIManagerInstance.showTimerUI(this._timer);
        UIManagerInstance.showStopWatchUI(0.0);
        UIManagerInstance._checkAnswerButton.disabled = true;
        UIManagerInstance._playerAnswerInput.disabled = true;
        UIManagerInstance._generateQuestionButton.disabled = false;
    }


}

class GameController {
    static instance;
    _gameManager = GameManager.getInstance();
    _messageBox = MessageBox.getInstance();
    _uiManager = UIManager.getInstance();

    static getInstance() {
        if (GameController.instance == null) {
            GameController.instance = new GameController();
        }
        return GameController.instance;
    }
    checkAnswer(event) {
        event.preventDefault();
   

        //if the user input is not empty or null or undefined
        const playerAnswer = this._uiManager._playerAnswerInput.value;
        if (playerAnswer == '' || playerAnswer == null || playerAnswer == undefined) {
            const textMessage = "Please enter your answer";
            const buttons = [{ text: "OK", onclick: () => { this._messageBox.hide(); } }];

            this._uiManager._playerAnswerInput.focus()
            this._messageBox.display("", textMessage, buttons);
            return;
        }

        //get the current game
        const currentGame = this._gameManager._currentGame;
        const currentPlayer = currentGame._currentPlayer;
        const currentQuestion = currentGame.currentQuestion;
        const currentAnswer = currentGame.currentAnswer;
        const currentGameDifficulty = currentGame.difficulty;

     
     
        //check if the player answer is correct
        if (parseInt(playerAnswer) == currentAnswer || parseFloat(playerAnswer) == currentAnswer) {
            //calculate the reward
            const reward = this.calculateRewards(currentGameDifficulty, currentGame._stopWatch);
            const extraTime = this.calculateExtraTime(currentGameDifficulty, currentGame._stopWatch, currentGame._strike);
            const textMessage = `
            <h2 class="correct-text"><span>Correct Answer<span></h2>
            <span style="color:chartreuse">+${reward} points</span>
            <br>
            <span style="color:chartreuse">+${extraTime} seconds</span>
            `;

            const buttons = [{
                text: "OK", onclick: () => {
                    this._messageBox.hide();
                    currentPlayer.increaseScore(reward);
                    this._uiManager._playerAnswerInput.classList.remove('correct'); 
                }
            }];
            this._messageBox.display("", textMessage, buttons); //display the message box

            //pause the timer
            currentGame.pouseTimer();
            currentGame.stopStopWatch();
            currentGame.increaseStrike();

          
            currentGame.addTime(extraTime);


            this._uiManager._playerAnswerInput.classList.remove('wrong');
            this._uiManager._playerAnswerInput.classList.remove('correct');
            this._uiManager._playerAnswerInput.classList.add('correct');
            this._uiManager._playerAnswerInput.disabled = true;
            this._uiManager._checkAnswerButton.disabled = true;
            this._uiManager._generateQuestionButton.disabled = false;

         
        }
        else {
            const textMessage = `
            <h2 class="wrong-text"><span>Wrong Answer<span></h2>
            <span style="color:crimson">-1 life</span>
            `;
            const buttons = [{
                text: "OK", onclick: () => {
                    this._messageBox.hide();
                    this._uiManager._playerAnswerInput.classList.remove('wrong');
                }
            }];
            this._messageBox.display("", textMessage, buttons); //display the message box

            //pause the timer
            currentGame.pouseTimer();
            currentGame.stopStopWatch();
            currentGame.resetStrike();

            //remove 1 life from the player
            currentPlayer.decreaseLife();


            this._uiManager._playerAnswerInput.classList.remove('wrong');
            this._uiManager._playerAnswerInput.classList.remove('correct');
            this._uiManager._playerAnswerInput.classList.add('wrong');
            this._uiManager._playerAnswerInput.disabled = true;
            this._uiManager._checkAnswerButton.disabled = true;
            this._uiManager._generateQuestionButton.disabled = false;


            //check if the player has no more life
            if (currentPlayer.life < 0) {
                //game over cleanup 
                
              
            }

        }
    }

    calculateRewards(difficulty, stopWatch) {
        const rewards = {
          "Beginner": 10,
          "Intermediate": 20,
          "Advanced": 30,
          "Expert": 40
        }
        const multiplier = {
          "Beginner": 1,
          "Intermediate": 2,
          "Advanced": 3,
          "Expert": 4
        }
        const stopWatchMultiplier = {
          35: 0.8,
          30: 1,
          25: 1.75,
          20: 2.5,
          15: 3.25,
          10: 4,
        };
        
        stopWatch = Math.round(stopWatch);
        
        const timeValues = Object.keys(stopWatchMultiplier);
        
        let minTimeValue = timeValues.find((time) => time >= stopWatch);
        
        if (!minTimeValue) {
          minTimeValue = timeValues[timeValues.length - 1];
        }
        
        const minMultiplier = stopWatchMultiplier[minTimeValue];
        
        const result = stopWatch * minMultiplier;
        
        let reward = rewards[difficulty] * multiplier[difficulty] * minMultiplier;
        
        // Introduce randomness to the reward calculation using one of four famous sequences
        const sequences = [
          [0,1,1,2,3,5,8,13], // Fibonacci sequence
          [2,1,3,4,7,11,18], // Lucas sequence
          [1,-1,-2,-1,-3,-2,-4], // Pell sequence
          [1,-2,-5,-7,-12,-17] // Jacobsthal sequence
        ];
        
        const randomSequenceIndex = Math.floor(Math.random() * sequences.length);
        
        const randomSequence = sequences[randomSequenceIndex];
        
        const randomIndex = Math.floor(Math.random() * randomSequence.length);
        
        reward *= (randomSequence[randomIndex] / (randomSequence.length -1));
        // Round the reward to the nearest integer
        reward = Math.round(reward);

        
        return Math.abs(reward);
      }
      

    calculateExtraTime(difficulty, stopWatch, strike) {
        // Define some constants for the extra time calculation
        const BASE_TIME = 10; // The base time bonus for any correct answer
        const DIFFICULTY_FACTOR = 2; // The factor by which the difficulty level increases the time bonus
        const STOPWATCH_FACTOR = 0.1; // The factor by which the remaining stopwatch time increases the time bonus
        const STRIKE_FACTOR = -0.5; // The factor by which the strike count decreases the time bonus
        const MIN_TIME = 0; // The minimum extra time possible
        const MAX_TIME = 30; // The maximum extra time possible
      
        // Define an object to map the difficulty levels to numerical values
        const difficultyValues = {
          "Beginner": 1,
          "Intermediate": 2,
          "Advanced": 3,
          "Expert": 4
        };
      
        // Get the numerical value of the player’s level
        const difficultyValue = difficultyValues[difficulty] || 1;
      
        // Calculate the extra time based on the formula:
        // extraTime = baseTime + (difficultyValue * difficultyFactor) + (stopWatch * stopwatchFactor) + (strike * strikeFactor)
        let extraTime = BASE_TIME + (difficultyValue * DIFFICULTY_FACTOR) + (stopWatch * STOPWATCH_FACTOR) + (strike * STRIKE_FACTOR);
      
        // Round the extra time to the nearest integer
        extraTime = Math.round(extraTime);
      
        // Clamp the extra time between the minimum and maximum values
        extraTime = Math.max(MIN_TIME, Math.min(MAX_TIME, extraTime));
      
        return extraTime;
      }
      




    generateQuestion(event) {
        event.preventDefault();

        //get the difficulty of the current game
        const currentGame = this._gameManager._currentGame;
        const difficulty = currentGame.difficulty;

        // generate a question based on the difficulty and set the curent question and answer to the current game
        let question;
        let answer;
        switch (difficulty) {
            case 'Beginner':
                [question, answer] = this.beginnerQuestion();
                currentGame.setCurrentQuestion(question);
                currentGame.setCurrentAnswer(answer);
                console.log(question);
                console.log(answer);
                console.log(currentGame);
                break;
            case 'Intermediate':
                [question, answer] = this.intermediateQuestion();
                currentGame.setCurrentQuestion(question);
                currentGame.setCurrentAnswer(answer);
                break;
            case 'Advanced':
                [question, answer] = this.advancedQuestion();
                currentGame.setCurrentQuestion(question);
                currentGame.setCurrentAnswer(answer);

                break;
            case 'Expert':
                [question, answer] = this.expertQuestion();
                currentGame.setCurrentQuestion(question);
                currentGame.setCurrentAnswer(answer);
                break;

            default:
                throw new Error('Invalid difficulty');
        }
        //show the question on the UI
        this._uiManager.showQuestionUI(currentGame.getCurrentQuestion());
        //disable the generate question button
        this._uiManager._generateQuestionButton.disabled = true;
        this._uiManager._playerAnswerInput.disabled = false;
        //enable the check answer button
        this._uiManager._checkAnswerButton.disabled = false;
        //focus on the player answer input
        this._uiManager._playerAnswerInput.focus();
        this._uiManager._playerAnswerInput.classList.remove('wrong');
        this._uiManager._playerAnswerInput.classList.remove('correct');


        //start the timer
        currentGame.startTimer();
        currentGame.startStopWatch();

    }
    beginnerQuestion() {
        const firstNumber = Math.floor(Math.random() * 10);
        const secondNumber = Math.floor(Math.random() * 10);
        const operator = ['+', '-'][Math.floor(Math.random() * 2)];
        const answer = operator === '+' ? firstNumber + secondNumber : firstNumber - secondNumber;
        const question = `${firstNumber} ${operator} ${secondNumber}`;

        return [question, answer];


    }
    intermediateQuestion() {
        const firstNumber = Math.floor(Math.random() * 100);
        const secondNumber = Math.floor(Math.random() * 100);
        const operator = ['+', '-'][Math.floor(Math.random() * 2)];
        const answer = operator === '+' ? firstNumber + secondNumber : firstNumber - secondNumber;
        const question = `${firstNumber} ${operator} ${secondNumber}`;

        return [question, answer]
    }
    advancedQuestion() {
        const firstNumber = Math.floor(Math.random() * 1000);
        const secondNumber = Math.floor(Math.random() * 1000);
        const operator = ['+', '-'][Math.floor(Math.random() * 2)];
        const answer = operator === '+' ? firstNumber + secondNumber : firstNumber - secondNumber;
        const question = `${firstNumber} ${operator} ${secondNumber}`;

        return [question, answer]
    }
    expertQuestion() {
        const firstNumber = Math.floor(Math.random() * 10000);
        const secondNumber = Math.floor(Math.random() * 10000);
        const operator = ['+', '-'][Math.floor(Math.random() * 2)];
        const answer = operator === '+' ? firstNumber + secondNumber : firstNumber - secondNumber;
        const question = `${firstNumber} ${operator} ${secondNumber}`;

        return [question, answer]
    }
    startTimer() { }


}

class UIManager {
    static instance;
    _gameManager = GameManager.getInstance();
    _messageBox = MessageBox.getInstance();
    static getInstance() {
        if (UIManager.instance == null) {
            UIManager.instance = new UIManager();
        }

        return UIManager.instance;
    }
    //all the UI queries
    _startGameUI = document.getElementsByClassName("start-game-container")[0];
    _playerNameInput = document.getElementById('player-name-input');


    _InfoUI = document.getElementsByClassName("info-container")[0];

    _playerInfoUI = document.getElementsByClassName("player-info-container")[0];
    _playerNameTag = document.getElementById('player-name-tag');
    _playerScoreTag = document.getElementById('player-score-tag');
    _playerDifficultyTag = document.getElementById('player-difficulty-tag');
    _playerLivesTag = document.getElementById('player-lives-tag');
    _playerTimeTag = document.getElementById('player-time-tag');

    _gameInfoUI = document.getElementsByClassName("game-info-container")[0];
    _gameDifficultyTag = document.getElementById('game-difficulty-tag');
    _gameTimerTag = document.getElementById('game-timer-tag');
    _gameStopwatchTag = document.getElementById('game-stopwatch-tag');

    _questionUI = document.getElementsByClassName("question-container")[0];
    _questionTag = document.getElementById('question-tag');
    _checkAnswerButton = document.getElementById('check-answer-button');
    _generateQuestionButton = document.getElementById('generate-question-button');
    _playerAnswerInput = document.getElementById('answer-input');


    _selectDifficultyUI = document.getElementsByClassName("select-difficulty-container")[0];
    _selectDifficultyButton = document.getElementById('select-difficulty-button');
    _difficultyRadioButtons = [...document.querySelectorAll('input[name="difficulty"]')];


    //all the UI functions
    //start Game UI
    showStartGameUI() {
        this._startGameUI.style.display = "block";
    }
    hideStartGameUI() {
        this._startGameUI.style.display = "none";
    }

    //info UI
    showInfoUI() {

        this._InfoUI.style.display = "flex";

    }
    updatePlayerScoreUI(score) {
        this._playerScoreTag.innerHTML = "Score: " + score;
    }

    //question UI
    async showQuestionUI(question) {
        // Use requestAnimationFrame to optimize the animation performance
        requestAnimationFrame(() => {
            this._questionUI.style.display = 'flex';

        });

        // Use a promise to wait for a specified time
        await new Promise((resolve) => {
            this._timeoutId = setTimeout(resolve, 50); // Adjust the delay time as needed (e.g., 10ms)
        });

        // Use requestAnimationFrame again to apply the style changes
        requestAnimationFrame(() => {
            this._questionUI.style.opacity = 1;
            this._questionUI.style.transform = 'translateY(0)';

            //ease-in-out
            this._questionUI.style.transition = 'all 0.5s ease-in-out';
        });
        if (question) {
            this._questionTag.innerHTML = question;
        }

    }
    hideQuestionUI() {
        this._questionUI.style.display = "none";
    }
    //player info UI
    showPlayerInfoUI(currentPlayer) {
        this._playerInfoUI.style.display = "block";
        this._playerNameTag.style.display = "block";
        this._playerNameTag.innerHTML = "Player: " + currentPlayer._name + " ";
        this._playerScoreTag.style.display = "block";
        this._playerScoreTag.innerHTML = "Score: " + currentPlayer._score + " ";
        this._playerLivesTag.style.display = "block";
        this._playerLivesTag.innerHTML = "Lives: " + currentPlayer._lives + " ";

    }
    hidePlayerInfoUI() {
        this._playerInfoUI.style.display = "none";
    }
    //game info UI
    showGameInfoUI(currentGame) {
        this._gameInfoUI.style.display = "block";
        this._gameDifficultyTag.style.display = "block";
        this._gameDifficultyTag.innerHTML = "Difficulty: " + currentGame.difficulty + " ";
    }
    hideGameInfoUI() {
        this._gameInfoUI.style.display = "none";
    }
    showTimerUI(timer) {
        this._gameTimerTag.style.display = "block";
        this._gameTimerTag.innerHTML = "Time: " + timer + " ";
    }
    showStopWatchUI(stopwatch) {
        this._gameStopwatchTag.style.display = "block";
        this._gameStopwatchTag.innerHTML = "Stopwatch: " + stopwatch + " ";
    }


    //select difficulty UI
    showSelectDifficultyUI() {
        this._selectDifficultyUI.style.display = "flex";
    }
    hideSelectDifficultyUI() {
        this._selectDifficultyUI.style.display = "none";
    }
    //all the UI events
    //start game UI
    onStartGameEvent() {
        this.hideStartGameUI();
        this.showSelectDifficultyUI();
        this._gameManager.setCurrentPlayer(new Player(this._playerNameInput.value));
        if (!this._selectDifficultyButton.hasAttribute("onclick")) {
            this._selectDifficultyButton.setAttribute("onclick", "UIManager.getInstance().onSelectDifficultyEvent()");
        }
    }
    onSelectDifficultyEvent() {
        const playerDifficultyChoose = this._difficultyRadioButtons.find(difficulty => difficulty.checked);
        let buttons;
        let messageText;
        if (playerDifficultyChoose) {
            messageText = "Are you sure you want to start the game with the difficulty: " + playerDifficultyChoose.value + "?";
            buttons = [
                { text: "Yes", onclick: () => { this._gameManager.startGame(playerDifficultyChoose.value), this._messageBox.hide() } },
                { text: "No", onclick: () => this._messageBox.hide() }
            ]
            this._messageBox.display("Select Difficulty", messageText, buttons);
            return;
        }
        messageText = "Please select a difficulty level";
        buttons = [{ text: 'Close', onclick: () => { this._messageBox.hide() } }];

        this._messageBox.display("Are you Not ready?", messageText, buttons);
    }



}

class Player {
    _name;
    _score;
    _level;
    _experience;
    _lives;

    _uiManager = UIManager.getInstance();

    constructor(name) {
        this._name = name;
        this._score = 0;
        this._level = 0;
        this._experience = 0;
        this._lives = 3;
    }
    setName(name) {
        this._name = name;
    }
    setScore(score) {
        this._score = score;
    }
    setLevel(level) {
        this._level = level;
    }
    setLives(lives) {
        this._lives = lives;
    }
    decreaseLife() {
        this._lives--;
        this._uiManager._playerLivesTag.innerHTML = "Lives: " + this._lives + " ";
    }
    setExperience(experience) {
        this._experience = experience;
    }
    increaseScore(score) {
        this._score += score;
        //show the score on the UI
        this._uiManager._playerScoreTag.innerHTML = "Score: " + this._score + " ";
    }
    increaseScoreByMultiplier(score, multiplier) {
        this._score += score * multiplier;
        //show the score on the UI
        this._uiManager._playerScoreTag.innerHTML = "Score: " + this._score + " ";
    }
    increaseScoreByGameDifficulty(score, difficulty) {
        switch (difficulty) {
            case "Beginner":
                this._score += score * 1.0;
                break;
            case "Intermediate":
                this._score += score * 1.5;
                break;
            case "Advanced":
                this._score += score * 1.75;
            case "Expert":
                this._score += score * 2.0;
                break;
            default:
                throw new Error("Difficulty not found");
        }
        //show the score on the UI
        this._uiManager.updatePlayerScoreUI(this._score);
    }
}

class Game {
    listOfQuestions = []; // the list of questions that will be asked
    currentQuestion; // the current question that is being asked
    currentAnswer; // the answer of the current question
    currentPlayerAnswer; // the answer that the player choose
    difficulty;
    _timeToAnswer = 60; // the time that the player has to answer the question
    _timeToAnswerInterval; // the interval that will be used to count down the time to answer
    _strike = 0; // the number of strikes that the player has

    _stopWatch = 0.0;
    _stopWatchInterval;

    _multiplier = 1.0;




    _currentPlayer; // the player that is playing or played this game

    _uiManager = UIManager.getInstance();

    constructor(difficulty, player, timeToAnswer = 60) {
        this.difficulty = difficulty;
        this._currentPlayer = player;
        this._timeToAnswer = timeToAnswer;
    }
    setCurrentQuestion(question) {
        this.currentQuestion = question;
    }
    getCurrentQuestion() {
        return this.currentQuestion;
    }
    getDifficulty() {
        return this.difficulty;
    }
    setCurrentAnswer(answer) {
        this.currentAnswer = answer;
    }
    startTimer() {
        this._timeToAnswerInterval = setInterval(() => {
            this._timeToAnswer--;
            //TODO: update the UI with the time left
            this._uiManager._gameTimerTag.innerHTML = "Time Left: " + this._timeToAnswer + " ";
            if (this._timeToAnswer == 0) {
                this.stopTimer();
                this.stopStopWatch();
                //TODO: show the player that he lost
                //TODO: GAME OVER

            }
        }, 1000);
    }
    pouseTimer() {
        clearInterval(this._timeToAnswerInterval);
    }
    resumeTimer() {
        this.startTimer();
    }
    stopTimer() {
        clearInterval(this._timeToAnswerInterval);
        this._timeToAnswer = 60;
    }
    addTime(time) {
        this._timeToAnswer += time;
    }
    startStopWatch() {
        this._stopWatchInterval = setInterval(() => {
            this._stopWatch += 0.10;

            //TODO: update the UI with the time left
            this._uiManager._gameStopwatchTag.innerHTML = "Time Elapsed: " +
                this._stopWatch.toFixed(1)
                + " ";
        }, 100);
    }
    stopStopWatch() {
        clearInterval(this._stopWatchInterval);
        this._stopWatch = 0;
    }
    setMultiplier(multiplier) {
        this._multiplier = multiplier;
    }
    increaseStrike() {
        this._strike++;
    }
    resetStrike() {
        this._strike = 0;
    }





}


class MessageBox {
    static instance;
    _messageBoxUI = document.getElementsByClassName("message-box-container")[0];
    _messageBoxTitle = document.getElementById('message-box-title');
    _messageBoxMessage = document.getElementById('message-box-message');
    _messageBoxButtons = document.getElementsByClassName('message-box-buttons')[0];
    buttons = [];

    static getInstance() {
        if (MessageBox.instance == null) {
            MessageBox.instance = new MessageBox();
        }
        return MessageBox.instance;
    }

    display(title, text, buttons) {
        this._messageBoxTitle.innerText = title;


        this._messageBoxMessage.innerHTML = text
    
        this._messageBoxButtons.innerHTML = "";
        this.buttons = buttons;

        buttons.forEach(button => {
            const buttonElement = document.createElement('button');
            buttonElement.innerText = button.text;
            buttonElement.onclick = button.onclick;
            this._messageBoxButtons.appendChild(buttonElement);
        });
        this.show();
    };

    show() {
        this._messageBoxUI.style.display = "flex";
    };
    hide() {
        this._messageBoxUI.style.display = "none";
    };
}