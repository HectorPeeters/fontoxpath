import { ParentNodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import validateContextNode from './validateContextNode';

class ChildAxis extends Expression {
	private _childExpression: TestAbstractExpression;
	constructor(childExpression: TestAbstractExpression) {
		super(childExpression.specificity, [childExpression], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: true,
			canBeStaticallyEvaluated: false,
		});

		this._childExpression = childExpression;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const domFacade = executionParameters.domFacade;
		const contextNode = validateContextNode(dynamicContext.contextItem);
		const nodeType = domFacade.getNodeType(contextNode);
		const nodeValues: Value[] = [];
		if (nodeType === NODE_TYPES.ELEMENT_NODE || nodeType === NODE_TYPES.DOCUMENT_NODE) {
			domFacade
				.getChildNodePointers(
					contextNode as ParentNodePointer,
					this._childExpression.getBucket()
				)
				.forEach((node) =>
					nodeValues.push(createPointerValue(node, executionParameters.domFacade))
				);
		}
		const childContextSequence = sequenceFactory.create(nodeValues);
		return childContextSequence.filter((item) => {
			return this._childExpression.evaluateToBoolean(
				dynamicContext,
				item,
				executionParameters
			);
		});
	}
}
export default ChildAxis;
