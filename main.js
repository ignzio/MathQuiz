

const gameData = {
    "Player": {
        "playerName": "Player 1",
        "playerScore": 0,
        "playerLevel": 1,
        "playerExperience": 0,
    },
    "pastGames": [
        {
            "id": 1,
            "playerName": "Player 1",
            "gameDifficulty": "easy",
            "gameScore": 0,
            "maximumTime": 60,
        }
    ],
};

let UIMANAGER;
let GAMEMANAGER;


document.addEventListener("DOMContentLoaded", function () {
    UIMANAGER = UiManager.getInstance();
    GAMEMANAGER = GameManager.getInstance();
    GAMEMANAGER.setGameController(new GameController());
    GAMEMANAGER.debugMode = false;

    //debug mode
    if (GAMEMANAGER.debugMode) {
        UIMANAGER.showDebugUI();
    }
    // this when reloading the page
    // load the game data from local storage if it is present and load the player info ui
    if (UIMANAGER.loadPlayerInfoUI(GAMEMANAGER.loadGameDataFromLocalStorage())) {
        const player = GAMEMANAGER.getPlayerFromLocalStorage();
        UIMANAGER.updatePlayerInfoUI(player);
        UIMANAGER._playerNameInput.value = player._name;

    }

    UIMANAGER._startNewGameForm.addEventListener("submit", function (event) {
        event.preventDefault();



        //check if the player data is present in local storage 
        //if it is present load it and initialize the game

        if (!GAMEMANAGER.checkPlayerLocalStorageData()) {
            GAMEMANAGER.createNewPlayerData(UIMANAGER._playerNameInput.value); //create new player data
            //load the player into the game controller

            GAMEMANAGER._gameController._player = GAMEMANAGER._tempPlayer.Player;
        }
        else {
            //load the player into the game controller if it is present
            const player = GAMEMANAGER.getPlayerFromLocalStorage();

            GAMEMANAGER._gameController._player = player;
        }

        UIMANAGER.hideStartGameUI();
        UIMANAGER.showSelectDifficultyUI();


    });
    UIMANAGER._selectDiffucultyButton.addEventListener("click", () => UIMANAGER.onSelectDifficultyEvent());
    UIMANAGER._answerForm.addEventListener("submit", (event) => UIMANAGER.onAnswerFormSubmitEvent(event));
    UIMANAGER._generateQuestionButton.addEventListener("click", () => UIMANAGER.onGenerateQuestionEvent());

});




class GameManager {
    static instance;
    _gameController;
    _gameData;
    _tempPlayer;
    debugMode = false;


    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    getGameController() {
        return this._gameController;
    }
    setGameController(gameController) {
        this._gameController = gameController;
    }
    checkPlayerLocalStorageData() {
        const gameData = localStorage.getItem("gameData");
        if (this._gameData) {
            console.log("data is present", gameData); //debug

            return true;
        }
        console.log("data is not present"); //debug
        return false;
    }

    getPlayerFromLocalStorage() {
        if (this._gameData) {
            console.log("Player is is present", this._gameData.Player);
            return this._gameData.Player;
        }
    }

    createNewPlayerData(playerName) {
        const player = new Player(playerName, 0, 1, 0, 3);
        const playerData = {
            Player: player,
        }
        //set only the local storage player data
        localStorage.setItem("gameData", JSON.stringify(playerData));
        this._tempPlayer = playerData;
        console.log("new local storage: " + localStorage.getItem("gameData"));
        return player;
    }
    loadGameDataFromLocalStorage() {
        const gameData = localStorage.getItem("gameData");
        if (gameData) {
            console.log("data is present", gameData, "locadGameDataFromLocalStorage()");
            this._gameData = JSON.parse(gameData);
            return this._gameData;
        }
        console.log("data is not present locadGameDataFromLocalStorage()");
    }
    initializeGame() {
        this._gameController = new GameController();
        this._gameController.initializeGame();
    }

}



class UiManager {
    static instance;
    _messageBox = MessageBox.getInstance();

    static getInstance() {
        if (!UiManager.instance) {
            UiManager.instance = new UiManager();
        }
        return UiManager.instance;
    }

    //all the ui variables
    //debug variables
    //debugUI > debug-options-container > clear-data-button ;
    _debugUI = document.getElementsByClassName("debug-container")[0];
    _debugOptionsContainer = document.getElementsByClassName("debug-options-container")[0];
    _clearDataButton = document.getElementById("clear-data-button");
    _reloadPageButton = document.getElementById("reload-page-button");


    //start game UI > startNewGame form , PlayerNameInput , StartNewGameButton
    _startGameUI = document.getElementsByClassName("start-game-container")[0];
    _startNewGameForm = document.getElementById("startNewGame");
    _playerNameInput = document.getElementById('player-name-input');
    // _startNewGameButton = document.getElementById(""); not needed

    //Select Difficulty UI >  selectDifficulty Radio Buttons , Confirm Difficulty Button
    _selectDifficultyUI = document.getElementsByClassName("select-difficulty-container")[0];
    _selectDiffucultyButton = document.getElementById('select-difficulty-button');
    _difficultyRadioButtons = [...document.querySelectorAll('input[name="difficulty"]')];

    //Question UI > questionTag , checkAnswerButton , generateQuestionButton , playerAnswerInput
    _questionUI = document.getElementsByClassName("question-container")[0];
    _answerForm = document.getElementsByClassName("answer-form")[0];
    _questionTag = document.getElementById('question-tag');
    _checkAnswerButton = document.getElementById('check-answer-button');
    _generateQuestionButton = document.getElementById('generate-question-button');
    _playerAnswerInput = document.getElementById('answer-input');




    //Info UI >
    //playerInfoUI > playerNameTag , playerScoreTag , playerLevelTag , playerExperienceTag , playerLivesTag;
    //

    _infoUI = document.getElementsByClassName("info-container")[0];

    _playerInfoUI = document.getElementsByClassName("player-info-container")[0];
    _playerNameTag = document.getElementById("player-name-tag");
    _playerScoreTag = document.getElementById("player-score-tag");
    _playerLevelTag = document.getElementById("player-level-tag");
    _playerExperienceTag = document.getElementById("player-experience-tag");
    _playerLivesTag = document.getElementById("player-lives-tag");

    _gameInfoUI = document.getElementsByClassName("game-info-container")[0];
    _gameDifficultyTag = document.getElementById("game-difficulty-tag");
    _gameTimerTag = document.getElementById("game-timer-tag");
    _gameStopWatchTag = document.getElementById("game-stopwatch-tag");
    _gameStrikeTag = document.getElementById("game-strike-tag");


    //Game UI >                             //debug game UI Functions

    showDebugUI() {
        this._debugUI.style.display = "flex";
        this._debugOptionsContainer.style.display = "flex";
        this._clearDataButton.style.display = "block";

        this._clearDataButton.addEventListener("click", () => {
            localStorage.clear();
            //reload the page
            location.reload();
        });
        this._reloadPageButton.style.display = "block";
        this._reloadPageButton.addEventListener("click", () => {
            location.reload();
        }
        );
    }

    //start game UI Functions
    showStartGameUI() {
        this._startGameUI.style.display = "flex";
    }
    hideStartGameUI() {
        this._startGameUI.style.display = "none";
    }

    //select difficulty UI Functions
    showSelectDifficultyUI() {
        this._selectDifficultyUI.style.display = "flex";



    }
    hideSelectDifficultyUI() {
        this._selectDifficultyUI.style.display = "none";
    }


    //question UI Functions
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
            this._questionTag.setHTML(question);
        }

    }


    //info UI Functions
    showInfoUI() {
        this._infoUI.style.display = "flex";
    }
    hideInfoUI() {
        this._infoUI.style.display = "none";
    }
    //Game info UI


    showGameInfoUI() {
        this._gameInfoUI.style.display = "flex";
        this._gameTimerTag.style.display = "block";
        this._gameStopWatchTag.style.display = "block";
        this._gameDifficultyTag.style.display = "block";
        this._gameStrikeTag.style.display = "block";
        this._gameTimerTag.style.display = "block";
        this._gameStopWatchTag.style.display = "block";
        this._gameDifficultyTag.style.display = "block";
        this._gameStrikeTag.style.display = "block";
        this._playerLivesTag.style.display = "block";


    }


    //player info UI Functions  
    showPlayerInfoUI() {
        this._playerInfoUI.style.display = "flex";
        this._playerNameTag.style.display = "block";
        this._playerScoreTag.style.display = "block";
        this._playerLevelTag.style.display = "block";
        this._playerExperienceTag.style.display = "block";
    }

    loadPlayerInfoUI(player) {
        if (player) {
            this._playerNameTag.setHTML("Name: " + player._name);
            this._playerScoreTag.setHTML("Score: " + player._score);
            this._playerLevelTag.setHTML("Level: " + player._level);
            this._playerExperienceTag.setHTML("Experience: " + player._experience);
            this._playerLivesTag.setHTML("Lives: " + player.lives);
            this.showPlayerInfoUI();
            return true;
        }
        return;
    }
    loadGameInfoUI(game) {
        this._gameStrikeTag.setHTML("Strikes: " + game._strikeCount);
        this._gameTimerTag.setHTML("Timer: 0")
        this._gameStopWatchTag.setHTML("StopWatch: 0");
        this._gameDifficultyTag.setHTML("Difficulty: " + game._difficulty);


    }
    updatePlayerInfoUI(player) {
        this._playerNameTag.setHTML("Name: " + player._name);
        this._playerLevelTag.setHTML("Level: " + player._level);
        this._playerExperienceTag.setHTML("Experience: " + player._experience);
        this.showPlayerInfoUI();
    }
    showPlayerLivesTag() {
        this._playerLivesTag.style.display = "block";
    }
    hidePlayerLivesTag() {
        this._playerLivesTag.style.display = "none";
    }
    updatePlayerLivesTag(lives) {
        this._playerLivesTag.setHTML("Lives: " + lives);
        this.showPlayerLivesTag();
    }

    hidePlayerInfoUI() {
        this._playerInfoUI.style.display = "none";
    }


    hideQuestionUI() {
        this._questionUI.style.display = "none";
    }
    //event listeners
    onSelectDifficultyEvent() {
        const playerDifficultyChoose = this._difficultyRadioButtons.find(difficulty => difficulty.checked);

        let buttons;
        let messageText;

        if (playerDifficultyChoose) {
            messageText = "Are you sure you want to start the game with the difficulty: " + playerDifficultyChoose.value + "?";
            buttons = [
                { text: "Yes", onclick: () => { GAMEMANAGER._gameController.startGame(playerDifficultyChoose.value), this._messageBox.hide() } },
                { text: "No", onclick: () => this._messageBox.hide() }
            ]
            this._messageBox.display("Select Difficulty", messageText, buttons);
            return;
        }
        messageText = "Please select a difficulty level";
        buttons = [{ text: 'Close', onclick: () => { this._messageBox.hide() } }];

        this._messageBox.display("Are you Not ready?", messageText, buttons);
    }
    onAnswerFormSubmitEvent(event) {
        event.preventDefault();
        const answer = this._playerAnswerInput.value;
        GAMEMANAGER._gameController.checkAnswer(answer);
    }
    onGenerateQuestionEvent() {

        GAMEMANAGER._gameController.generateQuestion();
    }
    on



    /// initialize function

    onGameStart() {
        this.hideSelectDifficultyUI();
        this.showInfoUI();
        this.showQuestionUI();
        this.showGameInfoUI();



        this._checkAnswerButton.disabled = true;
        this._playerAnswerInput.disabled = true;
        this._generateQuestionButton.disabled = false;
        this._questionTag.setHTML("Click Generate Button to start the game!")
        this._playerAnswerInput.value = "";

        this.loadPlayerInfoUI(GAMEMANAGER._gameController._player);
        this.loadGameInfoUI(GAMEMANAGER._gameController._currentGame);


    }
    onGenerateQuestion() {
        this._checkAnswerButton.disabled = false;
        this._playerAnswerInput.disabled = false;
        this._generateQuestionButton.disabled = true;
        this._playerAnswerInput.value = "";
        this.showStopWatch();

    }
    onCheckAnswer() {
        this._checkAnswerButton.disabled = true;
        this._playerAnswerInput.disabled = true;
        this._generateQuestionButton.disabled = false;
        this._playerAnswerInput.value = "";

    }
    onAnswerCorrect() {

        //update player info
        this.updatePlayerInfoUI(GAMEMANAGER._gameController._player);

        this._playerAnswerInput.classList.remove("incorrect");
        this._playerAnswerInput.classList.remove("correct");
        this._playerAnswerInput.classList.add("correct");

    }
    onAnswerIncorrect() {
        this.updatePlayerInfoUI(GAMEMANAGER._gameController._player);



        this.updatePlayerLivesTag(GAMEMANAGER._gameController._player._lives);
        this._playerAnswerInput.classList.remove("incorrect");
        this._playerAnswerInput.classList.remove("correct");
        this._playerAnswerInput.classList.add("incorrect");
    }
    onPressOkEvent() {
        this._messageBox.hide();
        this._playerAnswerInput.classList.remove("incorrect");
        this._playerAnswerInput.classList.remove("correct");
    }
    onGameOver() {
        this._playerAnswerInput.classList.remove("incorrect");
        this._playerAnswerInput.classList.remove("correct");
        this._playerAnswerInput.disabled = true;
        this._checkAnswerButton.disabled = true;
        // this._generateQuestionButton.disabled = true;
        this._playerAnswerInput.value = "";
        this.hideStopWatch();
        this.hidePlayerLivesTag();
        this.hideQuestionUI();
        this.showStartGameUI();
        this.hideInfoUI();
    }




    showStopWatch() {
        this._gameStopWatchTag.style.display = "block";
    }
    hideStopWatch() {
        this._gameStopWatchTag.style.display = "none";
    }

    updateStopWatch(time) {
        this._gameStopWatchTag.setHTML("StopWatch: " + time);
    }
    updateTimer(time) {
        this._gameTimerTag.setHTML("Timer: " + time);
    }
    updateStrike(strike) {
        this._gameStrikeTag.setHTML("Strike: " + strike);
    }





}



class GameController {
    _currentGame = null;
    _player;

    constructor() {
        this._player = new Player();
    }

    initializeGame() {
        this._game.initializeGame();
    }



    startGame(difficulty) {
        const difficultyLevel = difficulty;

        if (this._currentGame) { //if there is no current game
            this._currentGame = null;
            this._currentGame = new Game(difficultyLevel, this._player);
            this._currentGame._player = this._player;
            this._currentGame._player._lives = 3;

            UIMANAGER.onGameStart(difficultyLevel);
        } else {
            this._currentGame = new Game(difficultyLevel, this._player);
            this._currentGame._player = this._player;
            this._currentGame._player._lives = 3;
            UIMANAGER.onGameStart(difficultyLevel);
        }
    }
    checkAnswer(answer) {

        //if the user input is not empty or null or undefined
        if (answer == '' || answer == null || answer == undefined) {
            const textMessage = "Please enter an answer";
            const buttons = [{ text: 'Close', onclick: () => { UIMANAGER.onPressOkEvent() } }];
            UIMANAGER._messageBox.display("No Answer", textMessage, buttons);
            UIMANAGER._playerAnswerInput.focus();
            return;
        }

        //check if the answer is correct
        if (this._currentGame._currentAnswer == answer) { //if the answer is correct
            const reward = this.calculateReward();
            const extraTime = this.calculateExtraTime();
            const textMessage = `
                <h2 class="correct-text"><span>Correct Answer<span></h2>
                <span style="color:chartreuse">+${reward} points</span>
                <br>
                <span style="color:chartreuse">+${extraTime} seconds</span>
                `;
            const buttons = [{ text: 'Close', onclick: () => { UIMANAGER.onPressOkEvent() } }];
            UIMANAGER._messageBox.display("Correct Answer", textMessage, buttons);

            this._currentGame._player._score += reward;
            this._currentGame._timeToAnswer += extraTime;
            this._currentGame._strikeCount += 1;
            this._currentGame.stopStopWatch();
            this._currentGame.pauseTimer();
            UIMANAGER.onAnswerCorrect();
            UIMANAGER.updateStrike(this._currentGame._strikeCount);
            UIMANAGER.updateTimer(this._currentGame._timeToAnswer);
        }
        else { //if the answer is incorrect
            const textMessage = `
                <h2 class="wrong-text"><span>Wrong Answer<span></h2>
                <h3 class="wrong-text"><span>Correct Answer: ${this._currentGame._currentAnswer}<span></h3>
                <span style="color:crimson">-1 life</span>
                `;
            const buttons = [{ text: 'Close', onclick: () => { UIMANAGER.onPressOkEvent() } }];
            UIMANAGER._messageBox.display("Wrong Answer", textMessage, buttons);
            this._currentGame._player._lives -= 1;
            this._currentGame._strikeCount = 0;
            this._currentGame.stopStopWatch();
            this._currentGame.pauseTimer();
            UIMANAGER.onAnswerIncorrect();
            UIMANAGER.updateStrike(this._currentGame._strikeCount);
            UIMANAGER.updateTimer(this._currentGame._timeToAnswer);


            if (this._currentGame._player._lives == 0) { //if the player has no more lives
                // Game over
                this.gameOver();

            }
        }




        UIMANAGER.onCheckAnswer();
    }
    gameOver() {
        const title = `<h2 class="wrong-text"><span>Game Over!<span></h2>`
        const textMessage = `
     
            <span style="color:crimson">You have no more life</span>
            `;
        const buttons = [{ text: 'Close', onclick: () => { UIMANAGER.onPressOkEvent() } }];
        UIMANAGER._messageBox.display(title, textMessage, buttons);
        this._currentGame.stopStopWatch();
        this._currentGame.stopTimer();
        UIMANAGER.onGameOver();
        //TODO: ADD SCORE TO HIGHSCORE
        //turn score into experience
        const playerExperience = this.calculatePlayerExperience(this._currentGame._player._score);
        //add experience to player
        this._currentGame._player._experience += playerExperience;
        this._currentGame._player._score = 0;
        //save to local storage
        this.savePlayer(this._currentGame._player);
    }



    savePlayer(Player) {
        const gameData = JSON.parse(localStorage.getItem("gameData"));
        if (gameData) {

            gameData.Player = Player;
            localStorage.setItem("gameData", JSON.stringify(gameData));

        }

    }
    calculatePlayerExperience(playerScore) {
        //the player score becomes the player experience by square root 
        const playerExperience = Math.sqrt(Math.sqrt(playerScore));
        return playerExperience;
    }
    generateQuestion() {
        //based on difficulty level generate question

        let question;
        let answer;
        switch (this._currentGame._difficulty) {
            case "Beginner":
                //set the question to the game
                [question, answer] = this.beginnerQuestion();
                this._currentGame._currentQuestion = question;
                this._currentGame._currentAnswer = answer;
                break;
            case "Intermediate":
                //set the question to the game
                [question, answer] = this.intermediateQuestion();
                this._currentGame._currentQuestion = question;
                this._currentGame._currentAnswer = answer;
                break;
            case "Advanced":
                //set the question to the game
                [question, answer] = this.advancedQuestion();
                this._currentGame._currentQuestion = question;
                this._currentGame._currentAnswer = answer;
                break;
            case "Expert":
                //set the question to the game
                [question, answer] = this.expertQuestion();
                this._currentGame._currentQuestion = question;
                this._currentGame._currentAnswer = answer;
                break;
            default:
                throw new Error("Invalid Difficulty Level");
        }

        UIMANAGER.showQuestionUI(question)
        UIMANAGER.onGenerateQuestion();

        //start the stop watch
        this._currentGame._stopWatch = 0;
        this._currentGame.startStopWatch();

        //start the timer
        this._currentGame.startTimer();

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
        const operations = {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => a / b
        };
        const numCount = Math.floor(Math.random() * 2) + 2;
        let nums = [];
        for (let i = 0; i < numCount; i++) {
            nums.push(Math.floor(Math.random() * 100) + 1);
        }

        // Generate a random number of decimal places to which the answer should be rounded
        const decimalPlaces = Math.floor(Math.random() * 3) + 1;

        let question = nums[0].toString();
        let answer = nums[0];
        for (let i = 1; i < nums.length; i++) {
            const operation = Object.keys(operations)[Math.floor(Math.random() * 4)];
            question += ` ${operation} ${nums[i]}`;
            answer = operations[operation](answer, nums[i]);
        }

        // Round the answer to the specified number of decimal places
        if (answer.toFixed(decimalPlaces).endsWith(`.${'0'.repeat(decimalPlaces)}`)) {
            answer = Math.round(answer);
            question = question;
        } else {
            answer = parseFloat(answer.toFixed(decimalPlaces));
            question = `${question}. Round your answer to ${decimalPlaces} decimal places.`;
        }

        return [question, answer];
    }

    advancedQuestion() {
        const numbers = [];
        const operators = [];
        let answer;
        let questionText;
        let question;

        // Generate a random number of decimal places to which the answer should be rounded
        const decimalPlaces = Math.floor(Math.random() * 3) + 1;

        // Function to generate a random operator
        const getRandomOperator = () => ['+', '-', '*', '/', '**'][Math.floor(Math.random() * 5)];

        // Function to generate a random number within a range
        const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        // Function to check if the answer is valid
        const isValidAnswer = (answer) => Math.abs(answer) <= 1e+20 && Math.abs(answer) >= 1e-20;

        do {
            // Generate the numbers
            for (let i = 0; i < 5; i++) {
                numbers[i] = i === 4 ? getRandomNumber(0, 10) : getRandomNumber(0, 100);
            }

            // Generate the operators
            for (let i = 0; i < 4; i++) {
                operators[i] = getRandomOperator();
            }

            if (Math.random() < 0.5) {
                questionText = `((${numbers[0]} ${operators[0]} ${numbers[1]}) ${operators[1]} (${numbers[2]} ${operators[2]} ${numbers[3]})) ${operators[3]} ${numbers[4]}`;
                answer = Function(`'use strict'; return ${questionText}`)();
            } else {
                questionText = `${numbers[0]} ${operators[0]} ((${numbers[1]} ${operators[1]} (${numbers[2]} ${operators[2]} ${numbers[3]})) ${operators[3]} ${numbers[4]})`;
                answer = Function(`'use strict'; return ${questionText}`)();
            }
        } while (!isValidAnswer(answer));

        // Round the answer to the specified number of decimal places
        if (answer.toFixed(decimalPlaces).endsWith(`.${'0'.repeat(decimalPlaces)}`)) {
            answer = Math.round(answer);
            question = questionText;
        } else {
            answer = parseFloat(answer.toFixed(decimalPlaces));
            question = `${questionText}.<hr> <p>Round your answer to ${decimalPlaces} decimal places.</p>`;
        }

        return [question, answer];
    }
    expertQuestion() {
        const numbers = [];
        const operators = [];
        let answer;
        let questionText;
        let question;
      
        // Generate a random number of decimal places to which the answer should be rounded
        const decimalPlaces = Math.floor(Math.random() * 3) + 1;
      
        // Function to generate a random operator
        const getRandomOperator = () => ['+', '-', '*', '/', '^', 'sqrt', 'sin', 'cos', 'tan'][Math.floor(Math.random() * 9)];
      
        // Function to generate a random number within a range
        const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      
        // Function to check if the answer is valid
        const isValidAnswer = (answer) => Math.abs(answer) <= 1e+20 && Math.abs(answer) >= 1e-20;
      
        do {
          // Generate the numbers
          for (let i = 0; i < 7; i++) {
            numbers[i] = i === 6 ? getRandomNumber(0, 10) : getRandomNumber(0, 100);
          }
      
          // Generate the operators
          for (let i = 0; i < 6; i++) {
            operators[i] = getRandomOperator();
          }
      
          if (Math.random() < 0.5) {
            questionText = `((${numbers[0]} ${operators[0]} ${numbers[1]}) ${operators[1]} ((${numbers[2]} ${operators[2]} ${numbers[3]}) ${operators[3]} ${numbers[4]})) ${operators[4]} ${numbers[5]} ${operators[5]} ${numbers[6]}`;
          } else {
            questionText = `${numbers[0]} ${operators[0]} ((${numbers[1]} ${operators[1]} (${numbers[2]} ${operators[2]} (${numbers[3]} ${operators[3]} ${numbers[4]}))) ${operators[4]} (${numbers[5]} ${operators[5]} ${numbers[6]}))`;
          }
      
          // Add parentheses around arguments of trigonometric functions
          questionText = questionText.replace(/sin\s+(\d+)/g, 'sin($1)');
          questionText = questionText.replace(/cos\s+(\d+)/g, 'cos($1)');
          questionText = questionText.replace(/tan\s+(\d+)/g, 'tan($1)');
      
          console.log(`Generated question: ${questionText}`);
      
          answer = math.evaluate(questionText);
      
          console.log(`Calculated answer: ${answer}`);
        } while (!isValidAnswer(answer));
      
        // Round the answer to the specified number of decimal places
        if (answer.toFixed(decimalPlaces).endsWith(`.${'0'.repeat(decimalPlaces)}`)) {
          answer = Math.round(answer);
          question = questionText;
        } else {
          answer = parseFloat(answer.toFixed(decimalPlaces));
          question = `${questionText}.<hr> <p>Round your answer to ${decimalPlaces} decimal places.</p>`;
        }
      
        return [question, answer];
      }
      
      
      
      










calculateExtraTime() {
    //calculate extra time based on the difficulty level and with a bit of randomness
    //the more difficult the more time
    const difficulty = this._currentGame._difficulty;

    const extraTime = {
        "Beginner": 5,
        "Intermediate": 10,
        "Advanced": 15,
        "Expert": 20
    }
    //basen on player level
    const playerLevel = this._player._level;

    const playerLevelMultiplier = playerLevel ** (playerLevel / 70);

    //based on strike factor count
    const strikeFactor = this._currentGame._strikeCount;

    const strikeFactorMultiplier = strikeFactor ** (strikeFactor / 120);
    //add some randomness to the extra time on the factor 

    //stop watch value
    const stopWatchValue = this._currentGame._stopWatch;
    //stop watch multiplier
    //must reward if player answer sustainably fast or not getting any reward
    const stopWatchMultiplier = {
        35: 0,
        30: 0.2,
        25: 0.4,
        20: 0.6,
        15: 0.8,
        10: 1,
    };
    //get the minimum value of the extra time based on stop watch value


    const timeValues = Object.keys(stopWatchMultiplier);

    let minTimeValue = timeValues.find((time) => time >= stopWatchValue); //find the minimum time value that is greater than the current stop watch value

    if (!minTimeValue) {
        minTimeValue = timeValues[timeValues.length - 1]; //if there is no minimum time value, set the minimum time value to the last time value
    }

    const minMultiplier = stopWatchMultiplier[minTimeValue]; //get the multiplier for the minimum time value



    const extraTimeValue = Math.floor(extraTime[difficulty] * playerLevelMultiplier * strikeFactorMultiplier) * minMultiplier;


    return extraTimeValue;
}


calculateReward() {
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
    const currentStopWatch = this._currentGame._stopWatch;
    const currentDifficulty = this._currentGame._difficulty;

    const timeValues = Object.keys(stopWatchMultiplier);

    let minTimeValue = timeValues.find((time) => time >= currentStopWatch); //find the minimum time value that is greater than the current stop watch value

    if (!minTimeValue) {
        minTimeValue = timeValues[timeValues.length - 1]; //if there is no minimum time value, set the minimum time value to the last time value
    }

    const minMultiplier = stopWatchMultiplier[minTimeValue]; //get the multiplier for the minimum time value

    let reward = rewards[currentDifficulty] * multiplier[currentDifficulty] * minMultiplier; //calculate the reward

    const sequences = [
        //famous frequences
        //fibonacci
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
        //lucas
        [2, 1, 3, 4, 7, 11, 18, 29, 47, 76],
        //pell
        [0, 1, 2, 5, 12, 29, 70, 169, 408, 985],
        //jacobi
        [0, 1, 1, 3, 5, 11, 21, 43, 85, 171],
    ];

    const randomSequenceIndex = Math.floor(Math.random() * sequences.length); //get a random sequence index
    let randomSequence = sequences[randomSequenceIndex]; //get the random sequence

    // Shuffle the sequence to add more randomness to the reward calculation
    for (let i = randomSequence.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomSequence[i], randomSequence[j]] = [randomSequence[j], randomSequence[i]];
    }

    const randomIndex = Math.floor(Math.random() * randomSequence.length); //get a random index from the random sequence
    reward *= (randomSequence[randomIndex] / (randomSequence.length - 1));

    // Round the reward to the nearest integer and ensure it is never zero
    reward = Math.max(1, Math.round(reward));

    return reward; //return the reward
}






}






class Player {
    _name;
    _score;
    _level;
    _experience;
    lives;

    constructor(name, score, level, experience, lives) {
        this._name = name;
        this._score = score;
        this._level = level;
        this._experience = experience;
        this.lives = lives;
    }
    addScore(score) {
        this._score += score;
    }
    addExperience(experience) {
        this._experience += experience;
    }
    addLevel(level) {
        this._level += level;
    }
    addLives(lives) {
        this.lives += lives;
    }
    addTime(time) {
        this._time += time;
    }
    savePlayer() {
        localStorage.setItem("player", JSON.stringify(this));
    }


}


class Game {
    UUid;
    _difficulty;
    _player;
    _currentQuestion;
    _currentAnswer;
    pastQuestions = [];
    _timeToAnswer = 60;
    _timeToAnswerInterval;
    _strikeCount = 0;
    _stopWatch = 0;
    _stopWatchInterval;
    _multiplier = 1.0;



    constructor(difficulty, playerName) {
        this.UUid = this.generateUUID();
        this._difficulty = difficulty;
        this._player = playerName;
        console.log("game created", this);



        this.initializeGame(this._difficulty);
    }

    initializeGame(difficulty) {
        switch (difficulty) {
            case "Beginner":
                this._timeToAnswer = 60;
                break;
            case "Intermediate":
                this._timeToAnswer = 90;
                break;
            case "Advanced":
                this._timeToAnswer = 150;
                break;
            case "Expert":
                this._timeToAnswer = 230;
                break;
            default:
                this._timeToAnswer = 60;
                break;
        }

    }

    generateUUID() {
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

    }
    startStopWatch() {
        this.stopStopWatch();
        this._stopWatchInterval = setInterval(() => {
            this._stopWatch += 0.1;



            UIMANAGER.updateStopWatch(this._stopWatch.toFixed(1));
        }, 100);
    }
    stopStopWatch() {
        this._stopWatchInterval = clearInterval(this._stopWatchInterval);
        this._stopWatchInterval = null;
    }
    startTimer() {
        this.stopTimer();
        this._timeToAnswerInterval = setInterval(() => {
            this._timeToAnswer -= 1;
            UIMANAGER.updateTimer(this._timeToAnswer);
            if (this._timeToAnswer <= 0) {
                this.stopTimer();
                GAMEMANAGER._gameController.gameOver();
            }
        }, 1000);
    }
    stopTimer() {
        this._timeToAnswerInterval = clearInterval(this._timeToAnswerInterval);
        this._timeToAnswerInterval = null;
    }
    pauseTimer() {
        clearInterval(this._timeToAnswerInterval);
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
        this._messageBoxTitle.setHTML(title)


        this._messageBoxMessage.setHTML(text)

        this._messageBoxButtons.setHTML("");
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