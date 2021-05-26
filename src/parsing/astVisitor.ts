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

	abstract visitLogicalOp(ast: IAST, options: O): T;
	abstract visitUnaryOp(ast: IAST, options: O): T;
	abstract visitBinaryOp(ast: IAST, options: O): T;
	abstract visitSequenceExpr(ast: IAST, options: O): T;
	abstract visitUnionOp(ast: IAST, options: O): T;
	abstract visitIntersectExcept(ast: IAST, options: O): T;
	abstract visitStringConcatenateOp(ast: IAST, options: O): T;
	abstract visitRangeSequenceExpr(ast: IAST, options: O): T;
	abstract visitCompare(ast: IAST, options: O): T;
	abstract visitPathExpr(ast: IAST, options: O): T;
	abstract visitContextItemExpr(ast: IAST, options: O): T;
	abstract visitFunctionCall(ast: IAST, options: O): T;
	abstract visitInlineFunction(ast: IAST, options: O): T;
	abstract visitArrowExpr(ast: IAST, options: O): T;
	abstract visitDynamicFunctionInvocationExpr(ast: IAST, options: O): T;
	abstract visitNamedFunctionRef(ast: IAST, options: O): T;
	abstract visitIntegerConstantExpr(ast: IAST, options: O): T;
	abstract visitStringConstantExpr(ast: IAST, options: O): T;
	abstract visitDecimalConstantExpr(ast: IAST, options: O): T;
	abstract visitDoubleConstantExpr(ast: IAST, options: O): T;
	abstract visitVarRef(ast: IAST, options: O): T;
	abstract visitFlworExpression(ast: IAST, options: O): T;
	abstract visitQuantifiedExpr(ast: IAST, options: O): T;
	abstract visitIfThenElseExpr(ast: IAST, options: O): T;
	abstract visitInstanceOfExpr(ast: IAST, options: O): T;
	abstract visitCastExpr(ast: IAST, options: O): T;
	abstract visitCastableExpr(ast: IAST, options: O): T;
	abstract visitSimpleMapExpr(ast: IAST, options: O): T;
	abstract visitMapConstructor(ast: IAST, options: O): T;
	abstract visitArrayConstructor(ast: IAST, options: O): T;
	abstract visitUnaryLookup(ast: IAST, options: O): T;
	abstract visitTypeSwitchExpr(ast: IAST, options: O): T;
	abstract visitElementConstructor(ast: IAST, options: O): T;
	abstract visitAttributeConstructor(ast: IAST, options: O): T;
	abstract visitComputedAttriobuteConstructor(ast: IAST, options: O): T;
	abstract visitComputedCommentConstructor(ast: IAST, options: O): T;
	abstract visitComputedTextConstructor(ast: IAST, options: O): T;
	abstract visitComputedElementConstructor(ast: IAST, options: O): T;
	abstract visitComputedPIConstructor(ast: IAST, options: O): T;
	abstract visitCDataSection(ast: IAST, options: O): T;
	abstract visitDeleteExpr(ast: IAST, options: O): T;
	abstract visitInsertExpr(ast: IAST, options: O): T;
	abstract visitRenameExpr(ast: IAST, options: O): T;
	abstract visitReplaceExpr(ast: IAST, options: O): T;
	abstract visitTransformExpr(ast: IAST, options: O): T;
	abstract visitXStrackTrace(ast: IAST, options: O): T;
	abstract visitNameTest(ast: IAST, options: O): T;
	abstract visitPiTest(ast: IAST, options: O): T;
	abstract visitCommentTest(ast: IAST, options: O): T;
	abstract visitTextTest(ast: IAST, options: O): T;
	abstract visitDocumenTest(ast: IAST, options: O): T;
	abstract visitAttributeTest(ast: IAST, options: O): T;
	abstract visitElementTest(ast: IAST, options: O): T;
	abstract visitAnyKindTest(ast: IAST, options: O): T;
	abstract visitAnyMapTest(ast: IAST, options: O): T;
	abstract visitAnyArrayTest(ast: IAST, options: O): T;
	abstract visitWildcard(ast: IAST, options: O): T;
	abstract visitAtomicType(ast: IAST, options: O): T;
	abstract visitAnyItemType(ast: IAST, options: O): T;
}
