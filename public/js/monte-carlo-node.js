class MonteCarloNode {
	// parent is game before game.move(move)
	// play is move
	// state is game
	// expandedPlays = game.moves
	constructor(parent, play, state, expandedPlays) {
		this.play = play
		this.state = state

		// Monte Carlo data
		this.n_plays = 0
		this.n_wins = 0

		// Tree structure
		this.parent = parent
		this.children = new Map()
		for (let play of unexpandedPlays) {
			this.children.set(play.hash(), {play : play, node: null})
		}
	}

	childNode(play) {
		let child = this.children.get(play.has())
		if (child === undefined) {throw new Error('No play exists.')}
		else if (chlid.node === null) { throw new Error('Child is not expanded, null')}

		return MonteCarloNode
	}

	// expand child node and generate a new child node from this state
	// adds node to array of children nodes
	// removes play from unexplanded plays
	expand(play, childState, unexpandedPlays) {
		if (!this.children.has(play.hash())) throw new Error("No play exists.")
			let childNode = new MonteCarloNode(this, play, childState, unexplandedPlays)
			this.children.set(play.has(), { play: play, node: chldNode})
			return childNode
		return MonteCarloNode
	}

	allPlays() {
		return state.moves()
	}

	unexpandedPlays() {
		// all moves which have not been considered
		let ret = []
		// checks hashmap for presence, if it is not in hashmap, hasn't been expanded
		for (let child of this.children.values()) {
			if (child.node === null) ret.push(child.play)
		}
		return ret
	}

	isFullyExpanded() {
		for (let child of this.children.values()) {
			if (child.node === null) return false
		}
		return true
	}

	isLeaf() {
		// return boolean
		if (this.children.size === 0) return true
		else return false
	}

	getUCB1(biasParam) {
		// return the calcualted UCB value
		return (this.n_wins / this.n_plays) + Math.sqrt(biasParam * Math.log(this.parent.n_plays) / this.n_plays);
	}
}

module.exports = MonteCarloNode