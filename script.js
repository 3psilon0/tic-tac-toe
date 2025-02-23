const gameController = ( function () {
    const GameModel = (
        function () {
            let currentPlayer = null, gameActive = false;
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
                                return {
                                    success: 1,
                                    winningCombo: winningCombos[i]
                                };
                            }
                        }
                        return {
                            success: 0,
                            winningCombo: null
                        };
                    }
    
                    function checkDraw() {
                        if(!boardArray.includes(0) && !checkWin().success) {
                            return 1;
                        }
                        return 0;
                    }
    
                    const state = checkWin().success ? 'win' : checkDraw() ? 'draw' : 'continue';
                    return {
                        state,
                        winningCombo: checkWin().winningCombo
                    };
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
                    score = score + 1;
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
    
            let player1 = Player('X', 'Player 1');
            let player2 = Player('O', 'Player 2');

            function startNewGame() {
                gameActive = true;
                gameBoard.reset();
                currentPlayer = ((...args) => args[Math.floor(Math.random() * args.length)])(player1, player2);
            }
    
            function playTurn(index){
                if(typeof index !== 'number' || index < 0 || index > 8 || gameBoard.boardArray[index] != 0){
                    return {
                        state: 'invalid',
                        winningCombo: null
                    };
                }
                if(gameActive){
                    currentPlayer.makeMove(index);
                    const outcome = gameBoard.checkState();
                    switch(outcome.state){
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
                return {
                    state: 'notActive',
                    winningCombo: null
                };
            }
    
            function resetScores() {
                player1.resetScore();
                player2.resetScore();
            }
    
            return {
                get playerScores(){
                    return [player1.score, player2.score];
                },
                get playerNames(){
                    return [player1.name, player2.name];
                },
                get playerSymbols(){
                    return [player1.symbol, player2.symbol];
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
    
    const gameView = (
        function() {
            const gameGrid = document.createElement('div');
            gameGrid.classList.add('game-grid');
            gameGrid.innerHTML = Array.from(GameModel.BoardState, (_ , i) => `<div class="cell-default" id="cell-${i}"></div>`).join('');

            const statusBar = document.createElement('p');
            statusBar.classList.add('status-bar');

            const gameContainer = document.createElement('div');
            gameContainer.append(gameGrid, statusBar);
            gameContainer.classList.add('game-container');

            const scoreCard = () => {
                const scoreCard = document.createElement('div');
                scoreCard.classList.add('score-card');
                scoreCard.innerHTML = `
                    <div>
                        <p>${GameModel.playerNames[0]}</p>
                        <p id="player1-score">${GameModel.playerScores[0]}</p>
                    </div>
                    <div>
                        <p>${GameModel.playerNames[1]}</p>
                        <p id="player2-score">${GameModel.playerScores[1]}</p>
                    </div>
                `;
                return scoreCard;
            }

            const gameControls = document.createElement('div');
            gameControls.classList.add('game-controls');
            gameControls.innerHTML = `
                <button class="game-button" id="new-game"></button>
                <button class="game-button" id="reset-scores"></button>
            `;
            
            return {
                gameContainer,
                statusBar,
                gameGrid,
                scoreCard: scoreCard(),
                gameControls
            };
        }
    )();

    const updateGameGrid = () => {
        GameModel.BoardState.forEach((cell, index) => {
            const DOMcellElement = document.getElementById(`cell-${index}`);
            DOMcellElement.className = 'cell-default';
            if(cell === GameModel.playerSymbols[0]){
                DOMcellElement.classList.add('cell-x');
            } else if(cell === GameModel.playerSymbols[1]){
                DOMcellElement.classList.add('cell-o');
            }
        })
    }

    const updateScoreCardBorder = () => {
        const DOMscoreCard = document.querySelector('.score-card');
        DOMscoreCard.className = 'score-card';
        if(GameModel.currentPlayer.name === GameModel.playerNames[0]){
            DOMscoreCard.classList.add('score-card-turn-x');
        } else if(GameModel.currentPlayer.name === GameModel.playerNames[1]){
            DOMscoreCard.classList.add('score-card-turn-o');
        }
    }

    function handleCellClick(event) {
        if(GameModel.gameActive){
            const DOMstatusBar = document.querySelector('.status-bar');
            const DOMplayer1Score = document.querySelector('#player1-score');
            const DOMplayer2Score = document.querySelector('#player2-score');
            event.currentTarget.className = 'game-grid';
            const cellIndex = Number(event.target.id.split('-')[1]);
            const outcome = GameModel.playTurn(cellIndex);
            updateGameGrid();
            switch(outcome.state){
                case 'win':
                    outcome.winningCombo.forEach((index) => {
                        const winningCell = document.getElementById(`cell-${index}`);
                        winningCell.classList.add('winning-cell');
                    })
                    event.currentTarget.classList.add('game-over');
                    DOMstatusBar.innerText = `${GameModel.currentPlayer.name} has won!`;
                    DOMplayer1Score.innerText = GameModel.playerScores[0];
                    DOMplayer2Score.innerText = GameModel.playerScores[1];
                    break;
                case 'draw':
                    event.currentTarget.classList.add('game-over');
                    DOMstatusBar.innerText = `It is a draw. Nobody has won!`;
                    break;
                case 'continue':
                    DOMstatusBar.innerText = `${GameModel.currentPlayer.name}'s turn`;
                    updateScoreCardBorder();
                    break;
            }
        }
    }

    function handleControls(event) {
        switch(event.target.id){
            case 'reset-scores':
                GameModel.resetScores();
                const DOMplayer1Score = document.querySelector('#player1-score');
                const DOMplayer2Score = document.querySelector('#player2-score');
                DOMplayer1Score.innerText = GameModel.playerScores[0];
                DOMplayer2Score.innerText = GameModel.playerScores[1];
                break;
            case 'new-game':
                GameModel.startNewGame();
                updateGameGrid();
                updateScoreCardBorder();
                document.querySelector('.status-bar').innerText = `${GameModel.currentPlayer.name}'s turn`;
                document.querySelector('.game-grid').className = 'game-grid';
                break;
        }
    }

    const renderGame = () => {
        document.querySelector('.container').append(
            gameView.scoreCard,
            gameView.gameContainer,
            gameView.gameControls
        );

        document.querySelector('.game-grid').addEventListener('click', handleCellClick);
        document.querySelector('.game-controls').addEventListener('click', handleControls);
        document.querySelector('.status-bar').innerText = `${GameModel.currentPlayer.name}'s turn`;
        updateScoreCardBorder();
    }

    return {
        renderGame,
        newGame: GameModel.startNewGame
    }
})();

gameController.newGame();
gameController.renderGame();