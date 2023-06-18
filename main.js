function play(e) {
    e.preventDefault();
    GameManager.getInstance().startGame();
}
// Manages the overall state and settings of the game.
// Keeps track of the number of attempts made by the player.
// Stores the current answer.
// Tracks the difficulty level of the game.
// Provides methods to modify and access the game state, such as setting the attempt, getting the answer, and resetting the attempt.
// Initiates the game by starting the game interface or UI element.
// Acts as a singleton to ensure there is only one instance of the GameManager throughout the application.





class GameManager {
    static instance;
    _game;
    _gameController;
    _uiController;
    _previousGames = [];
    _inGame = false;
    constructor() {
        this._gameController = new GameController();
        this._uiController = new UiController();
    }
    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    getGame() {
        return this._game;
    }
    setGame(game) {
        this._game = game;
    }
    getGameController() {
        return this._gameController;
    }

    startGame() {
        if (!this._inGame) {
            this._inGame = true;
            this.setGame(new Game());
            this._uiController.setPlayerName();
            this._uiController.hideStartGameUI();
            this._uiController.displaySelectDifficultyUI();
        }




    }


}








// Handles the game logic and actions related to gameplay.
// Manages the generation of math questions based on the specified difficulty level.
// Validates the player's answer and provides feedback on correctness.
// Interacts with the user interface (UI) elements to display questions, retrieve answers, and show results.
// May handle additional game-related functionalities such as scoring, level progression, or game flow.
class GameController {
    _strike = 0;
    _timeTimer = 0;
    _timerOn = false;

    _timerInterval;
    _timeToAnswerTimer = 0;
    _timeToAnswerInterval;
    checkDifficulty(difficulty) {
        switch (difficulty) {
            case 'Beginner':
                return this.generateBeginnerQuestion();
            case 'Intermediate':
                return this.generateIntermediateQuestion();
            case 'Advanced':
                return this.generateAdvancedQuestion();
            default:
                throw new Error('Invalid difficulty level.');
        }
    }
    gameOver(lastPlayerAnswer) {
        const gameManager = GameManager.getInstance();
        const game = gameManager.getGame();
        const uiController = gameManager._uiController;

        const answer = game.getAnswer();

        uiController.clearMessageBoxButtons();
        uiController.addMessageBoxButton('Close', () => {
            uiController.hideMessageBoxUI();
        });

        uiController.displayMessageBox('Game Over!', `
                    Question: ${game.getQuestion()}<br>
                    your answer:
                    <p style="color: red;">
                    ${lastPlayerAnswer}
                    </p>
                    <br>
                    The correct answer was 
                    <p style="color: green;">
                    ${answer}
                    </p>
                `);

        uiController.hideQuestionUI();
        uiController.displayStartGameUI();
        uiController.hidePlayerInfoUI();
        uiController._question.innerHTML = '';
        uiController.enableGenerateQuestionButton();


        // Reset Game state
        gameManager._inGame = false;
        game.resetGame();
        return;
    }


    initializeGame(difficulty, attempt,timer) {
        const gameManager = GameManager.getInstance();
        const game = gameManager.getGame();
        const uiManager = gameManager._uiController;

        this._timeTimer= timer;

        game.setDifficulty(difficulty);
        game.setAttempt(attempt);
        game.setScore(0);
        game.setQuestion(null);
        game.setAnswer(null);
        uiManager.updatePlayerInfo(game.getPlayerName(), game.getScore(), game.getAttempt(), game.getDifficulty());
        this.startGame();

    }
    setGamemode(difficulty) {
        switch (difficulty) {
            case 'Beginner':
                this.initializeGame('Beginner', 3,60);
                break;
            case 'Intermediate':
                this.initializeGame('Intermediate', 5,60);
                break;
            case 'Advanced':
                this.initializeGame('Advanced', 7,60);
                break;
            case 'Expert':
                this.initializeGame('Expert', 10,60);
                break;
            default:
                throw new Error('Invalid difficulty level.');
        }
    }
    startGame() {
        const gameManager = GameManager.getInstance();
        const uiManager = gameManager._uiController;
        uiManager.hideStartGameUI();
        uiManager.displayQuestionUI();
        uiManager.displayPlayerInfoUI();
        uiManager.hideSelectDifficultyUI();
        uiManager.hideMessageBoxUI();
        uiManager.updateTimer(this._timeTimer);

    }




    generateQuestion(event) {
        event.preventDefault();
        switch (GameManager.getInstance().getGame().getDifficulty()) {
            case 'Beginner':
                return this.generateBeginnerQuestion();
            case 'Intermediate':
                return this.generateIntermediateQuestion();
            case 'Advanced':
                return this.generateAdvancedQuestion();
            default:
                throw new Error('Invalid difficulty level.');
        }
    }


    generateBeginnerQuestion() {
        const uiController = GameManager.getInstance()._uiController;
        const firstNumber = Math.floor(Math.random() * 10);
        const secondNumber = Math.floor(Math.random() * 10);
        const operator = ['+', '-'][Math.floor(Math.random() * 2)];
        const answer = operator === '+' ? firstNumber + secondNumber : firstNumber - secondNumber;
        const question = `${firstNumber} ${operator} ${secondNumber}`;

        uiController._answerInput.focus();
        uiController._answerInput.select();
        uiController._answerInput.disabled = false;
        uiController._answerInput.style.border = '2px solid #ccc';

        this.initializeQuestion(question, answer);


    }
    //return a funcition with the type of function to generate


    checkAnswer(event) {
        event.preventDefault();
        //type of difficulty
        const gameManager = GameManager.getInstance();
        const game = gameManager.getGame();
        const answer = game.getAnswer();
        const difficulty = game.getDifficulty();
        const uiController = gameManager._uiController;
        const playerAnswer = uiController._answerInput.value;



        // function display

        //check if the player has inputer a answer

        // if (answer === undefined || answer === null) {












        if (answer === undefined || answer === null) {
            uiController.clearMessageBoxButtons();
            uiController.addMessageBoxButton('Generate', () => { uiController.hideMessageBoxUI(), this.checkDifficulty(difficulty) });
            uiController.displayMessageBox('Error!', 'Please generate a question first.');
            return;
        }
        if (!playerAnswer) {
            uiController.clearMessageBoxButtons();
            uiController.displayMessageBox('', 'Please enter your answer.');
            uiController.addMessageBoxButton('Close', () => { uiController.hideMessageBoxUI() });
            uiController._answerInput.focus();
            uiController._answerInput.select();

            uiController._answerInput.style.border = '1px solid red';
            uiController._answerInput.disabled = false;
            return;
        }

        if (answer == parseInt(playerAnswer) || answer == parseFloat(playerAnswer)) {
            this.correctAnswer();
      
        } 
        else {
            if (game.getAttempt() === 1) {

                this.gameOver(playerAnswer);
                return;
            }

            game.setAttempt(game.getAttempt() - 1);
            uiController.clearMessageBoxButtons();
            uiController.displayMessageBox('Incorrect!', `<p>the correct answer is 
        <span style="color: green;">
        ${answer}.
        </span>
        </p><p>You have 
        <span style="color: red;">
        ${game.getAttempt()}
        </span>
        attempt(s) left.</p>`);
            uiController.disableCheckAnswerButton();
            uiController.enableGenerateQuestionButton();
            uiController.addMessageBoxButton('Generate New Question', () => { uiController.hideMessageBoxUI(), this.checkDifficulty(difficulty) });
            uiController._answerInput.style.border = '1px solid red';
            uiController._answerInput.disabled = true;
            game.addPreviousQuestion([question, answer]);


        }
        uiController.updatePlayerInfo(game.getPlayerName(), game.getScore(), game.getAttempt(), game.getDifficulty());
    }

    outcomeTimerReward(outcome) {
        //reward the player for answering the question quickly
        //if the player answers the question in less than 5 seconds, add 5 seconds to the timer
        //if the player answers the question in less than 10 seconds, add 3 seconds to the timer
        //if the player answers the question in less than 15 seconds, add 1 second to the timer
        //if the player answers the question in more than 15 seconds, do nothing
        //if the outcome is true, add the seconds to the timer
        //if the outcome is false, do nothing
        
        
            
        //clear the interval
        if (this._timerInterval !== null) {
            clearInterval(this._timerInterval);
        }
        uiController.updateTimer(this._timeTimer);
    }

    generateIntermediateQuestion() {
        const gameManager = GameManager.getInstance();
        const game = GameManager.getInstance().getGame();
        const uiController = GameManager.getInstance()._uiController;
        let firstNumber;
        let secondNumber;
        let operator;
        let answer;
        let questionText;
        let question;

        do {
            firstNumber = Math.floor(Math.random() * 100);
            secondNumber = Math.floor(Math.random() * 100);
            operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
            answer = operator === '+' ? firstNumber + secondNumber : operator === '-' ? firstNumber - secondNumber : operator === '*' ? firstNumber * secondNumber : firstNumber / secondNumber;
            questionText = `${firstNumber} ${operator} ${secondNumber}`;

            // Check if the answer is a very large or very small number
        } while (Math.abs(answer) > 1e+20 || Math.abs(answer) < 1e-20);

        // Round the answer to 2 decimal places if it is not an integer and does not end in .00
        if (!Number.isInteger(answer) && !answer.toFixed(2).endsWith('.00')) {
            answer = answer.toFixed(2);
            question = `${questionText}. Round your answer to 2 decimal places.`;
        } else {
            question = questionText;
            answer = Math.round(answer);
        }

        game.setAnswer(answer);
        game.setQuestion(question);


        uiController._answerInput.focus();
        uiController._answerInput.select();
        uiController._answerInput.disabled = false;
        uiController._answerInput.style.border = '2px solid #ccc';

        this.initializeQuestion(question, answer);
    }



    correctAnswer() {
        const gameManager = GameManager.getInstance();
        const game = gameManager.getGame();
        const uiController = gameManager._uiController;
        game.setScore(game.getScore() + 1);
        uiController.clearMessageBoxButtons();
        uiController.displayMessageBox('Correct!', `You got the orrectcorrect answer! <p>score +${1}</p>`);
        uiController._answerInput.style.border = '1px solid green';
        uiController._answerInput.disabled = true;
        uiController.addMessageBoxButton('Generate New Question', () => { uiController.hideMessageBoxUI(), this.checkDifficulty(difficulty) });
        uiController.updatePlayerInfo(game.getPlayerName(), game.getScore(), game.getAttempt(), game.getDifficulty());
        uiController.disableCheckAnswerButton();
        uiController.enableGenerateQuestionButton();
        game.playerAnswer = playerAnswer;
        game.addPreviousQuestion([game._question, game._answer, game.playerAnswer]);
    }


    generateAdvancedQuestion() {
        const gameManager = GameManager.getInstance();
        const game = GameManager.getInstance().getGame();
        const uiController = GameManager.getInstance()._uiController;
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
            //if the answer ends in .00, remove the decimal places and dont display the decimal places in the question text the number can end in .00 or .0 or .000 depending on the decimalplaces generated
        if (answer.toFixed(decimalPlaces).endsWith(`.${'0'.repeat(decimalPlaces)}`)) {
            answer = Math.round(answer);
            question = questionText;
        } else {

        

        answer = answer.toFixed(decimalPlaces);
    
        // Include the number of decimal places in the question text
        question = `${questionText}. Round your answer to ${decimalPlaces} decimal places.`;

        }
       
        this.initializeQuestion(question, answer);
    }








    initializeQuestion(question, answer) {
        const gameManager = GameManager.getInstance();
        const game = gameManager.getGame();
        const uiController = gameManager._uiController;
   

        uiController._answerInput.focus();
        uiController._answerInput.select();
        uiController._answerInput.disabled = false;
        uiController._answerInput.style.border = '2px solid #ccc';

    
        game.setQuestion(question);
        game.setAnswer(answer);
        uiController.displayGeneratedQuestion(question);
        uiController.enableCheckAnswerButton();
        uiController.disableGenerateQuestionButton();
        uiController.clearAnswerInput();
        uiController.hideMessageBoxUI();

        //clear the timer interval if it is not null
        if (this._timerInterval !== null) {
            clearInterval(this._timerInterval);
        }

        //run the timer and update every time the variable is changed the timer belong to this class
        this._timerInterval = setInterval(() => {
            uiController.updateTimer(this._timeTimer -= 1);
        }
            , 1000);


    
            
    }


}



class UiController {
    //start Game UI
    _startGameUI = document.getElementsByClassName('start-game-container')[0];
    _startGameButton = document.getElementById('start-game-button');
    _playerNameInput = document.getElementById('player-name-input');

    //gameView UI
    _gameViewUI = document.getElementsByClassName('game-view-container')[0];

    //question UI
    _questionUI = document.getElementsByClassName('question-container')[0];
    _question = document.getElementById('question');
    _questionView = document.getElementById('question-view');
    _answerInput = document.getElementById('answer-input');
    _checkAnswerButton = document.getElementById('check-answer-button');
    _generateQuestionButton = document.getElementById('generate-question-button');

    //Player Info UI
    _playerInfoUI = document.getElementsByClassName('player-info-container')[0];
    _playerNameTag = document.getElementById('player-name-tag');
    _playerScoreTag = document.getElementById('player-score-tag');
    _playerDifficultyTag = document.getElementById('player-difficulty-tag');
    _playerAttemptTag = document.getElementById('player-attempt-tag');
    _resetButton = document.getElementById('reset-button');
    _playerTimeTag = document.getElementById('player-time-tag');

    //select difficulty UI
    _selectDifficultyUI = document.getElementsByClassName('select-difficulty-container')[0];
    _selectDifficultyButton = document.getElementById('select-difficulty-button');
    difficultyRadioButtons = [...document.querySelectorAll('input[name="difficulty"]')];
    _Messages = []

    //message box UI
    _messageBoxUI = document.getElementsByClassName('message-box-container')[0];
    _messageBoxTitle = document.getElementById('message-box-title');
    _messageBoxMessage = document.getElementById('message-box-message');
    _messageBoxCloseButton = document.getElementById('close-message-box-button');
    _messageBoxButtons = document.getElementsByClassName('message-box-buttons')[0];



    constructor() {
        console.log('UI Controller Created');
    }



    //start game UI
    displayStartGameUI() {
        this._startGameUI.style.display = 'block';
    }
    hideStartGameUI() {
        this._startGameUI.style.display = 'none';
    }
    displayPlayerName() {
        this._playerNameTag.innerHTML = GameManager.getInstance().getGame().getPlayerName();
    }


    //question UI
    // Use async/await to avoid blocking the main thread
    async displayQuestionUI() {

        // Use requestAnimationFrame to optimize the animation performance
        requestAnimationFrame(() => {
            this._questionUI.style.display = 'block';

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
    }
    async hideQuestionUI() {
        requestAnimationFrame(() => {
            this._questionUI.style.opacity = 0;
            this._questionUI.style.transform = 'translateY(-100%)';
            this._questionUI.style.transition = 'all 0.5s ease-in-out';
        });

        await new Promise((resolve) => {
            this._timeoutId = setTimeout(resolve, 500);
        });

        requestAnimationFrame(() => {
            this._questionUI.style.display = 'none';
        });
    }





    displayGeneratedQuestion(question) {

        this._questionView.style.display = 'block';

        this._question.innerHTML = question;
    }



    disableCheckAnswerButton() {
        this._checkAnswerButton.disabled = true;
        this._checkAnswerButton.style.cursor = 'not-allowed';
        this._checkAnswerButton.style.opacity = 0.5;

    }
    enableCheckAnswerButton() {
        this._checkAnswerButton.disabled = false;
        this._checkAnswerButton.style.cursor = 'pointer';
        this._checkAnswerButton.style.opacity = 1;
    }
    clearAnswerInput() {
        this._answerInput.value = '';
    }
    disableGenerateQuestionButton() {
        this._generateQuestionButton.disabled = true;
        this._generateQuestionButton.style.cursor = 'not-allowed';
        this._generateQuestionButton.style.opacity = 0.5;
    }
    enableGenerateQuestionButton() {
        this._generateQuestionButton.disabled = false;
        this._generateQuestionButton.style.cursor = 'pointer';
        this._generateQuestionButton.style.opacity = 1;
    }


    //select difficulty UI
    displaySelectDifficultyUI() {
        this._selectDifficultyUI.style.display = 'block';
        this.addSelectDifficultyButtonEvent();
        this.hideMessageBoxUI();

    }
    hideSelectDifficultyUI() {
        this._selectDifficultyUI.style.display = 'none';
    }
    addSelectDifficultyButtonEvent() {
        const gameController = GameManager.getInstance()._gameController;
        const messageBox = MessageBox.getInstance();

        this._selectDifficultyButton.onclick = () => {
            const checkedDifficulty = this.difficultyRadioButtons.find(difficulty => difficulty.checked);
            if (checkedDifficulty) {
                const buttons = [
                    {text: 'Start',onClick: () => {gameController.setGamemode(checkedDifficulty.value)}},
                    {text: 'Close',onClick: () => {messageBox.hide();}}
                ];
                messageBox.display('Select Difficulty',this.getDifficultyTextMessage(checkedDifficulty.value),buttons);
            } else {
                const buttons = [
                    {text: 'OK',onClick: () => {messageBox.hide();}}
                ];
                messageBox.display('Error', 'Please select a difficulty level.',buttons);
            }
        };
    }
    updatePlayerInfo(playerName, score, attempt, difficulty) {
        if (playerName !== null && playerName !== undefined) {
            this._playerNameTag.innerHTML = "<b>Player Name:</b> " + playerName;
        }
        if (score !== null && score !== undefined) {
            this._playerScoreTag.innerHTML = "<b>Score:</b> " + score;
        }
        if (attempt !== null && attempt !== undefined) {
            this._playerAttemptTag.innerHTML = "<b>Attempt:</b> " + attempt;
        }
        if (difficulty !== null && difficulty !== undefined) {
            this._playerDifficultyTag.innerHTML = "<b>Difficulty:</b> " + difficulty;
        }
    }




    //player info ui Methods
    setPlayerName() {
        GameManager.getInstance().getGame().setPlayerName(this._playerNameInput.value);
    }
    displayPlayerInfoUI() {
        this._playerInfoUI.style.display = 'flex';
    }
    hidePlayerInfoUI() {
        this._playerInfoUI.style.display = 'none';
    }




    //message box UI
    displayMessageBoxUI(title, message) {
        this._messageBoxUI.style.display = 'block';
    }
    hideMessageBoxUI() {
        this._messageBoxUI.style.display = 'none';
    }
    setMessageBoxTitle(title) {
        this._messageBoxTitle.innerHTML = title;
    }
    setMessageBoxMessage(message) {
        this._messageBoxMessage.innerHTML = message;
    }
    displayMessageBox(title, message) {



        this.setMessageBoxTitle(title);
        this.setMessageBoxMessage(message);
        this.displayMessageBoxUI();
    }

    //message box UI and Methods
    // addMessageBoxButton(buttonText, buttonOnClick) {
    //     const button = document.createElement('button');
    //     button.innerHTML = buttonText;
    //     button.onclick = buttonOnClick;
    //     this._messageBoxButtons.appendChild(button);
    // }

    addMessageBoxButton(buttonText, buttonOnClick) {
        const button = document.createElement('button');
        button.innerHTML = buttonText;
        button.onclick = buttonOnClick;
        return button;
    }

    clearMessageBoxButtons() {
        this._messageBoxButtons.innerHTML = '';
    }
    getDifficultyTextMessage(difficulty) {
        switch (difficulty) {
            case 'Beginner':
                return 'you Selected <b>Beginner</b> difficulty,';
            case 'Intermediate':
                return 'You have selected Intermediate difficulty. You will have 3 attempts to answer the question correctly.';
            case 'Advanced':
                return 'You have selected Advanced difficulty. You will have 3 attempt to answer the question correctly.';
            case 'Expert':
                return 'You have selected Expert difficulty. You will have 3 attempt to answer the question correctly.';
            default:
                throw new Error('Invalid difficulty');

        }
    }
    getDifficultyAttempt(difficulty) {
        switch (difficulty) {
            case 'Beginner':
                return 3;
            case 'Intermediate':
                return 2;
            case 'Advanced':
                return 2;
            case 'Expert':
                return 2;
            default:
                throw new Error('Invalid difficulty');
        }
    }

    //updateTimer
    updateTimer(time) {
        this._playerTimeTag.innerHTML = "<b>Time:</b> " + time;
    }


    //messages 
     //Please Enter your Answer //check answer button
     //!incorrect the right answer is .. //generate new question
     //correct you got the correct answer!  generate new question
     //game Over
     //start the game


    // startTheGameMessage() {
    //     this.displayMessageBox('Start the Game', this.getDifficultyTextMessage(checkedDifficulty.value));

     
    // messageBox(message) {
    //     switch (message) {
    //         case 'Start the Game':




    

}

class MessageBox {
    title;
    textMessage;
    buttons = [];

    _messagebox = document.getElementsByClassName('message-box-container')[0];
    _messageBoxTitle = document.getElementById('message-box-title');
    _messageBoxMessage = document.getElementById('message-box-message');
    _messageBoxButtons = document.getElementsByClassName('message-box-buttons')[0];

    static instance;

    static getInstance() {
        if (!MessageBox.instance) {
            MessageBox.instance = new MessageBox();
        }
        return MessageBox.instance;
    }
    addMessageBoxButton(buttonText, buttonOnClick) {
        const button = document.createElement('button');
        button.innerHTML = buttonText;
        button.onclick = buttonOnClick;
        return button;
    }

    display(title, textMessage, buttons) {
        this.title = title;
        this.textMessage = textMessage;
        this.buttons = buttons;
        //add buttons to the messageButtons the input is     [
                    //     {
                    //         text: 'OK',
                    //         onClick: () => {
                    //             message.hide();
                    //         }
                    //     }
                    // ]
        this._messageBoxButtons.innerHTML = ''; // Clear all buttons
        this.buttons.forEach(button => {
            this._messageBoxButtons.appendChild(this.addMessageBoxButton(button.text, button.onClick));
        });
 
        this._messageBoxTitle.innerHTML = this.title;
        this._messageBoxMessage.innerHTML = this.textMessage;
        this._messagebox.style.display = 'block';
    }
    hide() {
        this._messagebox.style.display = 'none';
    }
}


class MessageBoxButton {
    text;
    onClick;
    constructor(text, onClick) {
        this.text = text;
        this.onClick = onClick;
    }
    getText() {
        return this.text;
    }
    setText(text) {
        this.text = text;
    }
    getOnClick() {
        return this.onClick;
    }
    setOnClick(onClick) {
        this.onClick = onClick;
    }
    click() {
        this.onClick();
    }
}



class Game {
    attempt;
    score;
    list_of_questions = [];
    question;
    answer;
    playerAnswer;
    difficulty;
    playerName;
    constructor(attempt, answer, difficulty, playerName) {
        this.attempt = attempt;
        this.answer = answer;
        this.difficulty = difficulty;
        this.playerName = playerName;
        console.log('Game Created');
    }
    getPlayerName() {
        return this._playerName;
    }
    setPlayerName(playerName) {
        this._playerName = playerName;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    getDifficulty() {
        return this.difficulty;
    }
    setAttempt(attempt) {
        this.attempt = attempt;
    }
    getAttempt() {
        return this.attempt;
    }
    setQuestion(question) {
        this.question = question;
    }
    getQuestion() {
        return this.question;
    }

    setAnswer(answer) {
        this.answer = answer;
    }
    getAnswer() {
        return this.answer;
    }
    setScore(score) {
        this.score = score;
    }
    getScore() {
        return this.score;
    }

    resetGame() {
        GameManager.getInstance()._previousGames.push(this);
        console.log(GameManager.getInstance()._previousGames);
        this.setAttempt(0);
        this.setScore(0);
        this.setQuestion(null);
        this.setAnswer(null);
    }

    addPreviousQuestion(question) {
        this.list_of_questions.push(question);
    }
}



























