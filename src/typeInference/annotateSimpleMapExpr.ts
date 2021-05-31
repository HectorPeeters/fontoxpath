import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Inserting the map type of multiplicity exactly one to the ast;
 * as the simple map expr evaluates to map.
 *
 * @param ast the AST to be annotated.
 * @returns the inferred SequenceType
 */
export function annotateSimpleMapExpr(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.MAP,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}