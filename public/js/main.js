var averageMoveTimeW = 0;
var averageMoveTimeB = 0;
var totalMovesW = 0;
var totalMovesB = 0;
var beg = performance.now();
var TotalPrune = 0;

// Computer makes a move with algorithm choice and skill/depth level
var makeMove = function(algo, skill=3) {
  // exit if the game is over
  if (game.game_over() === true) {
    console.log('game over');
    return;
  }
  console.log("========================================== alg and skill: " + algo + skill);
  // start algorithm timing
  var t0 = performance.now();

  // Calculate the best move, using chosen algorithm
  if (algo === 1) {
    console.log("making random move ============================================================ " + game.turn());
    var move = randomMove();
  } else if (algo === 2) {
    console.log("making single best move ============================================================ " + game.turn());
    var move = calcBestMoveOne(game.turn());
  } else if (algo === 3) {
    //console.log("making mini best move ============================================================ " +skill +" " + game.turn());
    var move = calcBestMoveNoAB(skill, game, game.turn())[1];
  } else if (algo === 4) {
    var move = calcBestMoveImproved(skill, game, game.turn())[1];
  } else {
    var move = calcBestMove(skill, game, game.turn())[1];
  }

  // end algorithm timing
  var t1 = performance.now();
  if (game.turn() === 'b') {
    totalMovesB += 1;
    averageMoveTimeB += (t1 - t0);
  } else {
    totalMovesW += 1;
    averageMoveTimeW += (t1 - t0);
  }
  // console log the time it took to make move
  //console.log("The time it took to make move: " + (t1 - t0) + " millisecs");

  // Make the calculated move
  game.move(move);
  // Update board positions
  board.position(game.fen());
}

// Computer vs Computer
var playGame = function(algo=3, skillW=2, skillB=2) {
  if (game.game_over() === true) {
    var end = performance.now();
    console.log('game over');
    console.log("average time for Black to make a move: " + (averageMoveTimeB / totalMovesB));
    console.log("average time for White to make a move: " + (averageMoveTimeW / totalMovesW));
    console.log("total game length: " + (end - beg));
    console.log("total Prunes: " + TotalPrune);
    return;
  }
  //console.log("========================================== alg and skill: " + algo + " "+skill+ " " + game.turn());
  var skill = game.turn() === 'w' ? skillW : skillB;
  makeMove(algo, skill);
  window.setTimeout(function() {
    playGame(algo, skillW, skillB);
  }, 250);
};

// Handles what to do after human makes move.
// Computer automatically makes next move
var onDrop = function(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // If illegal move, snapback
  if (move === null) return 'snapback';

  // Log the move
  console.log(move)

  // make move for black 
  // change this param to change black's difficulty
  window.setTimeout(function() {
    makeMove(3, 2);
  }, 250);
};
