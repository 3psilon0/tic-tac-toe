const gameController = ( function (doc) {
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
                        if(!boardArray.includes(0) && !checkWin()) {
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
    
    const gameView = (
        function() {
            const gameGrid = doc.createElement('div');
            gameGrid.classList.add('game-grid');
            gameGrid.innerHTML = Array.from(GameModel.BoardState, (_ , i) => `<div class="cell-default" id="cell-${i}"></div>`).join('');

            const statusBar = doc.createElement('p');
            statusBar.classList.add('status-bar');

            const gameContainer = doc.createElement('div');
            gameContainer.append(gameGrid, statusBar);
            gameContainer.classList.add('game-container');

            const scoreCard = () => {
                const scoreCard = doc.createElement('div');
                scoreCard.classList.add('score-card');
                scoreCard.innerHTML = `
                    <div class="player-score">
                        <p>${GameModel.player1.name}</p>
                        <p>${GameModel.scores[0]}</p>
                    </div>
                    <div class="player-score">
                        <p>${GameModel.player2.name}</p>
                        <p>${GameModel.scores[1]}</p>
                    </div>
                `;
                return scoreCard;
            }

            const gameControls = doc.createElement('div');
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
            const DOMcellElement = doc.getElementById(`cell-${index}`);
            DOMcellElement.className = 'cell-default';
            if(cell === GameModel.player1.symbol){
                DOMcellElement.classList.add('cell-x');
            } else if(cell === GameModel.player2.symbol){
                DOMcellElement.classList.add('cell-o');
            }
        })
    }

    const updateScoreCardBorder = () => {
        DOMscoreCard = doc.querySelector('.score-card');
        DOMscoreCard.className = 'score-card';
        if(GameModel.currentPlayer === GameModel.player1){
            DOMscoreCard.classList.add('score-card-turn-x');
        } else if(GameModel.currentPlayer === GameModel.player2){
            DOMscoreCard.classList.add('score-card-turn-o');
        }
    }

    function handleCellClick(event) {
        if(GameModel.gameActive){
            DOMstatusBar = doc.querySelector('.status-bar');
            DOMscoreCard = doc.querySelector('.score-card');
            event.currentTarget.className = 'game-grid';
            const cellIndex = Number(event.target.id.split('-')[1]);
            const outcome = GameModel.playTurn(cellIndex);
            updateGameGrid();
            switch(outcome.state){
                case 'win':
                    outcome.winningCombo.forEach((index) => {
                        const winningCell = doc.getElementById(`cell-${index}`);
                        winningCell.classList.add('winning-cell');
                    })
                    event.currentTarget.classList.add('game-over');
                    DOMstatusBar.innerText = `${GameModel.currentPlayer === GameModel.player1 ? GameModel.player2.name : GameModel.player1.name} has won!`;
                    DOMscoreCard.replaceWith(gameView.scoreCard);
                    break;
                case 'draw':
                    DOMgameGrid.classList.add('game-over');
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
                doc.querySelector('score-card').replaceWith(gameView.scoreCard);
                break;
            case 'new-game':
                GameModel.startNewGame();
                updateGameGrid();
                updateScoreCardBorder();
                break;
        }
    }

    const renderGame = function () {
        doc.querySelector('.container').append(
            gameView.scoreCard,
            gameView.gameContainer,
            gameView.gameControls
        );

        doc.querySelector('game-grid').addEventListener('click', handleCellClick);
        doc.querySelector('.game-controls').addEventListener('click', handleControls);
    }

    return {
        renderGame
    }
})(document);

gameController.renderGame();