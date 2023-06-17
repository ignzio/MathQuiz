GameManager class:

Manages the overall state and settings of the game.
Keeps track of the number of attempts made by the player.
Stores the current answer.
Tracks the difficulty level of the game.
Provides methods to modify and access the game state, such as setting the attempt, getting the answer, and resetting the attempt.
Initiates the game by starting the game interface or UI element.
Acts as a singleton to ensure there is only one instance of the GameManager throughout the application.
GameController class:

Handles the game logic and actions related to gameplay.
Manages the generation of math questions based on the specified difficulty level.
Validates the player's answer and provides feedback on correctness.
Interacts with the user interface (UI) elements to display questions, retrieve answers, and show results.
May handle additional game-related functionalities such as scoring, level progression, or game flow.