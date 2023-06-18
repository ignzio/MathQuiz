# Program README

This program consists of multiple classes that work together to create a game with math questions. Let's go through each class and their functionalities.

## `GameManager` Class

- Manages the overall state and settings of the game.
- Keeps track of the number of attempts made by the player.
- Stores the current answer.
- Tracks the difficulty level of the game.
- Provides methods to modify and access the game state, such as setting the attempt, getting the answer, and resetting the attempt.
- Initiates the game by starting the game interface or UI element.
- Acts as a singleton to ensure there is only one instance of the `GameManager` throughout the application.

## `GameController` Class

- Handles the game logic and actions related to gameplay.
- Manages the generation of math questions based on the specified difficulty level.
- Validates the player's answer and provides feedback on correctness.
- Interacts with the user interface (UI) elements to display questions, retrieve answers, and show results.
- May handle additional game-related functionalities such as scoring, level progression, or game flow.

## `UiController` Class

- Manages the user interface (UI) elements and their interactions.
- Provides methods to display and hide different UI elements based on the game state.
- Updates the player information displayed on the UI.
- Handles message boxes to display information or messages to the player.

## `Game` Class

- Represents the game state and data.
- Stores information such as the player's name, score, difficulty level, number of attempts, current question, and answer.
- Provides methods to modify and access the game data, such as setting the player name, difficulty, score, etc.
- Includes a method to reset the game state.

## How to Use

To play the game, you can call the `play` function and pass the event object as an argument. This function prevents the default behavior of the event and starts the game by calling `GameManager.getInstance().startGame()`.

Make sure to include all the necessary JavaScript files and HTML elements in your project to properly run the game.

Please note that this README provides an overview of the program structure and functionality. For more detailed information about each class and its methods, refer to the actual code implementation.

