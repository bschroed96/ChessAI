class MonteCarloNode {
	// play is previous play
	constructor(parent, play, state, unexpandedPlays) {
		this.play = play;
		this.state = state;

		// Monte Carlo stuff
		this.n_plays = 0;
		this.n_wins = 0;

		// Tree stuff
		this.parent = parent;
		this.children = new Map();
		for (let play of unexpandedPlays) {
			this.children.set((play.history().toString()), { play: play, node: null})
		}
	}

	/**
	 * get a node corresponding to the hashed play.
	 * @param play - the sequence of moves leading to child node.
	 * @returns {MonteCarloNode} child node of corresponding play from hash.
	 */
	childNode(play) {
		let child = this.children.get(play.history().toString());
		if (child === undefined) {
			throw new Error("no such play");
		} else if (child.node === null) {
			throw new Error("child is not expanded");
		}
		return child.node;
	}

	/**
	 * Expand child play and return the new child node.
	 * @param play
	 * @param childState
	 * @param unexpandedPlays
	 * @returns {MonteCarloNode}
	 */
	expand(play, childState, unexpandedPlays) {
		if (!this.children.has(play.history().toString())) throw new Error("No such play");
		let childNode = new MonteCarloNode(this, play, childState, unexpandedPlays);
		this.children.set(play.history().toString(), { play: play, node: childNode });
		return childNode;
	}

	/**
	 * Get all plays from this node.
	 */
	allPlays() {
		let ret = [];
		for (let child of this.children.values()) {
			ret.push(child.play)
		}
		return ret;
	}

	/**
	 * Get unexpanded plays from node.
	 */
	unexpandedPlays() {
		let ret = [];
		for (let child of this.children.values()) {
			if (child.node === null) ret.push(child.play);
		}

		return ret;
	}

	/**
	 * Check if node is fully expanded.
	 */
	isFullyExpanded() {
		for (let child of this.children.values()) {
			if (child.node === null) return false;
		}
		return true;
	}

	/**
	 * check if node is terminal in game tree, not end of game.
	 */
	isLeaf() {
		return this.children.size === 0;
	}

	getUCB() {
		return (this.n_wins / this.n_plays) + Math.sqrt(Math.log(this.parent.n_plays) / this.n_plays);
	}

}