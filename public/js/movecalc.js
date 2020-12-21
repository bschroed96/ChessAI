class tnode {
  constructor(game, parent) {
    this.child1 = null;
    this.child2 = null;
    this.parent = null;
    this.n_plays = 0;
    this.n_wins = 0;
    this.game = game;
    this.parent = parent;
  }
}




/**
 * Finds a random move to make
 * @return {string} move to make
 */
var randomMove = function() {
  var possibleMoves = game.moves();
  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
};

/**
 * Evaluates current chess board relative to player
 * @param {string} color - Players color, either 'b' or 'w'
 * @return {Number} board value relative to player
 */
var evaluateBoard = function(board, color) {
  // Sets the value for each piece using standard piece value
  var pieceValue = {
    'p': 100,
    'n': 350,
    'b': 350,
    'r': 525,
    'q': 1000,
    'k': 10000
  };

  // Loop through all pieces on the board and sum up total
  var value = 0;
  board.forEach(function(row) {
    row.forEach(function(piece) {
      if (piece) {
        // Subtract piece value if it is opponent's piece
        value += pieceValue[piece['type']]
                 * (piece['color'] === color ? 1 : -1);
      }
    });
  });

  return value;
};

/**
 * Calculates the best move looking one move ahead
 * @param {string} playerColor - Players color, either 'b' or 'w'
 * @return {string} the best move
 */
var calcBestMoveOne = function(playerColor) {
  // List all possible moves
  var possibleMoves = game.moves();
  // Sort moves randomly, so the same move isn't always picked on ties
  possibleMoves.sort(function(a, b){return 0.5 - Math.random()});

  // exit if the game is over
  if (game.game_over() === true || possibleMoves.length === 0) return;

  // Search for move with highest value
  var bestMoveSoFar = null;
  var bestMoveValue = Number.NEGATIVE_INFINITY;
  possibleMoves.forEach(function(move) {
    game.move(move);
    var moveValue = evaluateBoard(game.board(), playerColor);
    if (moveValue > bestMoveValue) {
      bestMoveSoFar = move;
      bestMoveValue = moveValue;
    }
    game.undo();
  });

  return bestMoveSoFar;
}

////////////////// Begin MCTS functions ////////////////////////
// var increaseWin = function(node) {
//   origNode = new tnode(node.game, node.parent)
//   while (node != null) {
//     node.n_wins += 1;
//     node.n_plays += 1;
//     node = node.parent;
//   }
//   origNode.n_plays += 1;
//   origNode.n_wins += 1;
//   return origNode
// }

// var increaseLoss = function(node) {
//   origNode = new tnode(node.game, node.parent)
//   while (node != null) {
//     node.n_plays += 1;
//     node = node.parent;
//   }
//   origNode.n_plays += 1;
//   return origNode
// }

// var calculateRollout = function(node) {
//   randmove = randomMove();
//   game.move(randmove);
//   moveValue = evaluateBoard(game.board(), playerColor);
//   // update the child node with the new board pos. Keep parent the same
//   node = new tnode(game, node.parent);
//   if (moveValue >= 0) {
//     // should increase the wins and plays of this node and all parent nodes
//     node = increaseWin(node);
//   } else {
//     // only increase plays
//     node = increaseLoss(node);
//   }
//   return node;
// }

// var calcUCB = function(node) {
//   return (node.n_wins / node.n_plays) + Math.sqrt(Math.log(node.parent.n_plays) / node.n_plays)
// }

// // returns the node with the greatest UCB
// var findGreatest = function(node) {
//   while (node.child1 != null && node.child2 != null) {
//     if (calcUCB(node.child1) >= calcUCB(node.child2)) {
//       node = node.child1;
//     } else {
//       node = node.child2;
//     }
//   }

//   return node;

// }

// var calcBestMoveMCTS = function(depth, game, playerColor, isMaximizingPlayer=true) {
//   // Base case: evaluate board
//   if (depth === 0) {
//     value = evaluateBoard(game.board(), playerColor);
//     return [value, null]
//   }

//   let mcts = new MonteCarloTree(game)
//   mcts.runSearch(game)

// }

/**
 * Calculates the best move using Minimax without Alpha Beta Pruning.
 * @param {Number} depth - How many moves ahead to evaluate
 * @param {Object} game - The game to evaluate
 * @param {string} playerColor - Players color, either 'b' or 'w'
 * @param {Boolean} isMaximizingPlayer - If current turn is maximizing or minimizing player
 * @return {Array} The best move value, and the best move
 */
var calcBestMoveNoAB = function(depth, game, playerColor,
                                isMaximizingPlayer=true) {
  // Base case: evaluate board
  if (depth === 0) {
    value = evaluateBoard(game.board(), playerColor);
    return [value, null]
  }

  // Recursive case: search possible moves
  var bestMove = null; // best move not set yet
  var possibleMoves = game.moves();
  // Set random order for possible moves
  possibleMoves.sort(function(a, b){return 0.5 - Math.random()});
  // Set a default best move value
  var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY
                                         : Number.POSITIVE_INFINITY;
  // Search through all possible moves
  for (var i = 0; i < possibleMoves.length; i++) {
    var move = possibleMoves[i];
    // Make the move, but undo before exiting loop
    game.move(move);
    // Recursively get the value of this move
    value = calcBestMoveNoAB(depth-1, game, playerColor, !isMaximizingPlayer)[0];
    // Log the value of this move
    console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', depth, move, value,
                bestMove, bestMoveValue);

    if (isMaximizingPlayer) {
      // Look for moves that maximize position
      if (value > bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
    } else {
      // Look for moves that minimize position
      if (value < bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
    }
    // Undo previous move
    game.undo();
  }
  // Log the best move at the current depth
  console.log('Depth: ' + depth + ' | Best Move: ' + bestMove + ' | ' + bestMoveValue);
  // Return the best move, or the only move
  return [bestMoveValue, bestMove || possibleMoves[0]];
}

/**
 * Calculates the best move using Minimax with Alpha Beta Pruning.
 * @param {Number} depth - How many moves ahead to evaluate
 * @param {Object} game - The game to evaluate
 * @param {string} playerColor - Players color, either 'b' or 'w'
 * @param {Number} alpha
 * @param {Number} beta
 * @param {Boolean} isMaximizingPlayer - If current turn is maximizing or minimizing player
 * @return {Array} The best move value, and the best move
 */
var calcBestMove = function(depth, game, playerColor,
                            alpha=Number.NEGATIVE_INFINITY,
                            beta=Number.POSITIVE_INFINITY,
                            isMaximizingPlayer=true) {
  // Base case: evaluate board
  if (depth === 0) {
    value = evaluateBoard(game.board(), playerColor);
    return [value, null]
  }

  // Recursive case: search possible moves
  var bestMove = null; // best move not set yet
  var possibleMoves = game.moves();
  // Set random order for possible moves
  possibleMoves.sort(function(a, b){return 0.5 - Math.random()});
  // Set a default best move value
  var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY
                                         : Number.POSITIVE_INFINITY;
  // Search through all possible moves
  for (var i = 0; i < possibleMoves.length; i++) {
    var move = possibleMoves[i];
    // Make the move, but undo before exiting loop
    game.move(move);
    // Recursively get the value from this move
    value = calcBestMove(depth-1, game, playerColor, alpha, beta, !isMaximizingPlayer)[0];
    // Log the value of this move
    console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', depth, move, value,
                bestMove, bestMoveValue);

    if (isMaximizingPlayer) {
      // Look for moves that maximize position
      if (value > bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
      alpha = Math.max(alpha, value);
    } else {
      // Look for moves that minimize position
      if (value < bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
      beta = Math.min(beta, value);
    }
    // Undo previous move
    game.undo();
    // Check for alpha beta pruning
    if (beta <= alpha) {
      //totalPrune += 1;
      //console.log('Prune', alpha, beta);
      break;
    }
  }
  // Log the best move at the current depth
  console.log('Depth: ' + depth + ' | Best Move: ' + bestMove + ' | ' + bestMoveValue + ' | A: ' + alpha + ' | B: ' + beta);
  // Return the best move, or the only move
  return [bestMoveValue, bestMove || possibleMoves[0]];
}


/**
* Orders the list of moves according to their board evaluation.
* @Param {array} moves is a list of the possible moves
* @param {game} the current game state
*/

var orderBestMoves = function(possibleMoves, game, playerColor) {
  value = [];
  i = 0;
  while (i < possibleMoves.length) {
    // move piece
    game.move(possibleMoves[i]);
    value.push(evaluateBoard(game.board(), playerColor));
    game.undo();
    i++;
  }

  // value has the values in the same index as they appear in moves. Need to
  // sort moves based on sorting value
  moves.sort(function(a,b) {
    return value.indexOf(a) = value.indexOf(b);
  });
  return moves;
}



/**
* This is an improved alpha-beta pruning algorithm. We order the moves to explored the most
* promising branches first, this implementation is based on one of the papers we reviewd.
* 
*/
var calcBestMoveImproved = function(depth, game, playerColor,
                            alpha=Number.NEGATIVE_INFINITY,
                            beta=Number.POSITIVE_INFINITY,
                            isMaximizingPlayer=true) {
  // Base case: evaluate board
  if (depth === 0) {
    value = evaluateBoard(game.board(), playerColor);
    return [value, null]
  }

  // Recursive case: search possible moves
  var bestMove = null; // best move not set yet
  var possibleMoves = game.moves();
  // Set random order for possible moves

  // improved alpha beta pruning. Order the moves to explore more 
  // need this to avoid doing the same moves over and over
  possibleMoves.sort(function(a, b){return 0.5 - Math.random()});

  // Order the best moves first 
  // should maximize alpha beta pruning
  value = [];
  i = 0;
  while (i < possibleMoves.length) {
    // move piece
    game.move(possibleMoves[i]);
    value.push(evaluateBoard(game.board(), playerColor));
    game.undo();
    i++;
  }

  // value has the values in the same index as they appear in moves. Need to
  // sort moves based on sorting value
  if (!isMaximizingPlayer) {
    possibleMoves.sort(function(a,b) {
      return value.indexOf(a) - value.indexOf(b);
    });
  } else {
    possibleMoves.sort(function(a,b) {
      return value.indexOf(b) - value.indexOf(a);
    });
  }

  // sorts from least to greatest, so when we are maximizing, want greatest values first.
  if (isMaximizingPlayer) {
    possibleMoves.reverse();
  }


  // Set a default best move value
  var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY
                                         : Number.POSITIVE_INFINITY;
  // Search through all possible moves
  for (var i = 0; i < possibleMoves.length; i++) {
    var move = possibleMoves[i];
    // Make the move, but undo before exiting loop
    game.move(move);
    // Recursively get the value from this move
    value = calcBestMoveImproved(depth-1, game, playerColor, alpha, beta, !isMaximizingPlayer)[0];
    // Log the value of this move
    console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', depth, move, value,
                bestMove, bestMoveValue);

    if (isMaximizingPlayer) {
      // Look for moves that maximize position
      if (value > bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
      alpha = Math.max(alpha, value);
    } else {
      // Look for moves that minimize position
      if (value < bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
      beta = Math.min(beta, value);
    }
    // Undo previous move
    game.undo();
    // Check for alpha beta pruning
    if (beta <= alpha) {
      console.log('Prune', alpha, beta);
      break;
    }
  }
  // Log the best move at the current depth
  console.log('Depth: ' + depth + ' | Best Move: ' + bestMove + ' | ' + bestMoveValue + ' | A: ' + alpha + ' | B: ' + beta);
  // Return the best move, or the only move
  return [bestMoveValue, bestMove || possibleMoves[0]];
}
