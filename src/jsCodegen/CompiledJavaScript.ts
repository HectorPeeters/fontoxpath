import DomFacade from '../domFacade/DomFacade';
import Value from '../expressions/dataTypes/Value';

class CompiledJavaScript {
	private compiledJavaScript: string;
	private fn: any;
	private runtimeLibrary: any;

	constructor(compiledJavaScript: string, runtimeLibrary: any) {
		this.compiledJavaScript = compiledJavaScript;
		this.runtimeLibrary = runtimeLibrary;

		// tslint:disable-next-line function-constructor
		this.fn = new Function(
			'contextItem',
			'domFacade',
			`runtimeLibrary`,
			this.compiledJavaScript
		);
	}

	public evaluate(dynamicContext: Value, domFacade: DomFacade) {
		return this.fn(dynamicContext, domFacade, this.runtimeLibrary);
	}
}

export default CompiledJavaScript;
