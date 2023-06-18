function play(e){
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
        if(!this._inGame){
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
class GameController{
   _strike = 0;
   generateQuestion(event){
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
generateBeginnerQuestion(){

    const gameManager = GameManager.getInstance();
    const game = GameManager.getInstance().getGame();
    const uiController = GameManager.getInstance()._uiController;

    const firstNumber = Math.floor(Math.random() * 10);
    const secondNumber = Math.floor(Math.random() * 10);
    const operator = ['+', '-'][Math.floor(Math.random() * 2)];
    const answer = operator === '+' ? firstNumber + secondNumber : firstNumber - secondNumber;
    const question = `${firstNumber} ${operator} ${secondNumber}`;

    game.setQuestion(question);
    game.setAnswer(answer);
    uiController.displayGeneratedQuestion(question);
    uiController.enableCheckAnswerButton();
    uiController.disableGenerateQuestionButton();
    uiController.clearAnswerInput();
    uiController.hideMessageBoxUI();
   }
  
   checkAnswer(event){
    event.preventDefault();
    const gameManager = GameManager.getInstance();
    const game = gameManager.getGame();
    const answer = game.getAnswer();
    const uiController =gameManager._uiController;

    if(!answer){
        uiController.clearMessageBoxButtons();
        uiController.addMessageBoxButton('Generate', () => { uiController.hideMessageBoxUI(), this.generateBeginnerQuestion(); });
        uiController.displayMessageBox('Error!', 'Please generate a question first.');
        return;   
    }
    const playerAnswer = uiController._answerInput.value;
    if(!playerAnswer){
        uiController.clearMessageBoxButtons();
        uiController.displayMessageBox('Error!', 'Please enter your answer.');
        return;
    }
    if (answer === parseInt(playerAnswer)) {
        game.setScore(game.getScore() + 1);
        uiController.clearMessageBoxButtons();
        uiController.displayMessageBox('Correct!', `You got the correct answer! <p>score +${1}</p>`);
        uiController.addMessageBoxButton('Generate New Question', () => { uiController.hideMessageBoxUI(), this.generateBeginnerQuestion(); });  
        uiController.updatePlayerInfo(game.getPlayerName(), game.getScore(), game.getAttempt(), game.getDifficulty());
        uiController.disableCheckAnswerButton();
        uiController.enableGenerateQuestionButton();

    } else {
        if(game.getAttempt() === 1){
            uiController.clearMessageBoxButtons();
            uiController.displayMessageBox('Game Over!', `
            Question: ${game.getQuestion()}<br>
            your answer:
            <p style="color: red;">
            ${playerAnswer}
            </p>
            <br>
            The correct answer is 
            <p style="color: green;">
            ${answer}
            </p>
            `);
        
            uiController.hideQuestionUI();
            uiController.displayStartGameUI();
            uiController.hidePlayerInfoUI();

            //reset Game state
            gameManager._inGame = false;
            game.resetGame();
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
        uiController.addMessageBoxButton('Generate New Question', () => { uiController.hideMessageBoxUI(), this.generateBeginnerQuestion(); });  

    }
    uiController.updatePlayerInfo(game.getPlayerName(), game.getScore(), game.getAttempt(), game.getDifficulty());
}
}


class UiController{
    //start Game UI
    _startGameUI = document.getElementsByClassName('start-game-container')[0];
    _startGameButton = document.getElementById('start-game-button');
    _playerNameInput = document.getElementById('player-name-input');

//question UI
    _questionUI = document.getElementsByClassName('question-container')[0];
    _question = document.getElementById('question');
    _questionView = document.getElementById('question-view');
    _answerInput = document.getElementById('answer-input');
    _checkAnswerButton = document.getElementById('check-answer-button');
    _generateQuestionButton = document.getElementById('generate-question-button');
    
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

    //Player Info UI
    _playerInfoUI = document.getElementsByClassName('player-info-container')[0];
    _playerNameTag = document.getElementById('player-name-tag');
    _playerScoreTag = document.getElementById('player-score-tag');
    _playerDifficultyTag = document.getElementById('player-difficulty-tag');
    _playerAttemptTag = document.getElementById('player-attempt-tag');
    _resetButton = document.getElementById('reset-button');

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
    displayPlayerName(){
        this._playerNameTag.innerHTML = GameManager.getInstance().getGame().getPlayerName();
    }


        //question UI
        displayQuestionUI() {
            this._questionUI.style.display = 'block';
        }
        displayGeneratedQuestion(question) {
         
            this._questionView.style.display = 'block';
           
            this._question.innerHTML = question;
        }
      

        hideQuestionUI() {
            this._questionUI.style.display = 'none';
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
        const game = GameManager.getInstance().getGame();
      
        this._selectDifficultyButton.onclick = () => {
          const checkedDifficulty = this.difficultyRadioButtons.find(difficulty => difficulty.checked);
          if (checkedDifficulty) {

            const startGame = () => {
              this.hideMessageBoxUI();
              this.hideSelectDifficultyUI();
              game.setDifficulty(checkedDifficulty.value);
              game.setScore(0);
              game.setAttempt(this.getDifficultyAttempt(checkedDifficulty.value));
              this.updatePlayerInfo(game.getPlayerName(), game.getScore(), game.getAttempt(), game.getDifficulty());
              this.displayQuestionUI();
              this.displayPlayerInfoUI();
            };
      
            this.displayMessageBox('Start the Game', this.getDifficultyTextMessage(checkedDifficulty.value));
            this.hideMessageBoxCloseButton();
            this.clearMessageBoxButtons();
            this.addMessageBoxButton('Start Game', startGame);
            this.addMessageBoxButton('Cancel', () => this.hideMessageBoxUI());
          } else {
            this.displayMessageBox('Error', 'Please select a difficulty level.');
          }
        };
      }
    updatePlayerInfo(playerName, score, attempt, difficulty) {
        if (playerName !== null && playerName !== undefined) {
          this._playerNameTag.innerHTML = "<b>Player Name:</b> " + playerName ;
        }
        if (score !== null && score !== undefined) {
          this._playerScoreTag.innerHTML = "<b>Score:</b> " + score ;
        }
        if (attempt !== null && attempt !== undefined) {
          this._playerAttemptTag.innerHTML = "<b>Attempt:</b> " + attempt ;
        }
        if (difficulty !== null && difficulty !== undefined) {
          this._playerDifficultyTag.innerHTML = "<b>Difficulty:</b> " + difficulty ;
        }
      }

        


    //player info ui Methods
    setPlayerName(){
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
    addMessageBoxButton(buttonText, buttonOnClick) {
        const button = document.createElement('button');
        button.innerHTML = buttonText;
        button.onclick = buttonOnClick;
        this._messageBoxButtons.appendChild(button);
    }
    clearMessageBoxButtons() {
        this._messageBoxButtons.innerHTML = '';
    }

        //message box close button
        hideMessageBoxCloseButton() {
            this._messageBoxCloseButton.style.display = 'none';
        }
        showMessageBoxCloseButton() {
            this._messageBoxCloseButton.style.display = 'block';
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

    






  

    
 
}





class Game {
    attempt;
    score;
    question;
    answer;
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


}



























