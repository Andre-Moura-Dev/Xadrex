document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');

    let turn = 'white'; // 'white' or 'black'
    let selectedPiece = null;

    const pieces = {
        'white-king': '♔',
        'white-queen': '♕',
        'white-rook': '♖',
        'white-bishop': '♗',
        'white-knight': '♘',
        'white-pawn': '♙',
        'black-king': '♚',
        'black-queen': '♛',
        'black-rook': '♜',
        'black-bishop': '♝',
        'black-knight': '♞',
        'black-pawn': '♟'
    };

    const startingPosition = [
        'black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook',
        'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn',
        'white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook'
    ];

    function createBoard() {
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;

            const row = Math.floor(i / 8);
            const col = i % 8;
            if ((row + col) % 2 === 0) {
                cell.classList.add('white');
            } else {
                cell.classList.add('black');
            }

            if (startingPosition[i] !== '') {
                const piece = document.createElement('div');
                piece.className = 'piece';
                piece.innerHTML = pieces[startingPosition[i]];
                piece.dataset.type = startingPosition[i];
                piece.dataset.color = startingPosition[i].split('-')[0];
                cell.appendChild(piece);
            }

            cell.addEventListener('click', () => cellClickHandler(cell));

            board.appendChild(cell);
        }
    }

    function cellClickHandler(cell) {
        const piece = cell.querySelector('.piece');

        if (selectedPiece) {
            if (piece && piece.dataset.color !== turn) {
                if (isMoveValid(selectedPiece, cell)) {
                    cell.innerHTML = selectedPiece.innerHTML;
                    selectedPiece.parentElement.innerHTML = '';
                    selectedPiece = null;
                    toggleTurn();

                    if (isKingInCheck(turn)) {
                        if (isCheckmate(turn)) {
                            alert(`Xeque-mate! O jogador ${turn === 'white' ? 'Branco' : 'Preto'} venceu!`);
                            resetGame();
                        } else {
                            alert(`O jogador ${turn === 'white' ? 'Preto' : 'Branco'} está em xeque!`);
                        }
                    }
                } else {
                    selectedPiece.classList.remove('selected');
                    selectedPiece = null;
                }
            } else {
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
            }
        } else {
            if (piece && piece.dataset.color === turn) {
                selectedPiece = piece;
                piece.classList.add('selected');
            }
        }
    }

    function isKingInCheck(color) {
        const kingCell = document.querySelector(`.piece[data-type="${color}-king"]`).parentElement;
        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = document.querySelectorAll(`.piece[data-color="${opponentColor}"]`);

        for (const opponentPiece of opponentPieces) {
            if (isMoveValid(opponentPiece, kingCell)) {
                return true;
            }
        }

        return false;
    }

    function isCheckmate(color) {
        const playerColor = color;
        const opponentColor = color === 'white' ? 'black' : 'white';

        if (!isKingInCheck(playerColor)) {
            return false;
        }

        const kingCell = document.querySelector(`.piece[data-type="${playerColor}-king"]`).parentElement;
        const kingRowIndex = parseInt(kingCell.dataset.index / 8);
        const kingColIndex = kingCell.dataset.index % 8;

        for (let row = kingRowIndex - 1; row <= kingRowIndex + 1; row++) {
            for (let col = kingColIndex - 1; col <= kingColIndex + 1; col++) {
                if (row >= 0 && row < 8 && col >= 0 && col < 8) {
                    const targetCell = document.querySelector(`.cell[data-index="${row * 8 + col}"]`);
                    if (isMoveValid(kingCell.querySelector('.piece'), targetCell)) {
                        return false;
                    }
                }
            }
        }

        const threateningPiece = getThreateningPiece(kingCell, opponentColor);
        if (threateningPiece) {
            const possibleCapturers = document.querySelectorAll(`.piece[data-color="${playerColor}"]`);
            for (const capturer of possibleCapturers) {
                if (isMoveValid(capturer, threateningPiece.parentElement)) {
                    if (!isPieceBlockingPath(capturer, threateningPiece.parentElement)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    function resetGame() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.innerHTML = '';
        });
        createBoard();
        turn = 'white';
        selectedPiece = null;
    }

    document.addEventListener('keydown', (event) => {
        if (selectedPiece) {
            const currentCell = selectedPiece.parentElement;
            let newRow = parseInt(currentCell.dataset.index / 8);
            let newCol = currentCell.dataset.index % 8;

            switch (event.key) {
                case 'ArrowUp':
                    newRow--;
                    break;
                case 'ArrowDown':
                    newRow++;
                    break;
                case 'ArrowLeft':
                    newCol--;
                    break;
                case 'ArrowRight':
                    newCol++;
                    break;
                default:
                    return; // Não faz nada se a tecla pressionada não for uma seta
            }

            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const newCell = document.querySelector(`.cell[data-index="${newRow * 8 + newCol}"]`);

                if (isMoveValid(selectedPiece, newCell)) {
                    newCell.innerHTML = selectedPiece.innerHTML;
                    currentCell.innerHTML = '';
                    selectedPiece = newCell.querySelector('.piece');
                    toggleTurn();

                    if (isKingInCheck(turn)) {
                        if (isCheckmate(turn)) {
                            alert(`Xeque-mate! O jogador ${turn === 'white' ? 'Branco' : 'Preto'} venceu!`);
                            resetGame();
                        } else {
                            alert(`O jogador ${turn === 'white' ? 'Preto' : 'Branco'} está em xeque!`);
                        }
                    }
                }
            }
        }
    });

    function isMoveValid(piece, cell) {
        const pieceType = piece.dataset.type;
        const pieceColor = piece.dataset.color;
        const startCell = piece.parentElement;
        const endCell = cell;
        const startRowIndex = Math.floor(startCell.dataset.index / 8);
        const startColIndex = startCell.dataset.index % 8;
        const endRowIndex = Math.floor(endCell.dataset.index / 8);
        const endColIndex = endCell.dataset.index % 8;

        // Verifica se a célula de destiono já está ocupada pela mesma cor 
        if(endCell.querySelector('.piece') && endCell.querySelector('.piece').dataset.color === pieceColor) {
            return false;
        }

        switch (pieceColor) {
            case `${pieceColor}-pawn`:
                const direction = pieceColor === 'white' ? -1 : 1; // direção do movimento
                const startingRow = pieceColor === 'white' ? 6 : 1; //linha inicial para avanço de 2 casas
                const isFirstMove = startRowIndex === startingRow; // Verifica se é o primeiro movimento

                // Movimento normal de avanço
                if (startColIndex === endColIndex && 
                    endRowIndex === startRowIndex + direction && 
                    !endCell.querySelector('.piece')) {
                    return true;
                }

                // Captura diagonal
                if (Math.abs(endColIndex - startColIndex) === 1 && 
                    endRowIndex === startRowIndex + direction &&
                    endCell.querySelector('.piece') && 
                    endCell.querySelector('.piece').dataset.color !== pieceColor) {
                    return true;
                }

                //Movimento de avanço de 2 casas
                if (isFirstMove && 
                    endColIndex === startColIndex && 
                    endRowIndex === startRowIndex + 2 * direction && 
                    !endCell.querySelector('.piece') &&
                    !document.querySelector(`.cell[data-index="${(startRowIndex + direction) * 8 + startColIndex}"]`).querySelector('.piece')) {
                    return true;
                }

                break;
            case `${pieceColor}-rook`:
                if ((startRowIndex === endRowIndex || startColIndex === endColIndex) &&
                    !isPieceBlockingPath(piece, endCell)) {
                    return true;
                }
                break;
            case `${pieceColor}-bishop`:
                if (Math.abs(endRowIndex - startRowIndex) === Math.abs(endColIndex - startColIndex) &&
                    !isPieceBlockingPath(piece, endCell)) {
                    return true;
                }
                break;
            case `${pieceColor}-queen`:
                if ((startRowIndex === endRowIndex || startColIndex === endColIndex ||
                    Math.abs(endRowIndex - startRowIndex) === Math.abs(endColIndex - startColIndex)) &&
                    !isPieceBlockingPath(piece, endCell)) {
                    return true;
                }
                break;
            case `${pieceColor}-king`:
                if (Math.abs(endRowIndex - startRowIndex) <= 1 &&
                    Math.abs(endColIndex - startColIndex) <= 1 &&
                    !isKingInCheckAfterMove(piece, startCell, endCell)) {
                    return true;
                }
                break;
            case `${pieceColor}-knight`:
                if ((Math.abs(endRowIndex - startRowIndex) === 2 && Math.abs(endColIndex - startColIndex) === 1) ||
                    (Math.abs(endRowIndex - startRowIndex) === 1 && Math.abs(endColIndex - startColIndex) === 2)) {
                    return true;
                }
                break;
            default:
                return false;
        }

        return false;
    }

    function isPieceBlockingPath(piece, endCell) {
        const pieceColor = piece.dataset.color;
        const startCell = piece.parentElement;
        const startRowIndex = parseInt(startCell.dataset.index / 8);
        const startColIndex = startCell.dataset.index % 8;
        const endRowIndex = parseInt(endCell.dataset.index / 8);
        const endColIndex = endCell.dataset.index % 8;

        if (startRowIndex === endRowIndex) {
            const start = Math.min(startColIndex, endColIndex);
            const end = Math.max(startColIndex, endColIndex);

            for (let i = start + 1; i < end; i++) {
                const cell = document.querySelector(`.cell[data-index="${startRowIndex * 8 + i}"]`);
                
                if(cell.querySelector('.piece')) {
                    return true;
                }
                
            }
        } else if (startColIndex === endColIndex) {
            const start = Math.min(startRowIndex, endRowIndex);
            const end = Math.max(startRowIndex, endRowIndex);
            for (let i = start + 1; i < end; i++) {
                const cell = document.querySelector(`.cell[data-index="${i * 8 + startColIndex}"]`);
                
                if(cell.querySelector('.piece')) {
                    return true;
                }
            }
        } else if (Math.abs(endRowIndex - startRowIndex) === Math.abs(endColIndex - startColIndex)) {
            const rowIncrement = endRowIndex > startRowIndex ? 1 : -1;
            const colIncrement = endColIndex > startColIndex ? 1 : -1;
            let row = startRowIndex + rowIncrement;
            let col = startColIndex + colIncrement;
            while (row !== endRowIndex && col !== endColIndex) {
                const cell = document.querySelector(`.cell[data-index="${row * 8 + col}"]`);
                if (cell.querySelector('.piece')) {
                    return true;
                }
                row += rowIncrement;
                col += colIncrement;
            }
        }

        return false;
    }

    function isKingInCheckAfterMove(piece, startCell, endCell) {
        const originalPiece = endCell.querySelector('.piece');
        endCell.innerHTML = piece.innerHTML;
        startCell.innerHTML = '';
        const isInCheck = isKingInCheck(piece.dataset.color);
        startCell.innerHTML = piece.innerHTML;
        endCell.innerHTML = originalPiece ? originalPiece.innerHTML : '';
        return isInCheck;
    }

    function getThreateningPiece(kingCell, opponentColor) {
        const pieces = document.querySelectorAll(`.piece[data-color="${opponentColor}"]`);
        for (const piece of pieces) {
            if (isMoveValid(piece, kingCell)) {
                return piece;
            }
        }
        return null;
    }

    function toggleTurn() {
        turn = turn === 'white' ? 'black' : 'white';
    }

    createBoard();
});