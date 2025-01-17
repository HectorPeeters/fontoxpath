import { errFORG0006 } from '../../functions/FunctionOperationErrors';
import { DONE_TOKEN, IIterator, ready } from '../../util/iterators';
import ISequence, { SwitchCasesCases } from '../ISequence';
import isSubtypeOf from '../isSubtypeOf';
import sequenceFactory from '../sequenceFactory';
import Value, { ValueType } from '../Value';

export default class ArrayBackedSequence implements ISequence {
	public value: IIterator<Value>;

	constructor(
		private readonly _sequenceFactory: typeof sequenceFactory,
		private readonly _values: Value[]
	) {
		let i = -1;
		this.value = {
			next: () => {
				i++;
				if (i >= _values.length) {
					return DONE_TOKEN;
				}
				return ready(_values[i]);
			},
		};
	}

	public expandSequence(): ISequence {
		return this;
	}

	public filter(callback: (value: Value, i: number, sequence: ISequence) => boolean): ISequence {
		let i = -1;
		return this._sequenceFactory.create({
			next: () => {
				i++;
				while (i < this._values.length && !callback(this._values[i], i, this)) {
					i++;
				}

				if (i >= this._values.length) {
					return DONE_TOKEN;
				}

				return ready(this._values[i]);
			},
		});
	}

	public first(): Value | null {
		return this._values[0];
	}

	public getAllValues(): Value[] {
		return this._values;
	}

	public getEffectiveBooleanValue(): boolean {
		if (isSubtypeOf(this._values[0].type, ValueType.NODE)) {
			return true;
		}
		// We always have a length > 1, or we'd be a singletonSequence
		throw errFORG0006();
	}

	public getLength(): number {
		return this._values.length;
	}

	public isEmpty(): boolean {
		return false;
	}

	public isSingleton(): boolean {
		return false;
	}

	public map(callback: (value: Value, i: number, sequence: ISequence) => Value): ISequence {
		let i = -1;
		return this._sequenceFactory.create(
			{
				next: () => {
					return ++i >= this._values.length
						? DONE_TOKEN
						: ready(callback(this._values[i], i, this));
				},
			},
			this._values.length
		);
	}

	public mapAll(callback: (allValues: Value[]) => ISequence): ISequence {
		return callback(this._values);
	}

	public switchCases(cases: SwitchCasesCases): ISequence {
		if (cases.multiple) {
			return cases.multiple(this);
		}
		return cases.default(this);
	}
}
