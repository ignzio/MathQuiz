
let gameManager;
function play() {
    gameManager = new GameManager();
    gameManager.startGame();
}


// Manages the overall state and settings of the game.
// Keeps track of the number of attempts made by the player.
// Stores the current answer.
// Tracks the difficulty level of the game.
// Provides methods to modify and access the game state, such as setting the attempt, getting the answer, and resetting the attempt.
// Initiates the game by starting the game interface or UI element.
// Acts as a singleton to ensure there is only one instance of the GameManager throughout the application.
class GameManager {
    _game;
    _gameController;
    _uiController;
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance; // Return existing instance
          }
          // Create new instance
          GameManager.instance = this;
          console.log('Game Manager Created');      
        }

    //attempt methods
    setAttempt(attempt) {
        this.attempt = attempt;
    }
    getAttempt() {
        return this.attempt;
    }
    increaseAttemptByOne() {
        this.attempt++;
    }
    resetAttempt() {
        this.attempt = 0;
    }

    //answers
    setAnswer(answer) {
        this.answer = answer;
    }
    getAnswer() {
        return this.answer;
    }
    resetAnswer() {
        this.answer = 0;
    }
    
    //difficulty
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    getDifficulty() {
        return this.difficulty;
    }

    startGame() {
        this._gameController = new GameController();
        this._uiController = new UiController();
    }

   
}








// Handles the game logic and actions related to gameplay.
// Manages the generation of math questions based on the specified difficulty level.
// Validates the player's answer and provides feedback on correctness.
// Interacts with the user interface (UI) elements to display questions, retrieve answers, and show results.
// May handle additional game-related functionalities such as scoring, level progression, or game flow.
class GameController{
    constructor() {
        if (GameController.instance) {
            return GameController.instance; // Return existing instance
          }
          // Create new instance
          GameController.instance = this;
          console.log('Game Controller Created');
        }

        

    
}

class UiController{
    _startGameUI = document.getElementsByClassName('start-game-container')[0];
    _questionUI = document.getElementsByClassName('question-container')[0];
    
    //select difficulty UI
    _selectDifficultyUI = document.getElementsByClassName('select-difficulty-container')[0];
    _selectDifficultyButton = document.getElementById('select-difficulty-button');
    difficultyRadioButtons = document.querySelectorAll('input[name="difficulty"]');

    //message box UI
    _messageBoxUI = document.getElementsByClassName('message-box-container')[0];
    _messageBoxTitle = document.getElementById('message-box-title');
    _messageBoxMessage = document.getElementById('message-box-message');
    _messageBoxCloseButton = document.getElementById('close-message-box-button');
    _messageBoxButtons = document.getElementsByClassName('message-box-buttons')[0];

    constructor() {
        if (UiController.instance) {
            return UiController.instance; // Return existing instance
          }
          // Create new instance
          UiController.instance = this;
          console.log('UI Controller Created');
          this.addMessageBoxCloseButtonEvent();
          this.addSelectDifficultyButtonEvent();

          this.hideStartGameUI();
          this.displaySelectDifficultyUI();
        }

    //start game UI
    displayStartGameUI() {
        this._startGameUI.style.display = 'block';
    }
    hideStartGameUI() {
        this._startGameUI.style.display = 'none';
    }

        //question UI
        displayQuestionUI() {
        this._questionUI.style.display = 'block';
        }
        hideQuestionUI() {
            this._questionUI.style.display = 'none';
        }

    //select difficulty UI
    displaySelectDifficultyUI() {
        this._selectDifficultyUI.style.display = 'block';
    }
    hideSelectDifficultyUI() {
        this._selectDifficultyUI.style.display = 'none';
    }

    

    //difficulty selection UI
    onDifficultySelected(difficulty) {
        const selectedDifficulty = document.querySelector(`input[name="difficulty"]:checked`).value;
        if (selectedDifficulty) {
            const difficulty = selectedDifficulty;
            gameManager.setDifficulty(difficulty);
        }
        else {
            this.displayMessageBox('Error', 'Please select a difficulty level.');
        }
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
    hideMessageBox() {
        this.hideMessageBoxUI();
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




    addSelectDifficultyButtonEvent() {
        let isDifficultySelected = false;
        
        let diffculty;
        this._selectDifficultyButton.onclick = () => {
            //if difficulty is selected pop up message box with the message relative
            //to the difficulty selected
            
       
            this.difficultyRadioButtons.forEach(difficulty => {
                if (difficulty.checked) {
                    console.log(difficulty.value);
                    diffculty = difficulty.value;
                    isDifficultySelected = true;
                }
                
            }
            
            );
            if (isDifficultySelected) {
                
                this.displayMessageBox('Start the Game', `You have selected ${diffculty} are you ready to start the game?`);
                this.hideMessageBoxCloseButton();
                this.clearMessageBoxButtons();
                this.addMessageBoxButton('Start Game', () => {
                    this.hideMessageBox();
                    this.hideSelectDifficultyUI();
                    this.displayQuestionUI();
                }
                );
                this.addMessageBoxButton('Cancel', () => {
                    this.hideMessageBox();
                }
                );

                
                
                
            }
            else {
                this.displayMessageBox('Error', 'Please select a difficulty level.');
            }
          
        }
    }

    addMessageBoxCloseButtonEvent() {
        this._messageBoxCloseButton.onclick = () => {
            this.hideMessageBox();
        }
    }


  

    
 
}





class Game {
    attempt;
    answer;
    difficulty;
    _playerName;
    constructor(attempt, answer, difficulty, playerName) {
        if (Game.instance) {
            return Game.instance; // Return existing instance
          }
          // Create new instance
          Game.instance = this;
            this.attempt = attempt;
            this.answer = answer;
            this.difficulty = difficulty;
            this.playerName = playerName;
          console.log('Game Created');
        }
    
}
































// let attempts = 0;
// let currentQuestion = '';

// function generateMathQuestion(level) {
//   let num1, num2, operator;
//   switch (level) {
//     case 'Beginner':
//       num1 = Math.floor(Math.random() * 10) + 1;
//       num2 = Math.floor(Math.random() * 10) + 1;
//       operator = ['+', '-'][Math.floor(Math.random() * 2)];
//       break;
//     case 'Intermediate':
//       num1 = Math.floor(Math.random() * 100) + 1;
//       num2 = Math.floor(Math.random() * 100) + 1;
//       operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
//       break;
//     case 'Advanced':
//       num1 = Math.floor(Math.random() * 1000) + 1;
//       num2 = Math.floor(Math.random() * 1000) + 1;
//       operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
//       break;
//     case 'Expert':
//       return generateCalculusQuestion();
//     default:
//       // Default to beginner level
//       num1 = Math.floor(Math.random() * 10) + 1;
//       num2 = Math.floor(Math.random() * 10) + 1;
//       operator = ['+', '-'][Math.floor(Math.random() * 2)];
//       break;
//   }
//   return `${num1} ${operator} ${num2}`;
// }

// function generateCalculusQuestion() {
//   let question = '';
//   let type = Math.floor(Math.random() * 3);
//   switch (type) {
//     case 0:
//       // Derivative
//       let f = ['x^2', 'sin(x)', 'cos(x)', 'tan(x)', 'e^x'][Math.floor(Math.random() * 5)];
//       question = `Find the derivative of f(x) = ${f}`;
//       break;
//     case 1:
//       // Integral
//       let g = ['x^2', 'sin(x)', 'cos(x)', 'tan(x)', 'e^x'][Math.floor(Math.random() * 5)];
//       question = `Find the indefinite integral of g(x) = ${g}`;
//       break;
//     case 2:
//       // Limit
//       let h = ['x^2', 'sin(x)', 'cos(x)', 'tan(x)', 'e^x'][Math.floor(Math.random() * 5)];
//       let a = Math.floor(Math.random() * 10) + 1;
//       question = `Find the limit of h(x) = ${h} as x approaches ${a}`;
//       break;
//   }
//   return question;
// }

// function checkAnswer() {
//     let answer = document.getElementById('answer').value;
//     let correctAnswer;
  
//     if (currentQuestion.includes('derivative')) {
//       correctAnswer = math.derivative(currentQuestion.split('= ')[1], 'x').toString();
//     } else if (currentQuestion.includes('integral')) {
//       correctAnswer = math.integral(currentQuestion.split('= ')[1], 'x').toString();
//     } else if (currentQuestion.includes('limit')) {
//       correctAnswer = math.limit(currentQuestion.split('= ')[1], 'x', currentQuestion.split('approaches ')[1]).toString();
//     } else {
//       correctAnswer = eval(currentQuestion);
//     }
  
//     if (answer == correctAnswer) {
//       document.getElementById('result').textContent = `Correct! The answer is ${correctAnswer}.`;
//       attempts = 0;
//     } else {
//       attempts++;
//       if (attempts >= 3) {
//         document.getElementById('result').textContent = `Incorrect. The correct answer is ${correctAnswer}.`;
//         attempts = 0;
//       } else {
//         document.getElementById('result').textContent = 'Incorrect. Try again.';
//       }
//     }
//     document.getElementById('attempts').textContent = attempts;
//   }
  

// function generateAndDisplayQuestion() {
//   let level = document.getElementById('difficulty').value;
//   currentQuestion = generateMathQuestion(level);
//   document.getElementById('question').textContent = currentQuestion;
//   document.getElementById('result').textContent = '';
//   attempts = 0;
// }

// function checkUserAnswer() {
//   let answer = document.getElementById('answer').value;
//   let resultText= checkAnswer(currentQuestion, answer);
//   document.getElementById('result').textContent=resultText; 
// }