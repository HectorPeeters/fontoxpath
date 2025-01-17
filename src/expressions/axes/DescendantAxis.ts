import { ChildNodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import createPointerValue from '../dataTypes/createPointerValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import createChildGenerator from '../util/createChildGenerator';
import createSingleValueIterator from '../util/createSingleValueIterator';
import { DONE_TOKEN, IIterator, IterationHint, ready } from '../util/iterators';
import validateContextNode from './validateContextNode';

function createInclusiveDescendantGenerator(
	domFacade: DomFacade,
	node: ChildNodePointer,
	bucket: string | null
): IIterator<Value> {
	const descendantIteratorStack: IIterator<ChildNodePointer>[] = [
		createSingleValueIterator(node),
	];
	return {
		next: (hint: IterationHint) => {
			if (
				descendantIteratorStack.length > 0 &&
				(hint & IterationHint.SKIP_DESCENDANTS) !== 0
			) {
				// The next iterator on the stack will iterate over the last value's children, skip
				// it to skip the entire subtree
				descendantIteratorStack.shift();
			}
			if (!descendantIteratorStack.length) {
				return DONE_TOKEN;
			}
			let value = descendantIteratorStack[0].next(IterationHint.NONE);
			while (value.done) {
				descendantIteratorStack.shift();
				if (!descendantIteratorStack.length) {
					return DONE_TOKEN;
				}
				value = descendantIteratorStack[0].next(IterationHint.NONE);
			}
			// Iterator over these children next
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value, bucket));
			return ready(createPointerValue(value.value, domFacade));
		},
	};
}

class DescendantAxis extends Expression {
	private _descendantBucket: string;
	private _descendantExpression: TestAbstractExpression;
	private _isInclusive: boolean;

	constructor(
		descendantExpression: TestAbstractExpression,
		options: { inclusive: boolean } | undefined
	) {
		options = options || { inclusive: false };
		super(descendantExpression.specificity, [descendantExpression], {
			canBeStaticallyEvaluated: false,
			peer: false,
			resultOrder: RESULT_ORDERINGS.SORTED,
			subtree: true,
		});

		this._descendantExpression = descendantExpression;
		this._isInclusive = !!options.inclusive;

		// Only elements and document nodes can contain other elements. Document nodes can never be
		// contained in any other node.  Knowing this, if we are looking for an element, we can
		// safely ignore everything that is not an element (comments, textnodes and processing
		// instructions). Specifying this allows an external system to minimize the dependencies of
		// an expression with the form 'descendant:ele' to only be invalidated by element
		// insertions/deletions, not by textnode insertions/deletions.
		const testBucket = this._descendantExpression.getBucket();
		const onlyElementDescendants =
			testBucket && (testBucket.startsWith('name-') || testBucket === 'type-1');
		this._descendantBucket = onlyElementDescendants ? 'type-1' : null;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		const domFacade = executionParameters.domFacade;
		const contextPointer = validateContextNode(dynamicContext.contextItem);

		const inclusive = this._isInclusive;

		const iterator = createInclusiveDescendantGenerator(
			domFacade,
			contextPointer as ChildNodePointer,
			this._descendantBucket
		);
		if (!inclusive) {
			iterator.next(IterationHint.NONE);
		}
		const descendantSequence = sequenceFactory.create(iterator);
		return descendantSequence.filter((item) => {
			return this._descendantExpression.evaluateToBoolean(
				dynamicContext,
				item,
				executionParameters
			);
		});
	}
}
export default DescendantAxis;
