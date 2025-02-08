const GameController = (
    function () {
        let player1, player2, currentPlayer, gameActive = false;
        const gameBoard = (function () {
            const boardArray = Array(9).fill(0);
            function insertAt(index, value) {
                if (boardArray[index] === 0) {
                    boardArray[index] = value;
                    return 1;
                }
                return 0;
            }

            function checkState() {
                function checkWin() {
                    const winningCombos = [
                        [0, 1, 2], [3, 4, 5], [6, 7, 8],
                        [0, 3, 6], [1, 4, 7], [2, 5, 8],
                        [0, 4, 8], [2, 4, 6]
                    ];
                    for (let i = 0; i < winningCombos.length; i++) {
                        const [a, b, c] = winningCombos[i];
                        if (boardArray[a] && boardArray[a] === boardArray[b] && boardArray[a] === boardArray[c]) {
                            return 1;
                        }
                    }
                    return 0;
                }

                function checkDraw() {
                    if(!boardArray.includes(0) && !checkWin()) {
                        return 1;
                    }
                    return 0;
                }

                const state = checkWin() ? 'win' : checkDraw() ? 'draw' : 'continue';
                return state;
            }

            function reset() {
                for (let i = 0; i < boardArray.length; i++) {
                    boardArray[i] = 0;
                }
            }
            return { 
                get boardArray() {
                    return boardArray;
                },
                insertAt,
                checkState,
                reset
            };
        })()

        function Player(symbol, name = 'Player') {
            const _name = name, _symbol = symbol;
            function makeMove(index) {
                return gameBoard.insertAt(index, symbol);
            }
            return {
                get name() {
                    return _name;
                },
                get symbol() {
                    return _symbol;
                },
                makeMove
            }
        }

        function startNewGame() {
            gameActive = true;
            gameBoard.reset();
            player1 = Player('X', 'Player 1');
            player2 = Player('O', 'Player 2');
            currentPlayer = ((...args) => args[Math.floor(Math.random() * args.length)])(player1, player2);
        }

        function playTurn(index){
            if(typeof index !== 'number' || index < 0 || index > 8){
                console.log('Invalid move. Please enter a number between 0 and 8.');
                return;
            }
            if(gameActive){
                currentPlayer.makeMove(index);
                switch(gameBoard.checkState()){
                    case 'win':
                        console.log(currentPlayer.name + ' wins!');
                        gameActive = false;
                        break;
                    case 'draw':
                        console.log('It\'s a draw!');
                        gameActive = false;
                        break;
                    default:
                        currentPlayer = currentPlayer === player1 ? player2 : player1;
                        break;
                }
            }
        }

        return {
            get BoardState() {
                return gameBoard.boardArray;
            },
            get currentPlayer() {
                return currentPlayer;
            },
            get gameActive() {
                return gameActive;
            },
            startNewGame,
            playTurn
        };
    }
)();

GameController.startNewGame();
GameController.playTurn(0);
GameController.playTurn(1);
GameController.playTurn(3);
GameController.playTurn(4);
GameController.playTurn(6);
console.log(GameController.BoardState[0], GameController.BoardState[1], GameController.BoardState[2]);
console.log(GameController.BoardState[3], GameController.BoardState[4], GameController.BoardState[5]);
console.log(GameController.BoardState[6], GameController.BoardState[7], GameController.BoardState[8]);