import { NodePointer } from '../../domClone/Pointer';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value from '../dataTypes/Value';

export default function validateContextNode(value: Value): NodePointer {
	if (value === null) {
		throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
	}
	if (!isSubtypeOf(value.type, 'node()')) {
		throw new Error('XPTY0019: Axes can only be applied to xml/json nodes.');
	}

	return value.value as NodePointer;
}
