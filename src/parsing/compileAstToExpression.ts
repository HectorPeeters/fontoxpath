import CurlyArrayConstructor from '../expressions/arrays/CurlyArrayConstructor';
import SquareArrayConstructor from '../expressions/arrays/SquareArrayConstructor';
import AncestorAxis from '../expressions/axes/AncestorAxis';
import AttributeAxis from '../expressions/axes/AttributeAxis';
import ChildAxis from '../expressions/axes/ChildAxis';
import DescendantAxis from '../expressions/axes/DescendantAxis';
import FollowingAxis from '../expressions/axes/FollowingAxis';
import FollowingSiblingAxis from '../expressions/axes/FollowingSiblingAxis';
import ParentAxis from '../expressions/axes/ParentAxis';
import PrecedingAxis from '../expressions/axes/PrecedingAxis';
import PrecedingSiblingAxis from '../expressions/axes/PrecedingSiblingAxis';
import SelfAxis from '../expressions/axes/SelfAxis';
import IfExpression from '../expressions/conditional/IfExpression';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import QName from '../expressions/dataTypes/valueTypes/QName';
import StackTraceGenerator, { SourceRange } from '../expressions/debug/StackTraceGenerator';
import Expression, { RESULT_ORDERINGS } from '../expressions/Expression';
import FlworExpression from '../expressions/FlworExpression';
import ForExpression from '../expressions/ForExpression';
import FunctionCall from '../expressions/functions/FunctionCall';
import InlineFunction from '../expressions/functions/InlineFunction';
import LetExpression from '../expressions/LetExpression';
import Literal from '../expressions/literals/Literal';
import MapConstructor from '../expressions/maps/MapConstructor';
import NamedFunctionRef from '../expressions/NamedFunctionRef';
import BinaryOperator, {
	generateBinaryOperatorFunction,
} from '../expressions/operators/arithmetic/BinaryOperator';
import Unary from '../expressions/operators/arithmetic/Unary';
import AndOperator from '../expressions/operators/boolean/AndOperator';
import OrOperator from '../expressions/operators/boolean/OrOperator';
import Compare from '../expressions/operators/compares/Compare';
import IntersectExcept from '../expressions/operators/IntersectExcept';
import SequenceOperator from '../expressions/operators/SequenceOperator';
import SimpleMapOperator from '../expressions/operators/SimpleMapOperator';
import CastableAsOperator from '../expressions/operators/types/CastableAsOperator';
import CastAsOperator from '../expressions/operators/types/CastAsOperator';
import InstanceOfOperator from '../expressions/operators/types/InstanceOfOperator';
import Union from '../expressions/operators/Union';
import OrderByExpression from '../expressions/OrderByExpression';
import AbsolutePathExpression from '../expressions/path/AbsolutePathExpression';
import ContextItemExpression from '../expressions/path/ContextItemExpression';
import PathExpression from '../expressions/path/PathExpression';
import PossiblyUpdatingExpression from '../expressions/PossiblyUpdatingExpression';
import Filter from '../expressions/postfix/Filter';
import Lookup from '../expressions/postfix/Lookup';
import UnaryLookup from '../expressions/postfix/UnaryLookup';
import QuantifiedExpression from '../expressions/quantified/QuantifiedExpression';
import KindTest from '../expressions/tests/KindTest';
import NameTest from '../expressions/tests/NameTest';
import PITest from '../expressions/tests/PITest';
import TestAbstractExpression from '../expressions/tests/TestAbstractExpression';
import TypeTest from '../expressions/tests/TypeTest';
import VarRef from '../expressions/VarRef';
import WhereExpression from '../expressions/WhereExpression';
import DeleteExpression from '../expressions/xquery-update/DeleteExpression';
import InsertExpression, { TargetChoice } from '../expressions/xquery-update/InsertExpression';
import RenameExpression from '../expressions/xquery-update/RenameExpression';
import ReplaceExpression from '../expressions/xquery-update/ReplaceExpression';
import TransformExpression from '../expressions/xquery-update/TransformExpression';
import AttributeConstructor from '../expressions/xquery/AttributeConstructor';
import CommentConstructor from '../expressions/xquery/CommentConstructor';
import ElementConstructor from '../expressions/xquery/ElementConstructor';
import PIConstructor from '../expressions/xquery/PIConstructor';
import TextConstructor from '../expressions/xquery/TextConstructor';
import TypeSwitchExpression from '../expressions/xquery/TypeSwitchExpression';
import { BinaryEvaluationFunction } from '../typeInference/binaryEvaluationFunction';
import astHelper, { IAST } from './astHelper';
import { AstVisitor } from './astVisitor';

const COMPILATION_OPTIONS = {
	XPATH_MODE: { allowXQuery: false, allowUpdating: false },
	XQUERY_MODE: { allowXQuery: true, allowUpdating: false },
	XQUERY_UPDATING_MODE: { allowXQuery: true, allowUpdating: true },
};

function disallowUpdating(compilationOptions: CompilationOptions) {
	if (!compilationOptions.allowXQuery) {
		return COMPILATION_OPTIONS.XPATH_MODE;
	}
	if (!compilationOptions.allowUpdating) {
		return COMPILATION_OPTIONS.XQUERY_MODE;
	}
	return COMPILATION_OPTIONS.XQUERY_UPDATING_MODE;
}

type CompilationOptions = { allowUpdating?: boolean; allowXQuery?: boolean };

class CompileVisitor extends AstVisitor<Expression, CompilationOptions> {
	visitLogicalOp(ast: IAST, options: CompilationOptions): Expression {
		switch (ast[0]) {
			case 'andOp': {
				const typeNode = astHelper.followPath(ast, ['type']);
				return new AndOperator(
					this.unwrapBinaryOperator('andOp', ast, disallowUpdating(options)),
					typeNode ? (typeNode[1] as SequenceType) : undefined
				);
			}
			case 'orOp': {
				const typeNode = astHelper.followPath(ast, ['type']);
				return new OrOperator(
					this.unwrapBinaryOperator('orOp', ast, disallowUpdating(options)),
					typeNode ? (typeNode[1] as SequenceType) : undefined
				);
			}
		}
	}

	visitUnaryOp(ast: IAST, options: CompilationOptions): Expression {
		switch (ast[0]) {
			case 'unaryPlusOp': {
				const operand = astHelper.getFirstChild(
					astHelper.getFirstChild(ast, 'operand'),
					'*'
				);
				const typeNode = astHelper.followPath(ast, ['type']);
				return new Unary(
					'+',
					this.visit(operand, options),
					typeNode ? (typeNode[1] as SequenceType) : undefined
				);
			}
			case 'unaryMinusOp': {
				const operand = astHelper.getFirstChild(
					astHelper.getFirstChild(ast, 'operand'),
					'*'
				);
				const typeNode = astHelper.followPath(ast, ['type']);
				return new Unary(
					'-',
					this.visit(operand, options),
					typeNode ? (typeNode[1] as SequenceType) : undefined
				);
			}
		}
	}

	visitBinaryOp(ast: IAST, options: CompilationOptions): Expression {
		const kind = ast[0];
		const a = this.visit(
			astHelper.followPath(ast, ['firstOperand', '*']),
			disallowUpdating(options)
		);
		const b = this.visit(
			astHelper.followPath(ast, ['secondOperand', '*']),
			disallowUpdating(options)
		);

		const attributeType = astHelper.getAttribute(ast, 'type');
		const first = astHelper.getAttribute(
			astHelper.followPath(ast, ['firstOperand', '*']),
			'type'
		) as SequenceType;
		const second = astHelper.getAttribute(
			astHelper.followPath(ast, ['secondOperand', '*']),
			'type'
		) as SequenceType;
		let firstType;
		let secondType;
		let evaluateFunction;
		if (first && second) {
			firstType = first.type;
			secondType = second.type;
			evaluateFunction = generateBinaryOperatorFunction(kind, firstType, secondType);
		}

		return new BinaryOperator(
			kind,
			a,
			b,
			attributeType as SequenceType,
			evaluateFunction as BinaryEvaluationFunction
		);
	}

	visitSequenceExpr(ast: IAST, options: CompilationOptions): Expression {
		const childExpressions = astHelper
			.getChildren(ast, '*')
			.map((arg) => this.visit(arg, options));
		if (childExpressions.length === 1) {
			return childExpressions[0];
		}

		const typeNode = astHelper.followPath(ast, ['type']);
		return new SequenceOperator(
			astHelper.getChildren(ast, '*').map((arg) => this.visit(arg, options)),
			typeNode ? (typeNode[1] as SequenceType) : undefined
		);
	}

	visitUnionOp(ast: IAST, options: CompilationOptions): Expression {
		const typeNode = astHelper.followPath(ast, ['type']);
		return new Union(
			[
				this.visit(
					astHelper.followPath(ast, ['firstOperand', '*']),
					disallowUpdating(options)
				),
				this.visit(
					astHelper.followPath(ast, ['secondOperand', '*']),
					disallowUpdating(options)
				),
			],
			typeNode ? (typeNode[1] as SequenceType) : undefined
		);
	}

	visitIntersectExcept(ast: IAST, options: CompilationOptions): Expression {
		const typeNode = astHelper.followPath(ast, ['type']);
		return new IntersectExcept(
			ast[0],
			this.visit(astHelper.followPath(ast, ['firstOperand', '*']), disallowUpdating(options)),
			this.visit(
				astHelper.followPath(ast, ['secondOperand', '*']),
				disallowUpdating(options)
			),
			typeNode ? (typeNode[1] as SequenceType) : undefined
		);
	}

	visitStringConcatenateOp(ast: IAST, options: CompilationOptions): Expression {
		const typeNode = astHelper.followPath(ast, ['type']);
		const args = [
			astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST,
			astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
		];
		return new FunctionCall(
			new NamedFunctionRef(
				{
					localName: 'concat',
					namespaceURI: 'http://www.w3.org/2005/xpath-functions',
					prefix: '',
				},
				args.length
			),
			args.map((arg) => this.visit(arg, disallowUpdating(options))),
			typeNode ? (typeNode[1] as SequenceType) : undefined
		);
	}

	visitRangeSequenceExpr(ast: IAST, options: CompilationOptions): Expression {
		const typeNode = astHelper.followPath(ast, ['type']);
		const args = [
			astHelper.getFirstChild(ast, 'startExpr')[1] as IAST,
			astHelper.getFirstChild(ast, 'endExpr')[1] as IAST,
		];

		const ref = new NamedFunctionRef(
			{
				localName: 'to',
				namespaceURI: 'http://fontoxpath/operators',
				prefix: '',
			},
			args.length
		);

		return new FunctionCall(
			ref,
			args.map((arg) => this.visit(arg, disallowUpdating(options))),
			typeNode ? (typeNode[1] as SequenceType) : undefined
		);
	}

	visitCompare(ast: IAST, options: CompilationOptions): Expression {
		return new Compare(
			ast[0],
			this.visit(astHelper.followPath(ast, ['firstOperand', '*']), disallowUpdating(options)),
			this.visit(astHelper.followPath(ast, ['secondOperand', '*']), disallowUpdating(options))
		);
	}

	visitPathExpr(ast: IAST, options: CompilationOptions): Expression {
		const rawSteps = astHelper.getChildren(ast, 'stepExpr');
		let hasAxisStep = false;
		const steps = rawSteps.map((step) => {
			const axis = astHelper.getFirstChild(step, 'xpathAxis');

			let stepExpression: Expression;

			if (axis) {
				hasAxisStep = true;
				const test = astHelper.getFirstChild(step, [
					'attributeTest',
					'anyElementTest',
					'piTest',
					'documentTest',
					'elementTest',
					'commentTest',
					'namespaceTest',
					'anyKindTest',
					'textTest',
					'anyFunctionTest',
					'typedFunctionTest',
					'schemaAttributeTest',
					'atomicType',
					'anyItemType',
					'parenthesizedItemType',
					'typedMapTest',
					'typedArrayTest',
					'nameTest',
					'Wildcard',
				]);

				const testExpression = this.visit(
					test,
					disallowUpdating(options)
				) as TestAbstractExpression;
				switch (astHelper.getTextContent(axis)) {
					case 'ancestor':
						stepExpression = new AncestorAxis(testExpression, { inclusive: false });
						break;
					case 'ancestor-or-self':
						stepExpression = new AncestorAxis(testExpression, { inclusive: true });
						break;
					case 'attribute':
						stepExpression = new AttributeAxis(testExpression);
						break;
					case 'child':
						stepExpression = new ChildAxis(testExpression);
						break;
					case 'descendant':
						stepExpression = new DescendantAxis(testExpression, { inclusive: false });
						break;
					case 'descendant-or-self':
						stepExpression = new DescendantAxis(testExpression, { inclusive: true });
						break;
					case 'parent':
						stepExpression = new ParentAxis(testExpression);
						break;
					case 'following-sibling':
						stepExpression = new FollowingSiblingAxis(testExpression);
						break;
					case 'preceding-sibling':
						stepExpression = new PrecedingSiblingAxis(testExpression);
						break;
					case 'following':
						stepExpression = new FollowingAxis(testExpression);
						break;
					case 'preceding':
						stepExpression = new PrecedingAxis(testExpression);
						break;
					case 'self':
						stepExpression = new SelfAxis(testExpression);
						break;
				}
			} else {
				// We must be a filter expression
				const filterExpr = astHelper.followPath(step, ['filterExpr', '*']);
				stepExpression = this.visit(filterExpr, disallowUpdating(options));
			}

			const children = astHelper.getChildren(step, '*');

			for (const child of children) {
				switch (child[0]) {
					case 'lookup':
						stepExpression = new Lookup(
							stepExpression,
							this.visitLookup(child, options)
						);
						break;
					case 'predicate':
					case 'predicates':
						stepExpression = astHelper
							.getChildren(child, '*')
							.reduce(
								(innerStep, predicate) =>
									new Filter(
										innerStep,
										this.visit(predicate, disallowUpdating(options))
									),
								stepExpression
							);
						break;
				}
			}

			return stepExpression;
		});

		const isAbsolute = astHelper.getFirstChild(ast, 'rootExpr');
		// If an path has no axis steps, we should skip sorting. The path
		// is probably a chain of filter expressions or lookups
		const requireSorting = hasAxisStep || isAbsolute !== null || rawSteps.length > 1;

		// Directly use expressions which are not path expression
		if (!requireSorting && steps.length === 1) {
			return steps[0];
		}

		// We do not have to sort the result of steps expressions when
		// they already result to a ordered set
		if (
			!isAbsolute &&
			steps.length === 1 &&
			steps[0].expectedResultOrder === RESULT_ORDERINGS.SORTED
		) {
			return steps[0];
		}

		if (isAbsolute && steps.length === 0) {
			return new AbsolutePathExpression(null);
		}
		const pathExpression = new PathExpression(steps, requireSorting);
		if (isAbsolute) {
			return new AbsolutePathExpression(pathExpression);
		}
		return pathExpression;
	}

	visitContextItemExpr(ast: IAST, options: CompilationOptions): Expression {
		return new ContextItemExpression();
	}
	visitFunctionCall(ast: IAST, options: CompilationOptions): Expression {
		const functionName = astHelper.getFirstChild(ast, 'functionName');
		const functionArguments = astHelper.getChildren(
			astHelper.getFirstChild(ast, 'arguments'),
			'*'
		);

		const returnType = astHelper.followPath(ast, ['type']);

		return new FunctionCall(
			new NamedFunctionRef(astHelper.getQName(functionName), functionArguments.length),
			functionArguments.map((arg) =>
				arg[0] === 'argumentPlaceholder' ? null : this.visit(arg, options)
			),
			returnType ? (returnType[1] as SequenceType) : undefined
		);
	}

	visitInlineFunction(ast: IAST, options: CompilationOptions): Expression {
		const params = astHelper.getChildren(astHelper.getFirstChild(ast, 'paramList'), '*');
		const functionBody = astHelper.followPath(ast, ['functionBody', '*']);

		return new InlineFunction(
			params.map((param) => {
				const td: {
					name: QName;
					type: SequenceType;
				} = {
					name: astHelper.getQName(astHelper.getFirstChild(param, 'varName')),
					type: astHelper.getTypeDeclaration(param),
				};
				return td;
			}),
			astHelper.getTypeDeclaration(ast),
			functionBody
				? (this.visit(functionBody, options) as PossiblyUpdatingExpression)
				: new SequenceOperator([])
		);
	}

	visitArrowExpr(ast: IAST, options: CompilationOptions): Expression {
		const argExpr = astHelper.followPath(ast, ['argExpr', '*']);

		// Each part an EQName, expression, or arguments passed to the previous part
		const parts = astHelper.getChildren(ast, '*').slice(1);

		let args = [this.visit(argExpr, options)];
		for (let i = 0; i < parts.length; i++) {
			if (parts[i][0] === 'arguments') {
				continue;
			}
			if (parts[i + 1][0] === 'arguments') {
				const functionArguments = astHelper.getChildren(parts[i + 1], '*');
				args = args.concat(
					functionArguments.map((arg) =>
						arg[0] === 'argumentPlaceholder' ? null : this.visit(arg, options)
					)
				);
			}

			const func =
				parts[i][0] === 'EQName'
					? new NamedFunctionRef(astHelper.getQName(parts[i]), args.length)
					: this.visit(parts[i], disallowUpdating(options));
			args = [new FunctionCall(func, args)];
		}
		return args[0];
	}

	visitDynamicFunctionInvocationExpr(ast: IAST, options: CompilationOptions): Expression {
		const functionItemContent = astHelper.followPath(ast, ['functionItem', '*']);

		const argumentsAst = astHelper.getFirstChild(ast, 'arguments');
		let args = [];
		if (argumentsAst) {
			const functionArguments = astHelper.getChildren(argumentsAst, '*');
			args = functionArguments.map((arg) =>
				arg[0] === 'argumentPlaceholder' ? null : this.visit(arg, options)
			);
		}

		return new FunctionCall(this.visit(functionItemContent, options), args);
	}

	visitNamedFunctionRef(ast: IAST, options: CompilationOptions): Expression {
		const functionName = astHelper.getFirstChild(ast, 'functionName');
		const arity = astHelper.getTextContent(
			astHelper.followPath(ast, ['integerConstantExpr', 'value'])
		);
		return new NamedFunctionRef(astHelper.getQName(functionName), parseInt(arity, 10));
	}

	visitIntegerConstantExpr(ast: IAST, options: CompilationOptions): Expression {
		return new Literal(astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')), {
			type: ValueType.XSINTEGER,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
	}

	visitStringConstantExpr(ast: IAST, options: CompilationOptions): Expression {
		return new Literal(astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')), {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
	}

	visitDecimalConstantExpr(ast: IAST, options: CompilationOptions): Expression {
		return new Literal(astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')), {
			type: ValueType.XSDECIMAL,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
	}

	visitDoubleConstantExpr(ast: IAST, options: CompilationOptions): Expression {
		return new Literal(astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')), {
			type: ValueType.XSDOUBLE,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
	}

	visitVarRef(ast: IAST, options: CompilationOptions): Expression {
		const { prefix, namespaceURI, localName } = astHelper.getQName(
			astHelper.getFirstChild(ast, 'name')
		);
		return new VarRef(prefix, namespaceURI, localName);
	}

	visitFlworExpression(ast: IAST, options: CompilationOptions): Expression {
		const clausesAndReturnClause = astHelper.getChildren(ast, '*');
		const returnClauseExpression = astHelper.getFirstChild(
			clausesAndReturnClause[clausesAndReturnClause.length - 1],
			'*'
		);

		// Return intermediate and initial clauses handling
		const clauses = clausesAndReturnClause.slice(0, -1);

		// We have to check if there are any intermediate clauses before compiling them.
		if (clauses.length > 1) {
			if (!options.allowXQuery) {
				throw new Error('XPST0003: Use of XQuery FLWOR expressions in XPath is no allowed');
			}
		}

		return clauses.reduceRight(
			(
				returnOfPreviousExpression: PossiblyUpdatingExpression,
				flworExpressionClause: IAST
			) => {
				switch (flworExpressionClause[0]) {
					case 'forClause':
						return this.forClause(
							flworExpressionClause,
							options,
							returnOfPreviousExpression
						);
					case 'letClause':
						return this.letClause(
							flworExpressionClause,
							options,
							returnOfPreviousExpression
						);
					case 'whereClause':
						return this.whereClause(
							flworExpressionClause,
							options,
							returnOfPreviousExpression
						);
					case 'windowClause':
						throw new Error(
							`Not implemented: ${flworExpressionClause[0]} is not implemented yet.`
						);
					case 'groupByClause':
						throw new Error(
							`Not implemented: ${flworExpressionClause[0]} is not implemented yet.`
						);
					case 'orderByClause':
						return this.orderByClause(
							flworExpressionClause,
							options,
							returnOfPreviousExpression
						);
					case 'countClause':
						throw new Error(
							`Not implemented: ${flworExpressionClause[0]} is not implemented yet.`
						);
					default:
						throw new Error(
							`Not implemented: ${flworExpressionClause[0]} is not supported in a flwor expression`
						);
				}
			},
			this.visit(returnClauseExpression, options)
		);
	}

	visitQuantifiedExpr(ast: IAST, options: CompilationOptions): Expression {
		const quantifier = astHelper.getTextContent(astHelper.getFirstChild(ast, 'quantifier'));
		const predicateExpr = astHelper.followPath(ast, ['predicateExpr', '*']);
		const quantifierInClauses = astHelper
			.getChildren(ast, 'quantifiedExprInClause')
			.map((inClause) => {
				const name = astHelper.getQName(
					astHelper.followPath(inClause, ['typedVariableBinding', 'varName'])
				);
				const sourceExpr = astHelper.followPath(inClause, ['sourceExpr', '*']);

				return {
					name,
					sourceExpr: this.visit(sourceExpr, disallowUpdating(options)),
				};
			});

		return new QuantifiedExpression(
			quantifier,
			quantifierInClauses,
			this.visit(predicateExpr, disallowUpdating(options))
		);
	}

	visitIfThenElseExpr(ast: IAST, options: CompilationOptions): Expression {
		return new IfExpression(
			this.visit(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'ifClause'), '*'),
				disallowUpdating(options)
			),
			this.visit(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'thenClause'), '*'),
				options
			) as PossiblyUpdatingExpression,
			this.visit(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'elseClause'), '*'),
				options
			) as PossiblyUpdatingExpression
		);
	}

	visitInstanceOfExpr(ast: IAST, options: CompilationOptions): Expression {
		const expression = this.visit(astHelper.followPath(ast, ['argExpr', '*']), options);
		const sequenceType = astHelper.followPath(ast, ['sequenceType', '*']);
		const occurrence = astHelper.followPath(ast, ['sequenceType', 'occurrenceIndicator']);

		return new InstanceOfOperator(
			expression,
			this.visit(sequenceType, disallowUpdating(options)),
			occurrence ? astHelper.getTextContent(occurrence) : ''
		);
	}

	visitCastExpr(ast: IAST, options: CompilationOptions): Expression {
		const expression = this.visit(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'),
			disallowUpdating(options)
		);

		const singleType = astHelper.getFirstChild(ast, 'singleType');
		const targetType = astHelper.getQName(astHelper.getFirstChild(singleType, 'atomicType'));
		const optional = astHelper.getFirstChild(singleType, 'optional') !== null;

		return new CastAsOperator(expression, targetType, optional);
	}

	visitCastableExpr(ast: IAST, options: CompilationOptions): Expression {
		const expression = this.visit(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'),
			disallowUpdating(options)
		);

		const singleType = astHelper.getFirstChild(ast, 'singleType');
		const targetType = astHelper.getQName(astHelper.getFirstChild(singleType, 'atomicType'));
		const optional = astHelper.getFirstChild(singleType, 'optional') !== null;

		return new CastableAsOperator(expression, targetType, optional);
	}

	visitSimpleMapExpr(ast: IAST, options: CompilationOptions): Expression {
		return astHelper.getChildren(ast, '*').reduce((lhs: Expression, rhs: IAST) => {
			if (lhs === null) {
				return this.visit(rhs, disallowUpdating(options));
			}
			return new SimpleMapOperator(lhs, this.visit(rhs, disallowUpdating(options)));
		}, null);
	}

	visitMapConstructor(ast: IAST, options: CompilationOptions): Expression {
		return new MapConstructor(
			astHelper.getChildren(ast, 'mapConstructorEntry').map((keyValuePair) => ({
				key: this.visit(
					astHelper.followPath(keyValuePair, ['mapKeyExpr', '*']),
					disallowUpdating(options)
				),
				value: this.visit(
					astHelper.followPath(keyValuePair, ['mapValueExpr', '*']),
					disallowUpdating(options)
				),
			}))
		);
	}

	visitArrayConstructor(ast: IAST, options: CompilationOptions): Expression {
		const arrConstructor = astHelper.getFirstChild(ast, '*');
		const members = astHelper
			.getChildren(arrConstructor, 'arrayElem')
			.map((arrayElem) =>
				this.visit(astHelper.getFirstChild(arrayElem, '*'), disallowUpdating(options))
			);
		switch (arrConstructor[0]) {
			case 'curlyArray':
				return new CurlyArrayConstructor(members);
			case 'squareArray':
				return new SquareArrayConstructor(members);
			default:
				throw new Error('Unrecognized arrayType: ' + arrConstructor[0]);
		}
	}

	visitUnaryLookup(ast: IAST, options: CompilationOptions): Expression {
		return new UnaryLookup(this.visitLookup(ast, options));
	}

	visitTypeSwitchExpr(ast: IAST, options: CompilationOptions): Expression {
		if (!options.allowXQuery) {
			throw new Error(
				'XPST0003: Use of XQuery functionality is not allowed in XPath context'
			);
		}

		const argExpr = this.visit(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'),
			options
		);

		const caseClause = astHelper.getChildren(ast, 'typeswitchExprCaseClause');

		const caseClauseExpressions = caseClause.map((caseClauseExpression) => {
			let sequenceTypesAstNodes: IAST[];
			if (astHelper.getChildren(caseClauseExpression, 'sequenceTypeUnion').length === 0) {
				sequenceTypesAstNodes = [
					astHelper.getFirstChild(caseClauseExpression, 'sequenceType'),
				];
			} else {
				sequenceTypesAstNodes = astHelper.getChildren(
					astHelper.getFirstChild(caseClauseExpression, 'sequenceTypeUnion'),
					'sequenceType'
				);
			}

			const resultExpression = this.visit(
				astHelper.followPath(caseClauseExpression, ['resultExpr', '*']),
				options
			) as PossiblyUpdatingExpression;

			return {
				caseClauseExpression: resultExpression,
				typeTests: sequenceTypesAstNodes.map((sequenceTypeAstNode: IAST) => {
					const occurrenceIndicator = astHelper.getFirstChild(
						sequenceTypeAstNode,
						'occurrenceIndicator'
					);
					return {
						occurrenceIndicator: (occurrenceIndicator
							? astHelper.getTextContent(occurrenceIndicator)
							: '') as '*' | '?' | '+' | '',
						typeTest: this.visit(
							astHelper.getFirstChild(sequenceTypeAstNode, '*'),
							options
						),
					};
				}),
			};
		});

		const defaultExpression = this.visit(
			astHelper.followPath(ast, ['typeswitchExprDefaultClause', 'resultExpr', '*']),
			options
		) as PossiblyUpdatingExpression;

		return new TypeSwitchExpression(argExpr, caseClauseExpressions, defaultExpression);
	}

	visitElementConstructor(ast: IAST, options: CompilationOptions): Expression {
		if (!options.allowXQuery) {
			throw new Error(
				'XPST0003: Use of XQuery functionality is not allowed in XPath context'
			);
		}
		const name = astHelper.getQName(astHelper.getFirstChild(ast, 'tagName'));

		const attList = astHelper.getFirstChild(ast, 'attributeList');
		const attributes = attList
			? astHelper
					.getChildren(attList, 'attributeConstructor')
					.map((attr) => this.visit(attr, disallowUpdating(options)))
			: [];

		const namespaceDecls = attList
			? astHelper.getChildren(attList, 'namespaceDeclaration').map((namespaceDecl) => {
					const prefixElement = astHelper.getFirstChild(namespaceDecl, 'prefix');
					return {
						prefix: prefixElement ? astHelper.getTextContent(prefixElement) : '',
						uri: astHelper.getTextContent(
							astHelper.getFirstChild(namespaceDecl, 'uri')
						),
					};
			  })
			: [];

		const content = astHelper.getFirstChild(ast, 'elementContent');
		const contentExpressions = content
			? astHelper
					.getChildren(content, '*')
					.map((child) => this.visit(child, disallowUpdating(options)))
			: [];

		return new ElementConstructor(
			name,
			attributes as AttributeConstructor[],
			namespaceDecls,
			contentExpressions
		);
	}

	visitAttributeConstructor(ast: IAST, options: CompilationOptions): Expression {
		if (!options.allowXQuery) {
			throw new Error(
				'XPST0003: Use of XQuery functionality is not allowed in XPath context'
			);
		}
		const attrName = astHelper.getQName(astHelper.getFirstChild(ast, 'attributeName'));
		const attrValueElement = astHelper.getFirstChild(ast, 'attributeValue');
		const attrValue = attrValueElement ? astHelper.getTextContent(attrValueElement) : null;
		const attrValueExprElement = astHelper.getFirstChild(ast, 'attributeValueExpr');
		const attrValueExpressions = attrValueExprElement
			? astHelper
					.getChildren(attrValueExprElement, '*')
					.map((expr) => this.visit(expr, disallowUpdating(options)))
			: null;
		return new AttributeConstructor(attrName, {
			value: attrValue,
			valueExprParts: attrValueExpressions,
		});
	}

	visitComputedAttriobuteConstructor(ast: IAST, options: CompilationOptions): Expression {
		const tagName = astHelper.getFirstChild(ast, 'tagName');
		let name:
			| { expr: Expression }
			| { localName: string; namespaceURI: string; prefix: string };
		if (tagName) {
			name = astHelper.getQName(tagName);
		} else {
			const tagNameExpr = astHelper.getFirstChild(ast, 'tagNameExpr');
			name = {
				expr: this.visit(
					astHelper.getFirstChild(tagNameExpr, '*'),
					disallowUpdating(options)
				),
			};
		}

		const valueExpr = this.visit(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'valueExpr'), '*'),
			disallowUpdating(options)
		);

		return new AttributeConstructor(name, {
			valueExprParts: [valueExpr],
		});
	}

	visitComputedCommentConstructor(ast: IAST, options: CompilationOptions): Expression {
		if (!options.allowXQuery) {
			throw new Error(
				'XPST0003: Use of XQuery functionality is not allowed in XPath context'
			);
		}
		const argExpr = astHelper.getFirstChild(ast, 'argExpr');
		const expr = argExpr
			? this.visit(astHelper.getFirstChild(argExpr, '*'), disallowUpdating(options))
			: null;
		return new CommentConstructor(expr);
	}

	visitComputedTextConstructor(ast: IAST, options: CompilationOptions): Expression {
		if (!options.allowXQuery) {
			throw new Error(
				'XPST0003: Use of XQuery functionality is not allowed in XPath context'
			);
		}
		const argExpr = astHelper.getFirstChild(ast, 'argExpr');
		const expr = argExpr
			? this.visit(astHelper.getFirstChild(argExpr, '*'), disallowUpdating(options))
			: null;
		return new TextConstructor(expr);
	}

	visitComputedElementConstructor(ast: IAST, options: CompilationOptions): Expression {
		const tagName = astHelper.getFirstChild(ast, 'tagName');
		let name:
			| { expr: Expression }
			| { localName: string; namespaceURI: string; prefix: string };
		if (tagName) {
			name = astHelper.getQName(tagName);
		} else {
			const tagNameExpr = astHelper.getFirstChild(ast, 'tagNameExpr');
			name = {
				expr: this.visit(
					astHelper.getFirstChild(tagNameExpr, '*'),
					disallowUpdating(options)
				),
			};
		}

		const content = astHelper.getFirstChild(ast, 'contentExpr');
		const contentExpressions = content
			? astHelper
					.getChildren(content, '*')
					.map((child) => this.visit(child, disallowUpdating(options)))
			: [];

		return new ElementConstructor(name, [], [], contentExpressions);
	}

	visitComputedPIConstructor(ast: IAST, options: CompilationOptions): Expression {
		if (!options.allowXQuery) {
			throw new Error(
				'XPST0003: Use of XQuery functionality is not allowed in XPath context'
			);
		}

		const targetExpr = astHelper.getFirstChild(ast, 'piTargetExpr');
		const target = astHelper.getFirstChild(ast, 'piTarget');
		const piValueExpr = astHelper.getFirstChild(ast, 'piValueExpr');

		return new PIConstructor(
			{
				targetExpr: targetExpr
					? this.visit(
							astHelper.getFirstChild(targetExpr, '*'),
							disallowUpdating(options)
					  )
					: null,
				targetValue: target ? astHelper.getTextContent(target) : null,
			},
			piValueExpr
				? this.visit(astHelper.getFirstChild(piValueExpr, '*'), disallowUpdating(options))
				: new SequenceOperator([])
		);
	}

	visitCDataSection(ast: IAST, options: CompilationOptions): Expression {
		return new Literal(astHelper.getTextContent(ast), {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
	}

	visitDeleteExpr(ast: IAST, options: CompilationOptions): Expression {
		const targetExpr = this.visit(astHelper.followPath(ast, ['targetExpr', '*']), options);
		return new DeleteExpression(targetExpr);
	}

	visitInsertExpr(ast: IAST, options: CompilationOptions): Expression {
		const sourceExpr = this.visit(astHelper.followPath(ast, ['sourceExpr', '*']), options);
		let targetChoice: TargetChoice;
		const insertTargetChoice = astHelper.getChildren(ast, '*')[1];
		switch (insertTargetChoice[0]) {
			case 'insertAfter':
				targetChoice = TargetChoice.INSERT_AFTER;
				break;
			case 'insertBefore':
				targetChoice = TargetChoice.INSERT_BEFORE;
				break;
			case 'insertInto': {
				const insertAfterChoice = astHelper.getFirstChild(insertTargetChoice, '*');
				if (insertAfterChoice) {
					targetChoice =
						insertAfterChoice[0] === 'insertAsFirst'
							? TargetChoice.INSERT_INTO_AS_FIRST
							: TargetChoice.INSERT_INTO_AS_LAST;
				} else {
					targetChoice = TargetChoice.INSERT_INTO;
				}
				break;
			}
		}
		const targetExpr = this.visit(astHelper.followPath(ast, ['targetExpr', '*']), options);
		return new InsertExpression(sourceExpr, targetChoice, targetExpr);
	}

	visitRenameExpr(ast: IAST, options: CompilationOptions): Expression {
		const targetExpr = this.visit(astHelper.followPath(ast, ['targetExpr', '*']), options);
		const newNameExpr = this.visit(astHelper.followPath(ast, ['newNameExpr', '*']), options);
		return new RenameExpression(targetExpr, newNameExpr);
	}

	visitReplaceExpr(ast: IAST, options: CompilationOptions): Expression {
		const isReplaceValue = !!astHelper.getFirstChild(ast, 'replaceValue');
		const targetExpr = this.visit(astHelper.followPath(ast, ['targetExpr', '*']), options);
		const replacementExpr = this.visit(
			astHelper.followPath(ast, ['replacementExpr', '*']),
			options
		);
		return new ReplaceExpression(isReplaceValue, targetExpr, replacementExpr);
	}

	visitTransformExpr(ast: IAST, options: CompilationOptions): Expression {
		const transformCopies = astHelper
			.getChildren(astHelper.getFirstChild(ast, 'transformCopies'), 'transformCopy')
			.map((transformCopy) => {
				const varName = astHelper.getQName(
					astHelper.getFirstChild(
						astHelper.getFirstChild(transformCopy, 'varRef'),
						'name'
					)
				);
				const sourceExpr = this.visit(
					astHelper.getFirstChild(
						astHelper.getFirstChild(transformCopy, 'copySource'),
						'*'
					),
					options
				);
				return {
					sourceExpr,
					varRef: new QName(varName.prefix, varName.namespaceURI, varName.localName),
				};
			});
		const modifyExpr = this.visit(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'modifyExpr'), '*'),
			options
		);
		const returnExpr = this.visit(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'returnExpr'), '*'),
			options
		);
		return new TransformExpression(transformCopies, modifyExpr, returnExpr);
	}

	visitXStrackTrace(ast: IAST, options: CompilationOptions): Expression {
		const location = ast[1] as SourceRange;
		const innerExpression = ast[2] as IAST;

		let nextCompilableExpression: IAST = innerExpression;
		while (nextCompilableExpression[0] === 'x:stackTrace') {
			nextCompilableExpression = nextCompilableExpression[2] as IAST;
		}

		return new StackTraceGenerator(
			location,
			nextCompilableExpression[0],
			this.visit(nextCompilableExpression, options)
		);
	}

	visitNameTest(ast: IAST, options: CompilationOptions): Expression {
		return new NameTest(astHelper.getQName(ast));
	}

	visitPiTest(ast: IAST, options: CompilationOptions): Expression {
		const piTarget = astHelper.getFirstChild(ast, 'piTarget');
		if (piTarget) {
			return new PITest(astHelper.getTextContent(piTarget));
		}
		return new KindTest(7);
	}

	visitCommentTest(ast: IAST, options: CompilationOptions): Expression {
		return new KindTest(8);
	}

	visitTextTest(ast: IAST, options: CompilationOptions): Expression {
		return new KindTest(3);
	}

	visitDocumenTest(ast: IAST, options: CompilationOptions): Expression {
		return new KindTest(9);
	}

	visitAttributeTest(ast: IAST, options: CompilationOptions): Expression {
		const attributeName = astHelper.getFirstChild(ast, 'attributeName');
		const star = attributeName && astHelper.getFirstChild(attributeName, 'star');
		if (!attributeName || star) {
			return new KindTest(2);
		}
		return new NameTest(astHelper.getQName(astHelper.getFirstChild(attributeName, 'QName')), {
			kind: 2,
		});
	}

	visitElementTest(ast: IAST, options: CompilationOptions): Expression {
		const elementName = astHelper.getFirstChild(ast, 'elementName');
		const star = elementName && astHelper.getFirstChild(elementName, 'star');
		if (!elementName || star) {
			return new KindTest(1);
		}
		return new NameTest(astHelper.getQName(astHelper.getFirstChild(elementName, 'QName')), {
			kind: 1,
		});
	}

	visitAnyKindTest(ast: IAST, options: CompilationOptions): Expression {
		return new TypeTest({ prefix: '', namespaceURI: null, localName: 'node()' });
	}

	visitAnyMapTest(ast: IAST, options: CompilationOptions): Expression {
		return new TypeTest({ prefix: '', namespaceURI: null, localName: 'map(*)' });
	}

	visitAnyArrayTest(ast: IAST, options: CompilationOptions): Expression {
		return new TypeTest({ prefix: '', namespaceURI: null, localName: 'array(*)' });
	}

	visitWildcard(ast: IAST, options: CompilationOptions): Expression {
		if (!astHelper.getFirstChild(ast, 'star')) {
			return new NameTest({
				localName: '*',
				namespaceURI: null,
				prefix: '*',
			});
		}
		const uri = astHelper.getFirstChild(ast, 'uri');
		if (uri) {
			return new NameTest({
				localName: '*',
				namespaceURI: astHelper.getTextContent(uri),
				prefix: '',
			});
		}

		// Either the prefix or the localName are 'starred', find out which one
		const ncName = astHelper.getFirstChild(ast, 'NCName');
		if (astHelper.getFirstChild(ast, '*')[0] === 'star') {
			// The prefix is 'starred'
			return new NameTest({
				localName: astHelper.getTextContent(ncName),
				namespaceURI: null,
				prefix: '*',
			});
		}

		// The localName is 'starred'
		return new NameTest({
			localName: '*',
			namespaceURI: null,
			prefix: astHelper.getTextContent(ncName),
		});
	}

	visitAtomicType(ast: IAST, options: CompilationOptions): Expression {
		const type = astHelper.getQName(ast);
		return new TypeTest(type);
	}

	visitAnyItemType(ast: IAST, options: CompilationOptions): Expression {
		return new TypeTest({ prefix: '', namespaceURI: null, localName: 'item()' });
	}

	visitLookup(ast: IAST, options: CompilationOptions): '*' | Expression {
		const keyExpression = astHelper.getFirstChild(ast, '*');
		switch (keyExpression[0]) {
			case 'NCName':
				return new Literal(astHelper.getTextContent(keyExpression), {
					type: ValueType.XSSTRING,
					mult: SequenceMultiplicity.EXACTLY_ONE,
				});
			case 'star':
				return '*';
			default:
				return this.visit(keyExpression, disallowUpdating(options));
		}
	}

	unwrapBinaryOperatorInner(
		ast: IAST,
		operatorName: string,
		compiledAstNodes: Expression[],
		options: CompilationOptions
	) {
		const firstOperand = astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST;
		const secondOperand = astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST;

		if (firstOperand[0] === operatorName) {
			this.unwrapBinaryOperatorInner(firstOperand, operatorName, compiledAstNodes, options);
		} else {
			compiledAstNodes.push(this.visit(firstOperand as IAST, options));
		}
		if (secondOperand[0] === operatorName) {
			this.unwrapBinaryOperatorInner(secondOperand, operatorName, compiledAstNodes, options);
		} else {
			compiledAstNodes.push(this.visit(secondOperand as IAST, options));
		}
	}

	unwrapBinaryOperator(
		operatorName: string,
		ast: IAST,
		options: CompilationOptions
	): Expression[] {
		const compiledAstNodes = [];
		this.unwrapBinaryOperatorInner(ast, operatorName, compiledAstNodes, options);
		return compiledAstNodes;
	}

	forClause(
		expressionClause: IAST,
		options: CompilationOptions,
		returnClauseExpression: PossiblyUpdatingExpression | FlworExpression
	): ForExpression {
		const forClauseItems = astHelper.getChildren(expressionClause, '*');
		let returnExpr = returnClauseExpression;

		for (let i = forClauseItems.length - 1; i >= 0; --i) {
			const forClauseItem = forClauseItems[i];
			const expression = astHelper.followPath(forClauseItem, ['forExpr', '*']);
			const positionalVariableBinding = astHelper.getFirstChild(
				forClauseItem,
				'positionalVariableBinding'
			);

			returnExpr = new ForExpression(
				astHelper.getQName(
					astHelper.followPath(forClauseItem, ['typedVariableBinding', 'varName'])
				),
				this.visit(expression, disallowUpdating(options)),
				positionalVariableBinding ? astHelper.getQName(positionalVariableBinding) : null,
				returnExpr
			);
		}

		return returnExpr as ForExpression;
	}

	letClause(
		expressionClause: IAST,
		options: CompilationOptions,
		returnClauseExpression: PossiblyUpdatingExpression | FlworExpression
	): LetExpression {
		const letClauseItems = astHelper.getChildren(expressionClause, '*');
		let returnExpr = returnClauseExpression;

		for (let i = letClauseItems.length - 1; i >= 0; --i) {
			const letClauseItem = letClauseItems[i];
			const expression = astHelper.followPath(letClauseItem, ['letExpr', '*']);
			returnExpr = new LetExpression(
				astHelper.getQName(
					astHelper.followPath(letClauseItem, ['typedVariableBinding', 'varName'])
				),
				this.visit(expression, disallowUpdating(options)),
				returnExpr
			);
		}

		return returnExpr as LetExpression;
	}

	whereClause(
		expressionClause: IAST,
		options: CompilationOptions,
		returnClauseExpression: PossiblyUpdatingExpression | FlworExpression
	): WhereExpression {
		const whereClauseItems = astHelper.getChildren(expressionClause, '*');
		let returnExpr = returnClauseExpression;

		for (let i = whereClauseItems.length - 1; i >= 0; --i) {
			const whereClauseItem = whereClauseItems[i];
			returnExpr = new WhereExpression(this.visit(whereClauseItem, options), returnExpr);
		}

		return returnExpr as WhereExpression;
	}

	orderByClause(
		expressionClause: IAST,
		options: CompilationOptions,
		returnClauseExpression: PossiblyUpdatingExpression
	): OrderByExpression {
		const orderBySpecs = astHelper.getChildren(expressionClause, '*');
		return new OrderByExpression(
			orderBySpecs
				.filter((spec) => spec[0] !== 'stable')
				.map((spec) => {
					const orderModifier = astHelper.getFirstChild(spec, 'orderModifier');
					const kind = orderModifier
						? astHelper.getFirstChild(orderModifier, 'orderingKind')
						: null;
					const mode = orderModifier
						? astHelper.getFirstChild(orderModifier, 'emptyOrderingMode')
						: null;

					const isAscending = kind
						? astHelper.getTextContent(kind) === 'ascending'
						: true;
					const isEmptyLeast = mode
						? astHelper.getTextContent(mode) === 'empty least'
						: true;

					return {
						expression: this.visit(
							astHelper.followPath(spec, ['orderByExpr', '*']),
							options
						),
						isAscending,
						isEmptyLeast,
					};
				}),
			returnClauseExpression
		);
	}
}

export default function (xPathAst: IAST, compilationOptions: CompilationOptions): Expression {
	return new CompileVisitor().visit(xPathAst, compilationOptions);
}
