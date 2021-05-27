import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';
import { AstVisitor } from '../parsing/astVisitor';
import { annotateBinOp } from './annotateBinaryOperator';
import { annotateCastableOperator, annotateCastOperator } from './annotateCastOperators';
import {
	annotateGeneralCompare,
	annotateNodeCompare,
	annotateValueCompare,
} from './annotateCompareOperator';
import { annotateFunctionCall } from './annotateFunctionCall';
import { annotateLogicalOperator } from './annotateLogicalOperator';
import { annotateRangeSequenceOperator } from './annotateRangeSequenceOperator';
import { annotateSequenceOperator } from './annotateSequenceOperator';
import { annotateSetOperator } from './annotateSetOperators';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';

/* tslint:disable:member-ordering */
class AnnotationVisitor extends AstVisitor<SequenceType, StaticContext> {
	constructor() {
		super(true);
	}

	visitLogicalOp(ast: IAST, options: StaticContext): SequenceType {
		this.visit(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, options);
		this.visit(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, options);
		return annotateLogicalOperator(ast);
	}

	visitUnaryPlusOp(ast: IAST, options: StaticContext): SequenceType {
		const minVal = this.visit(astHelper.getFirstChild(ast, 'operand')[1] as IAST, options);
		return annotateUnaryMinus(ast, minVal);
	}

	visitUnaryMinusOp(ast: IAST, options: StaticContext): SequenceType {
		const plusVal = this.visit(astHelper.getFirstChild(ast, 'operand')[1] as IAST, options);
		return annotateUnaryPlus(ast, plusVal);
	}

	visitBinaryOp(ast: IAST, options: StaticContext): SequenceType {
		const left = this.visit(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, options);
		const right = this.visit(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, options);
		return annotateBinOp(ast, left, right, ast[0]);
	}

	visitSequenceExpr(ast: IAST, options: StaticContext): SequenceType {
		const children = astHelper.getChildren(ast, '*');
		children.map((arg) => this.visit(arg, options));
		return annotateSequenceOperator(ast, children.length);
	}

	visitUnionOp(ast: IAST, options: StaticContext): SequenceType {
		const l = this.visit(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, options);
		const r = this.visit(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, options);
		return annotateSetOperator(ast, l, r);
	}

	visitIntersectExcept(ast: IAST, options: StaticContext): SequenceType {
		const l = this.visit(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, options);
		const r = this.visit(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, options);
		return annotateSetOperator(ast, l, r);
	}

	visitStringConcatenateOp(ast: IAST, options: StaticContext): SequenceType {
		const stringSequenceType = {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', stringSequenceType);
		return stringSequenceType;
	}

	visitRangeSequenceExpr(ast: IAST, options: StaticContext): SequenceType {
		this.visit(astHelper.getFirstChild(ast, 'startExpr')[1] as IAST, options);
		this.visit(astHelper.getFirstChild(ast, 'endExpr')[1] as IAST, options);
		return annotateRangeSequenceOperator(ast);
	}

	visitCompare(ast: IAST, options: StaticContext): SequenceType {
		switch (ast[0]) {
			case 'equalOp':
			case 'notEqualOp':
			case 'lessThanOrEqualOp':
			case 'lessThanOp':
			case 'greaterThanOrEqualOp':
			case 'greaterThanOp': {
				this.visit(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, options);
				this.visit(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, options);
				return annotateGeneralCompare(ast);
			}
			case 'eqOp':
			case 'neOp':
			case 'ltOp':
			case 'leOp':
			case 'gtOp':
			case 'geOp': {
				this.visit(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, options);
				this.visit(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, options);
				return annotateValueCompare(ast);
			}
			case 'nodeBeforeOp':
			case 'nodeAfterOp': {
				this.visit(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, options);
				this.visit(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, options);
				return annotateNodeCompare(ast);
			}
		}
	}

	visitPathExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitContextItemExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitFunctionCall(ast: IAST, options: StaticContext): SequenceType {
		return annotateFunctionCall(ast, options);
	}

	visitInlineFunction(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitArrowExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitDynamicFunctionInvocationExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitNamedFunctionRef(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitIntegerConstantExpr(ast: IAST, options: StaticContext): SequenceType {
		const integerSequenceType = {
			type: ValueType.XSINTEGER,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', integerSequenceType);
		return integerSequenceType;
	}

	visitStringConstantExpr(ast: IAST, options: StaticContext): SequenceType {
		const stringSequenceType = {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', stringSequenceType);
		return stringSequenceType;
	}

	visitDecimalConstantExpr(ast: IAST, options: StaticContext): SequenceType {
		const decimalSequenceType = {
			type: ValueType.XSDECIMAL,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', decimalSequenceType);
		return decimalSequenceType;
	}

	visitDoubleConstantExpr(ast: IAST, options: StaticContext): SequenceType {
		const doubleSequenceType = {
			type: ValueType.XSDOUBLE,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', doubleSequenceType);
		return doubleSequenceType;
	}

	visitVarRef(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitFlworExpression(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitQuantifiedExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitIfThenElseExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitInstanceOfExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitCastExpr(ast: IAST, options: StaticContext): SequenceType {
		return annotateCastOperator(ast);
	}

	visitCastableExpr(ast: IAST, options: StaticContext): SequenceType {
		return annotateCastableOperator(ast);
	}

	visitSimpleMapExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitMapConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitArrayConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitUnaryLookup(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitTypeSwitchExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitElementConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitAttributeConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitComputedAttriobuteConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitComputedCommentConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitComputedTextConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitComputedElementConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitComputedPIConstructor(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitCDataSection(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitDeleteExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitInsertExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitRenameExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitReplaceExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitTransformExpr(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitXStrackTrace(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitNameTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitPiTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitCommentTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitTextTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitDocumenTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitAttributeTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitElementTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitAnyKindTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitAnyMapTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitAnyArrayTest(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitWildcard(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitAtomicType(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	visitAnyItemType(ast: IAST, options: StaticContext): SequenceType {
		return this.unimplemented(ast, options);
	}

	unimplemented(ast: IAST, options: StaticContext): SequenceType {
		for (let i = 1; i < ast.length; i++) this.visit(ast[i] as IAST, options);
		return undefined;
	}
}

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate
 * @param staticContext The static context used for function lookups
 */
export default function annotateAst(ast: IAST, staticContext?: StaticContext) {
	new AnnotationVisitor().visit(ast, staticContext);
}
