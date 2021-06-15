import { Suite } from 'benchmark';
import buildEvaluationContext from '../src/evaluationUtils/buildEvaluationContext';
import { printAndRethrowError } from '../src/evaluationUtils/printAndRethrowError';
import DynamicContext from '../src/expressions/DynamicContext';
import ExecutionParameters from '../src/expressions/ExecutionParameters';
import Expression from '../src/expressions/Expression';
import { Language, Options } from '../src/index';
import { markXPathEnd, markXPathStart } from '../src/performance';

const suite: Suite = new Suite();

const queryString: string = '1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10';
const queryStringEq: string = '((((4 eq 4) eq (5 eq 5)) eq (5 eq 5)) eq (6 eq 3)) eq (5 eq 1)';

contextBenchmark(queryStringEq);

function contextBenchmark(queryToRun: string): void {
	function setUp(
		selector: string,
		options?: Options | null
	): {
		dynamicContext: DynamicContext;
		executionParameters: ExecutionParameters;
		expression: Expression;
	} {
		options = options || {};

		let dynamicContext: DynamicContext;
		let executionParameters: ExecutionParameters;
		let expression: Expression;
		try {
			const context = buildEvaluationContext(selector, undefined, null, {}, options, {
				allowUpdating: options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
				allowXQuery:
					options['language'] === Language.XQUERY_3_1_LANGUAGE ||
					options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
				debug: !!options['debug'],
				disableCache: !!options['disableCache'],
				annotateAst: !!options['annotateAst'],
			});
			dynamicContext = context.dynamicContext;
			executionParameters = context.executionParameters;
			expression = context.expression;
		} catch (error) {
			printAndRethrowError(selector, error);
		}

		if (expression.isUpdating) {
			throw new Error(
				'XUST0001: Updating expressions should be evaluated as updating expressions'
			);
		}

		return {
			dynamicContext,
			executionParameters,
			expression,
		};
	}

	function evaluationBenchmark(
		expression: Expression,
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): void {
		expression.evaluateMaybeStatically(dynamicContext, executionParameters);
	}

	const contextWithAnnotation: {
		dynamicContext: DynamicContext;
		executionParameters: ExecutionParameters;
		expression: Expression;
	} = setUp(queryToRun, { annotateAst: true });

	const contextWithoutAnnotation: {
		dynamicContext: DynamicContext;
		executionParameters: ExecutionParameters;
		expression: Expression;
	} = setUp(queryToRun, { annotateAst: false });

	function runTests() {
		// tslint:disable-next-line: no-console
		console.log('Tests are running...');
		suite
			// add listeners
			.on('cycle', (event) => {
				// tslint:disable-next-line: no-console
				console.log(
					`${event.target.name}, ${Math.round(event.target.hz * 1000) / 1000} op/sec, ±${
						Math.round(event.target.stats.rme * 1000) / 1000
					}%, ${event.target.stats.sample.length} runs sampled`
				);
			})
			.run({ async: true });
	}

	function addTests(name: string, func: Function) {
		suite.add(name, func);
	}

	function addTestCaseToBenchmark(
		name: string,
		context: {
			dynamicContext: DynamicContext;
			executionParameters: ExecutionParameters;
			expression: Expression;
		}
	): void {
		addTests(name, () =>
			evaluationBenchmark(
				context.expression,
				context.dynamicContext,
				context.executionParameters
			)
		);
	}

	const runBenchmarking = () => {
		addTestCaseToBenchmark('UsingAnnotation', contextWithAnnotation);
		addTestCaseToBenchmark('NotUsingAnnotation', contextWithoutAnnotation);
		runTests();
	};

	function timeFunction(n: number, f: () => void): number {
		const start = new Date();
		for (let i = 0; i < n; i++) {
			f();
		}
		const end = new Date();
		return end.getTime() - start.getTime();
	}

	function doBenchmarks(iterations: number) {
		// Some prep if needed if the function has a single-time setup.

		const functionATime = timeFunction(iterations, () =>
			evaluationBenchmark(
				contextWithAnnotation.expression,
				contextWithAnnotation.dynamicContext,
				contextWithAnnotation.executionParameters
			)
		);

		console.log(
			'contextWithAnnotation took ' + functionATime + ' ms to run ' + iterations + ' times.'
		);

		const functionBTime = timeFunction(iterations, () =>
			evaluationBenchmark(
				contextWithoutAnnotation.expression,
				contextWithoutAnnotation.dynamicContext,
				contextWithoutAnnotation.executionParameters
			)
		);

		console.log(
			'contextWithoutAnnotation took ' +
				functionBTime +
				' ms to run ' +
				iterations +
				' times.'
		);
	}

	markXPathStart(queryToRun);

	runBenchmarking();
	doBenchmarks(1000000);

	markXPathEnd(queryToRun);
}

// import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
// import { testFunction } from '@fontoxml/fonto-benchmark-runner/lib/benchmarkRunner/Types';
// import { evaluateXPath } from '../src/index';

// const withAnnotation: { name: string; test: testFunction } = {
// 	name: 'withAnnotation',
// 	test: () => {
// 		evaluateXPath(queryString, undefined, undefined, undefined, undefined, {
// 			annotateAst: true,
// 		});
// 	},
// };

// const withoutAnnotation: { name: string; test: testFunction } = {
// 	name: 'withoutAnnotation',
// 	test: () => {
// 		evaluateXPath(queryString, undefined, undefined, undefined, undefined, {
// 			annotateAst: false,
// 		});
// 	},
// };

// benchmarkRunner.compareBenchmarks(
// 	'value type compare',
// 	undefined,
// 	undefined,
// 	withoutAnnotation,
// 	withAnnotation
// );

// // benchmarkRunner.addBenchmark('value type compare', withAnnotation.test);

// benchmarkRunner.run(false);
