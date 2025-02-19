const GameModel = (
    function () {
        let player1 = null, player2 = null, currentPlayer = null, gameActive = false;
        const gameBoard = ( function () {
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
            let score = 0;
            function makeMove(index) {
                return gameBoard.insertAt(index, symbol);
            }
            function updateScore() {
                score++;
            }
            function resetScore() {
                score = 0;
            }
            return {
                get score() {
                    return score;
                },
                get name() {
                    return _name;
                },
                get symbol() {
                    return _symbol;
                },
                makeMove,
                updateScore,
                resetScore
            }
        }

        function startNewGame(player1Name = 'Player 1', player2Name = 'Player 2') {
            gameActive = true;
            gameBoard.reset();
            if(player1 === null && player2 === null){
                player1 = Player('X', player1Name);
                player2 = Player('O', player2Name);
            }

            currentPlayer = ((...args) => args[Math.floor(Math.random() * args.length)])(player1, player2);
        }

        function playTurn(index){
            if(typeof index !== 'number' || index < 0 || index > 8){
                return 'invalid';
            }
            if(gameActive){
                currentPlayer.makeMove(index);
                const outcome = gameBoard.checkState()
                switch(outcome){
                    case 'win':
                        currentPlayer.updateScore();
                        gameActive = false;
                        break;
                    case 'draw':
                        gameActive = false;
                        break;
                    default:
                        currentPlayer = currentPlayer === player1 ? player2 : player1;
                        break;
                }
                return outcome;
            }
            return 'notActive';
        }

        function resetScores() {
            player1.resetScore();
            player2.resetScore();
        }

        return {
            get scores() {
                return [player1.score, player2.score];
            },
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
            playTurn,
            resetScores
        };
    }
)();

const displayController = ( function (gm) {
    const displayElements = (
        function() {
            const gameGrid = document.createElement('div');
            gameGrid.classList.add('game-grid');
            gameGrid.innerHTML = Array.from(gm.BoardState, (_ , i) => `<div class="cell" id="cell-${i}"></div>`).join('');

            
        }
    )(); 
})(GameModel);