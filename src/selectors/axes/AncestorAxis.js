import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import { DONE_TOKEN, ready } from '../util/iterators';
import TestAbstractExpression from '../tests/TestAbstractExpression';

function generateAncestors (domFacade, contextNode) {
	let ancestor = contextNode;
	return {
		next: () => {
			if (!ancestor) {
				return DONE_TOKEN;
			}
			const previousAncestor = ancestor;
			ancestor = previousAncestor && domFacade.getParentNode(previousAncestor);

			return ready(createNodeValue(previousAncestor));
		}
	};
}

/**
 * @extends {Selector}
 */
class AncestorAxis extends Selector {
	/**
	 * @param  {!TestAbstractExpression}  ancestorSelector
	 * @param  {{inclusive:boolean}=}    options
	 */
	constructor (ancestorSelector, options) {
		options = options || { inclusive: false };
		super(
			ancestorSelector.specificity,
			[ancestorSelector],
			{
				resultOrder: Selector.RESULT_ORDERINGS.REVERSE_SORTED,
				peer: false,
				subtree: false,
				canBeStaticallyEvaluated: false
			});

		this._ancestorSelector = ancestorSelector;
		this._isInclusive = !!options.inclusive;
	}

	evaluate (dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		const contextNode = contextItem.value;
		return new Sequence(generateAncestors(domFacade, this._isInclusive ? contextNode : domFacade.getParentNode(contextNode)))
			.filter(item => {
				return this._ancestorSelector.evaluateToBoolean(dynamicContext, item);
			});
	}
}

export default AncestorAxis;
