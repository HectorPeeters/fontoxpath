import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Checks the type and multiplicity of else clause and then clause
 * and inserts the type to the ast as an attribute if they match.
 *
 * @param ast the AST to be annotated.
 * @param elseClause the elseClause, uses type data of this param to ast.
 * @param thenClause the thenClause.
 * @returns the type of the context item.
 */
export function annotateIfThenElseExpr(
	ast: IAST,
	elseClause: SequenceType,
	thenClause: SequenceType
): SequenceType {
	if (!elseClause || !thenClause) {
		return undefined;
	}
	if (elseClause.type === thenClause.type && elseClause.mult === thenClause.mult) {
		astHelper.insertAttribute(ast, 'type', elseClause);
		return elseClause;
	}
	return undefined;
}