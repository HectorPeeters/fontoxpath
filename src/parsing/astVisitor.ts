import { IAST } from './astHelper';

export abstract class AstVisitor<T, O> {
	visit(ast: IAST, options: O): T {
		switch (ast[0] as string) {
			case 'andOp':
			case 'orOp':
				return this.visitLogicalOp(ast, options);
			case 'unaryPlusOp':
			case 'unaryMinusOp':
				return this.visitUnaryOp(ast, options);
			case 'addOp':
			case 'subtractOp':
			case 'multiplyOp':
			case 'divOp':
			case 'idivOp':
			case 'modOp':
				return this.visitBinaryOp(ast, options);
			case 'sequenceExpr':
				return this.visitSequenceExpr(ast, options);
			case 'unionOp':
				return this.visitUnionOp(ast, options);
			case 'exceptOp':
			case 'intersectOp':
				return this.visitIntersectExcept(ast, options);
			case 'stringConcatenateOp':
				return this.visitStringConcatenateOp(ast, options);
			case 'rangeSequenceExpr':
				return this.visitRangeSequenceExpr(ast, options);

			case 'equalOp':
			case 'notEqualOp':
			case 'lessThanOrEqualOp':
			case 'lessThanOp':
			case 'greaterThanOrEqualOp':
			case 'greaterThanOp':
			case 'eqOp':
			case 'neOp':
			case 'ltOp':
			case 'leOp':
			case 'gtOp':
			case 'geOp':
			case 'isOp':
			case 'nodeBeforeOp':
			case 'nodeAfterOp':
				return this.visitCompare(ast, options);

			case 'pathExpr':
				return this.visitPathExpr(ast, options);
			case 'contextItemExpr':
				return this.visitContextItemExpr(ast, options);

			case 'functionCallExpr':
				return this.visitFunctionCall(ast, options);
			case 'inlineFunctionExpr':
				return this.visitInlineFunction(ast, options);
			case 'arrowExpr':
				return this.visitArrowExpr(ast, options);
			case 'dynamicFunctionInvocationExpr':
				return this.visitDynamicFunctionInvocationExpr(ast, options);
			case 'namedFunctionRef':
				return this.visitNamedFunctionRef(ast, options);

			case 'integerConstantExpr':
				return this.visitIntegerConstantExpr(ast, options);
			case 'stringConstantExpr':
				return this.visitStringConstantExpr(ast, options);
			case 'decimalConstantExpr':
				return this.visitDecimalConstantExpr(ast, options);
			case 'doubleConstantExpr':
				return this.visitDoubleConstantExpr(ast, options);

			case 'varRef':
				return this.visitVarRef(ast, options);
			case 'flworExpr':
				return this.visitFlworExpression(ast, options);

			case 'quantifiedExpr':
				return this.visitQuantifiedExpr(ast, options);

			case 'ifThenElseExpr':
				return this.visitIfThenElseExpr(ast, options);

			case 'instanceOfExpr':
				return this.visitInstanceOfExpr(ast, options);
			case 'castExpr':
				return this.visitCastExpr(ast, options);
			case 'castableExpr':
				return this.visitCastableExpr(ast, options);

			case 'simpleMapExpr':
				return this.visitSimpleMapExpr(ast, options);

			case 'mapConstructor':
				return this.visitMapConstructor(ast, options);

			case 'arrayConstructor':
				return this.visitArrayConstructor(ast, options);

			case 'unaryLookup':
				return this.visitUnaryLookup(ast, options);

			case 'typeswitchExpr':
				return this.visitTypeSwitchExpr(ast, options);

			case 'elementConstructor':
				return this.visitElementConstructor(ast, options);
			case 'attributeConstructor':
				return this.visitAttributeConstructor(ast, options);
			case 'computedAttributeConstructor':
				return this.visitComputedAttriobuteConstructor(ast, options);
			case 'computedCommentConstructor':
				return this.visitComputedCommentConstructor(ast, options);
			case 'computedTextConstructor':
				return this.visitComputedTextConstructor(ast, options);
			case 'computedElementConstructor':
				return this.visitComputedElementConstructor(ast, options);
			case 'computedPIConstructor':
				return this.visitComputedPIConstructor(ast, options);
			case 'CDataSection':
				return this.visitCDataSection(ast, options);

			case 'deleteExpr':
				return this.visitDeleteExpr(ast, options);
			case 'insertExpr':
				return this.visitInsertExpr(ast, options);
			case 'renameExpr':
				return this.visitRenameExpr(ast, options);
			case 'replaceExpr':
				return this.visitReplaceExpr(ast, options);
			case 'transformExpr':
				return this.visitTransformExpr(ast, options);

			case 'x:stackTrace':
				return this.visitXStrackTrace(ast, options);

			case 'nameTest':
				return this.visitNameTest(ast, options);
			case 'piTest':
				return this.visitPiTest(ast, options);
			case 'commentTest':
				return this.visitCommentTest(ast, options);
			case 'textTest':
				return this.visitTextTest(ast, options);
			case 'documentTest':
				return this.visitDocumenTest(ast, options);
			case 'attributeTest':
				return this.visitAttributeTest(ast, options);
			case 'elementTest':
				return this.visitElementTest(ast, options);
			case 'anyKindTest':
				return this.visitAnyKindTest(ast, options);
			case 'anyMapTest':
				return this.visitAnyMapTest(ast, options);
			case 'anyArrayTest':
				return this.visitAnyArrayTest(ast, options);
			case 'Wildcard':
				return this.visitWildcard(ast, options);
			case 'atomicType':
				return this.visitAtomicType(ast, options);
			case 'anyItemType':
				return this.visitAnyItemType(ast, options);

			default:
				throw new Error('No selector counterpart for: ' + ast[0] + '.');
		}
	}

	abstract visitLogicalOp(ast, options): T;
	abstract visitUnaryOp(ast, options): T;
	abstract visitBinaryOp(ast, options): T;
	abstract visitSequenceExpr(ast, options): T;
	abstract visitUnionOp(ast, options): T;
	abstract visitIntersectExcept(ast, options): T;
	abstract visitStringConcatenateOp(ast, options): T;
	abstract visitRangeSequenceExpr(ast, options): T;
	abstract visitCompare(ast, options): T;
	abstract visitPathExpr(ast, options): T;
	abstract visitContextItemExpr(ast, options): T;
	abstract visitFunctionCall(ast, options): T;
	abstract visitInlineFunction(ast, options): T;
	abstract visitArrowExpr(ast, options): T;
	abstract visitDynamicFunctionInvocationExpr(ast, options): T;
	abstract visitNamedFunctionRef(ast, options): T;
	abstract visitIntegerConstantExpr(ast, options): T;
	abstract visitStringConstantExpr(ast, options): T;
	abstract visitDecimalConstantExpr(ast, options): T;
	abstract visitDoubleConstantExpr(ast, options): T;
	abstract visitVarRef(ast, options): T;
	abstract visitFlworExpression(ast, options): T;
	abstract visitQuantifiedExpr(ast, options): T;
	abstract visitIfThenElseExpr(ast, options): T;
	abstract visitInstanceOfExpr(ast, options): T;
	abstract visitCastExpr(ast, options): T;
	abstract visitCastableExpr(ast, options): T;
	abstract visitSimpleMapExpr(ast, options): T;
	abstract visitMapConstructor(ast, options): T;
	abstract visitArrayConstructor(ast, options): T;
	abstract visitUnaryLookup(ast, options): T;
	abstract visitTypeSwitchExpr(ast, options): T;
	abstract visitElementConstructor(ast, options): T;
	abstract visitAttributeConstructor(ast, options): T;
	abstract visitComputedAttriobuteConstructor(ast, options): T;
	abstract visitComputedCommentConstructor(ast, options): T;
	abstract visitComputedTextConstructor(ast, options): T;
	abstract visitComputedElementConstructor(ast, options): T;
	abstract visitComputedPIConstructor(ast, options): T;
	abstract visitCDataSection(ast, options): T;
	abstract visitDeleteExpr(ast, options): T;
	abstract visitInsertExpr(ast, options): T;
	abstract visitRenameExpr(ast, options): T;
	abstract visitReplaceExpr(ast, options): T;
	abstract visitTransformExpr(ast, options): T;
	abstract visitXStrackTrace(ast, options): T;
	abstract visitNameTest(ast, options): T;
	abstract visitPiTest(ast, options): T;
	abstract visitCommentTest(ast, options): T;
	abstract visitTextTest(ast, options): T;
	abstract visitDocumenTest(ast, options): T;
	abstract visitAttributeTest(ast, options): T;
	abstract visitElementTest(ast, options): T;
	abstract visitAnyKindTest(ast, options): T;
	abstract visitAnyMapTest(ast, options): T;
	abstract visitAnyArrayTest(ast, options): T;
	abstract visitWildcard(ast, options): T;
	abstract visitAtomicType(ast, options): T;
	abstract visitAnyItemType(ast, options): T;
}
