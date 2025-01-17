import { CommentNodePointer, TinyCommentNode } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

class CommentConstructor extends Expression {
	private _expr: Expression;
	constructor(expr: Expression | null) {
		super(expr ? expr.specificity : new Specificity({}), expr ? [expr] : [], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
		});

		this._expr = expr;
	}

	public evaluate(_dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const tinyCommentNode: TinyCommentNode = {
			data: '',
			isTinyNode: true,
			nodeType: NODE_TYPES.COMMENT_NODE,
		};
		const commentNodePointer: CommentNodePointer = {
			node: tinyCommentNode,
			graftAncestor: null,
		};
		if (!this._expr) {
			return sequenceFactory.singleton(
				createPointerValue(commentNodePointer, executionParameters.domFacade)
			);
		}
		const sequence = this._expr.evaluateMaybeStatically(_dynamicContext, executionParameters);
		return atomize(sequence, executionParameters).mapAll((items) => {
			const content = items
				.map((item) => castToType(item, ValueType.XSSTRING).value)
				.join(' ');

			if (content.indexOf('-->') !== -1) {
				throw new Error(
					'XQDY0072: The contents of the data of a comment may not include "-->"'
				);
			}

			tinyCommentNode.data = content;

			return sequenceFactory.singleton(
				createPointerValue(commentNodePointer, executionParameters.domFacade)
			);
		});
	}
}

export default CommentConstructor;
