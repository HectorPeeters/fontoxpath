import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { determineReturnType } from '../expressions/operators/arithmetic/BinaryOperator';
import { IAST } from '../parsing/astHelper';

type BinOpLookupTable = {
	[key: number]: ValueType;
};

// TODO: fix this weird hashing thing
const BINOP_LOOKUP: BinOpLookupTable = {
	[ValueType.XSINTEGER + ValueType.XSINTEGER * 1000]: ValueType.XSINTEGER,
	[ValueType.XSDECIMAL + ValueType.XSDECIMAL * 1000]: ValueType.XSDECIMAL,
	[ValueType.XSFLOAT + ValueType.XSFLOAT * 1000]: ValueType.XSFLOAT,
};

function annotateBinOpCommon(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined
): SequenceType | undefined {
	if (
		isSubtypeOf(left.type, ValueType.XSNUMERIC) &&
		isSubtypeOf(right.type, ValueType.XSNUMERIC)
	) {
		const type = {
			type: BINOP_LOOKUP[left.type + right.type * 1000] || ValueType.XSDECIMAL,
			mult: left.mult,
		};
		ast.push(['type', type]);
		return type;
	}

	// if (
	// 	left.type === ValueType.XSYEARMONTHDURATION &&
	// 	right.type === ValueType.XSYEARMONTHDURATION
	// ) {
	// 	ast.push(['type', { type: ValueType.XSYEARMONTHDURATION, mult: left.mult }]);
	// 	return { type: ValueType.XSYEARMONTHDURATION, mult: left.mult };
	// }

	// if (
	// 	isSubtypeOf(left.type, ValueType.XSNUMERIC) &&
	// 	right.type === ValueType.XSYEARMONTHDURATION
	// ) {
	// 	ast.push(['type', { type: ValueType.XSYEARMONTHDURATION, mult: left.mult }]);
	// 	return { type: ValueType.XSYEARMONTHDURATION, mult: left.mult };
	// }

	// if (
	// 	left.type === ValueType.XSYEARMONTHDURATION &&
	// 	isSubtypeOf(right.type, ValueType.XSNUMERIC)
	// ) {
	// 	ast.push(['type', { type: ValueType.XSYEARMONTHDURATION, mult: left.mult }]);
	// 	return { type: ValueType.XSYEARMONTHDURATION, mult: left.mult };
	// }

	// if (left.type === ValueType.XSDAYTIMEDURATION && right.type === ValueType.XSDAYTIMEDURATION) {
	// 	ast.push(['type', { type: ValueType.XSDAYTIMEDURATION, mult: left.mult }]);
	// 	return { type: ValueType.XSDAYTIMEDURATION, mult: left.mult };
	// }

	// if (
	// 	(isSubtypeOf(left.type, ValueType.XSDATETIME) &&
	// 		right.type === ValueType.XSYEARMONTHDURATION) ||
	// 	(isSubtypeOf(left.type, ValueType.XSDATETIME) && right.type === ValueType.XSDAYTIMEDURATION)
	// ) {
	// 	ast.push(['type', { type: ValueType.XSDATETIME, mult: left.mult }]);
	// 	return { type: ValueType.XSDATETIME, mult: left.mult };
	// }

	// if (
	// 	(isSubtypeOf(left.type, ValueType.XSDATE) &&
	// 		right.type === ValueType.XSYEARMONTHDURATION) ||
	// 	(isSubtypeOf(left.type, ValueType.XSDATE) && right.type === ValueType.XSDAYTIMEDURATION)
	// ) {
	// 	ast.push(['type', { type: ValueType.XSDATE, mult: left.mult }]);
	// 	return { type: ValueType.XSDATE, mult: left.mult };
	// }

	// if (left.type === ValueType.XSTIME && right.type === ValueType.XSDAYTIMEDURATION) {
	// 	ast.push(['type', { type: ValueType.XSTIME, mult: left.mult }]);
	// 	return { type: ValueType.XSTIME, mult: left.mult };
	// }

	// if (
	// 	(right.type === ValueType.XSYEARMONTHDURATION &&
	// 		isSubtypeOf(left.type, ValueType.XSDATETIME)) ||
	// 	(right.type === ValueType.XSDAYTIMEDURATION && isSubtypeOf(left.type, ValueType.XSDATETIME))
	// ) {
	// 	ast.push(['type', { type: ValueType.XSDATETIME, mult: left.mult }]);
	// 	return { type: ValueType.XSDATETIME, mult: left.mult };
	// }

	// if (
	// 	(right.type === ValueType.XSDAYTIMEDURATION && left.type === ValueType.XSDATE) ||
	// 	(right.type === ValueType.XSYEARMONTHDURATION && left.type === ValueType.XSDATE)
	// ) {
	// 	ast.push(['type', { type: ValueType.XSDATE, mult: left.mult }]);
	// 	return { type: ValueType.XSDATE, mult: left.mult };
	// }

	// if (right.type === ValueType.XSDAYTIMEDURATION && left.type === ValueType.XSTIME) {
	// 	ast.push(['type', { type: ValueType.XSTIME, mult: left.mult }]);
	// 	return { type: ValueType.XSTIME, mult: left.mult };
	// }

	return undefined;
}

export function annotateAdditionOp(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined
): SequenceType | undefined {
	if (!left || !right) {
		return undefined;
	}

	if (left.mult !== right.mult) {
		throw new Error('PANIC!');
	}
	return annotateBinOpCommon(ast, left, right);
}

export function annotateSubtractOp(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined
): SequenceType | undefined {
	if (!left || !right) {
		return undefined;
	}

	if (left.mult !== right.mult) {
		throw new Error('PANIC!');
	}
	// if (
	// 	(isSubtypeOf(left.type, ValueType.XSDATETIME) &&
	// 		isSubtypeOf(right.type, ValueType.XSDATETIME)) ||
	// 	(isSubtypeOf(left.type, ValueType.XSDATE) && isSubtypeOf(right.type, ValueType.XSDATE)) ||
	// 	(isSubtypeOf(left.type, ValueType.XSTIME) && isSubtypeOf(right.type, ValueType.XSTIME))
	// ) {
	// 	ast.push(['type', { type: ValueType.XSDAYTIMEDURATION, mult: left.mult }]);
	// 	return { type: ValueType.XSDAYTIMEDURATION, mult: left.mult };
	// } else {
	return annotateAdditionOp(ast, left, right);
	// }
}

export function annotateDivOp(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined
): SequenceType | undefined {
	if (!left || !right) {
		return undefined;
	}

	if (left.mult !== right.mult) {
		throw new Error('PANIC!');
	}
	let returnType: ValueType = determineReturnType(left.type, right.type);
	if (
		isSubtypeOf(left.type, ValueType.XSNUMERIC) &&
		isSubtypeOf(right.type, ValueType.XSNUMERIC)
	) {
		if (returnType === ValueType.XSINTEGER) returnType = ValueType.XSDECIMAL;
		ast.push(['type', { type: returnType, mult: left.mult }]);
		return { type: returnType, mult: left.mult };
		// } else if (
		// 	isSubtypeOf(left.type, ValueType.XSYEARMONTHDURATION) &&
		// 	isSubtypeOf(right.type, ValueType.XSYEARMONTHDURATION)
		// ) {
		// 	ast.push(['type', { type: ValueType.XSDECIMAL, mult: left.mult }]);
		// 	return { type: ValueType.XSDECIMAL, mult: left.mult };
		// } else if (
		// 	isSubtypeOf(left.type, ValueType.XSYEARMONTHDURATION) &&
		// 	isSubtypeOf(right.type, ValueType.XSNUMERIC)
		// ) {
		// 	ast.push(['type', { type: ValueType.XSYEARMONTHDURATION, mult: left.mult }]);
		// 	return { type: ValueType.XSYEARMONTHDURATION, mult: left.mult };
		// } else if (
		// 	isSubtypeOf(left.type, ValueType.XSDAYTIMEDURATION) &&
		// 	isSubtypeOf(right.type, ValueType.XSDAYTIMEDURATION)
		// ) {
		// 	ast.push(['type', { type: ValueType.XSDECIMAL, mult: left.mult }]);
		// 	return { type: ValueType.XSDECIMAL, mult: left.mult };
		// } else if (
		// 	isSubtypeOf(left.type, ValueType.XSDAYTIMEDURATION) &&
		// 	isSubtypeOf(right.type, ValueType.XSNUMERIC)
		// ) {
		// 	ast.push(['type', { type: ValueType.XSDAYTIMEDURATION, mult: left.mult }]);
		// 	return { type: ValueType.XSDAYTIMEDURATION, mult: left.mult };
	}
	return undefined;
}
