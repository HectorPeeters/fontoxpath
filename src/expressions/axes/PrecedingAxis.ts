import { ChildNodePointer, NodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import createPointerValue from '../dataTypes/createPointerValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import createDescendantGenerator from '../util/createDescendantGenerator';
import { DONE_TOKEN, IIterator, IterationHint, ready } from '../util/iterators';
import validateContextNode from './validateContextNode';

function createPrecedingGenerator(
	domFacade: DomFacade,
	node: ChildNodePointer,
	bucket: string | null
) {
	const nodeStack: NodePointer[] = [];

	for (
		let ancestorNode = node;
		ancestorNode && domFacade.getNodeType(ancestorNode) !== NODE_TYPES.DOCUMENT_NODE;
		// Any parent can contain the node we want. documents AND elements
		ancestorNode = domFacade.getParentNodePointer(ancestorNode, null) as ChildNodePointer
	) {
		const previousSibling = domFacade.getPreviousSiblingPointer(ancestorNode, bucket);
		if (previousSibling === null) {
			continue;
		}
		nodeStack.push(previousSibling);
	}

	let nephewGenerator: IIterator<Value> = null;
	return {
		next: () => {
			while (nephewGenerator || nodeStack.length) {
				if (!nephewGenerator) {
					nephewGenerator = createDescendantGenerator(
						domFacade,
						nodeStack[0],
						true,
						bucket
					);
				}

				const nephew = nephewGenerator.next(IterationHint.NONE);

				if (nephew.done) {
					// We are done with the descendants of the node currently on the stack
					nephewGenerator = null;

					// Set the focus to the concurrent sibling of this node
					const nextNode = domFacade.getPreviousSiblingPointer(
						nodeStack[0] as ChildNodePointer,
						bucket
					);
					const toReturn = ready(createPointerValue(nodeStack[0], domFacade));
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
		},
	};
}

class PrecedingAxis extends Expression {
	private _bucket: string;
	private _testExpression: TestAbstractExpression;

	constructor(testExpression: TestAbstractExpression) {
		super(testExpression.specificity, [testExpression], {
			canBeStaticallyEvaluated: false,
			peer: true,
			resultOrder: RESULT_ORDERINGS.REVERSE_SORTED,
			subtree: false,
		});

		this._testExpression = testExpression;
		const testBucket = this._testExpression.getBucket();
		const onlyElementDescendants =
			testBucket && (testBucket.startsWith('name-') || testBucket === 'type-1');
		this._bucket = onlyElementDescendants ? 'type-1' : null;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		const domFacade = executionParameters.domFacade;
		const contextPointer = validateContextNode(dynamicContext.contextItem);

		return sequenceFactory
			.create(
				createPrecedingGenerator(
					domFacade,
					contextPointer as ChildNodePointer,
					this._bucket
				)
			)
			.filter((item) => {
				return this._testExpression.evaluateToBoolean(
					dynamicContext,
					item,
					executionParameters
				);
			});
	}
}

export default PrecedingAxis;
