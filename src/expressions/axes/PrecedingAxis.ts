import Expression, { RESULT_ORDERINGS } from '../Expression';

import createNodeValue from '../dataTypes/createNodeValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN, IterationHint, ready } from '../util/iterators';

import TestAbstractExpression from '../tests/TestAbstractExpression';
import createDescendantGenerator from '../util/createDescendantGenerator';

function createPrecedingGenerator(domFacade, node) {
	const nodeStack = [];

	for (; node; node = domFacade.getParentNode(node)) {
		const previousSibling = domFacade.getPreviousSibling(node);
		if (previousSibling === null) {
			continue;
		}
		nodeStack.push(previousSibling);
	}

	let nephewGenerator = null;
	return {
		next: () => {
			while (nephewGenerator || nodeStack.length) {
				if (!nephewGenerator) {
					nephewGenerator = createDescendantGenerator(domFacade, nodeStack[0], true);
				}

				const nephew = nephewGenerator.next(IterationHint.NONE);

				if (nephew.done) {
					// We are done with the descendants of the node currently on the stack
					nephewGenerator = null;

					// Set the focus to the concurrent sibling of this node
					const nextNode = domFacade.getPreviousSibling(nodeStack[0]);
					const toReturn = ready(createNodeValue(nodeStack[0]));
					if (nextNode === null) {
						// This is the last sibling, we can continue with a child of the current
						// node (an uncle of the original node) in the next iteration
						nodeStack.shift();
					} else {
						nodeStack[0] = nextNode;
					}

					return toReturn;
				}

				return nephew;
			}

			return DONE_TOKEN;
		}
	};
}

class PrecedingAxis extends Expression {
	private _testExpression: TestAbstractExpression;
	constructor(testExpression: TestAbstractExpression) {
		super(testExpression.specificity, [testExpression], {
			canBeStaticallyEvaluated: false,
			peer: true,
			resultOrder: RESULT_ORDERINGS.REVERSE_SORTED,
			subtree: false
		});

		this._testExpression = testExpression;
	}

	public evaluate(dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		return sequenceFactory
			.create(createPrecedingGenerator(domFacade, contextItem.value))
			.filter(item => {
				return this._testExpression.evaluateToBoolean(dynamicContext, item);
			});
	}
}

export default PrecedingAxis;
