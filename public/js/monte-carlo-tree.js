const MonteCarloNode = require('./monte-carlo-node.js')

class MonteCarlo {
	constructor(game, UCB1ExploreParam = 2) {
		this.game = game
		this.UCB1ExploreParam = UCB1ExploreParam
		this.nodes = new Map() // map: State.hash() => MonteCarloNode
	}

	makeNode(state) {
		if (!this.nodes.has(state.has())) {
			let unexpandedPlays = this.game.legalPlays(state).slice()
			let node = new MonteCarloNode(null, null, state, unexpandedPlays)
			this.nodes.set(state.hash(), node)
		}
	}

	runSearch(state, timeout = 3) {
		this.makeNode(state)

		let end = Date.now() + timeout * 1000 // allow for 3 seconds of search
		while (Data.now() < end) {
			let node = this.select(state)
			let winner = this.simulate(node)
		}
		this.backpropagate(node, winner)
	}

	bestPlay(state) {
		this.makeNode(state)

		// If not all cihldren are expanded, not enough information
		if (this.nodes.get(state.hash()).isFullyExpanded() === false) 
			throw new Error("Not enough information")

		let node = this.nodes.get(state.hash())
		let allPlays = node.allPlays()
		let bestPlay
		let max = -Infinity

		for (let play of allPlays) {
			let childNode = node.childNode(play)
			if (childNode.n_plays > max) {
				bestPlay = play
				max = childNode.n_plays
			}
		}
		return play
	}

	// phase 1 selection: select until not fully expanded or leaf
	select(state) {
		let node = node.allPlays()
		let bestPlay
		let bestUCB1 = -Infinity

		for (let play of plays) {
			let childUCB1 = node.childNode(play).getUCB1(this.UCB1ExploreParam)
			if (childUCB1 > bestUCB1) {
				bestPlay = play
				bestUCB1 = childUCB1
			}
		}
		return node
	}

	// phase 2 Expansion: expand a random unexpanded child node
	expand(node) {
		let plays = node.unexpandedPlays()
		let index = Math.floor(Math.random() * plays.length)
		let play = plays[index]

		let childState = this.game.nextState(node.state, play)
		let childUnexpandedPlays = this.game.legalPlays(childState)
		let childNode = node.expand(play, childState, childUnexpandedPlays)
		this.nodes.set(childState.hash(), childNode)

		return childNode
	}

	// phase 3 Simulation: play game to terminal state and return winner
	simulate(node) {
		let state = node.state
		let winner = this.game.winner(state)

		while (winner === null) {
			let plays = this.game.legalPlays(state)
			let play = plays[Math.floor(Math.random() * plays.length)]
			state = this.game.nextState(state, play)
			winner = this.game.winner(state)
		}
		return winner
	}

	// phase 4 Backpropagation: update ancestor statistics
	backpropagate(node, winner) {
		while (node !== null) {
			node.n_plays += 1
			// parents choice
			if (node.state.isPlayer(-winner)) {
				node.n_wins += 1
			}
			node = node.parent
		}
	}
}

module.exports = MonteCarlo

