class MonteCarloTree {
	constructor(game) {
		this.game = game;
		this.nodes = new Map();
	}

	/** If given state DNE, create dangling node*/
	makeNode(state) {
		if (!this.nodes.has(state.history().toString())) {
			let unexpandedPlays = this.game.legalPlays(state).slice();
		}
	}

	runSearch(state, timeout) {

	}

	bestPlay(state) {
		
	}
}