// import { Suite } from 'benchmark';
// import { evaluateXPath, Language } from '../src/index';

// const suite: Suite = new Suite();

// function runTests() {
// 	// tslint:disable-next-line: no-console
// 	console.log('Tests are running...');
// 	suite
// 		// add listeners
// 		.on('cycle', (event) => {
// 			// tslint:disable-next-line: no-console
// 			console.log(
// 				`${event.target.name}, ${Math.round(event.target.hz * 1000) / 1000} op/sec, ±${
// 					Math.round(event.target.stats.rme * 1000) / 1000
// 				}%, ${event.target.stats.sample.length} runs sampled`
// 			);
// 		})
// 		.run({ async: true });
// }

// function addTests(name: string, func: Function) {
// 	suite.add(name, func);
// }

// function addTestCaseToBenchmark(
// 	name: string,
// 	query: string,
// 	annotateAst: boolean,
// 	language?: Language
// ): void {
// 	addTests(name, () =>
// 		evaluateXPath(query, null, null, null, null, {
// 			language,
// 			annotateAst,
// 		})
// 	);
// }

// const runBenchmarking = () => {
// 	addTestCaseToBenchmark('UsingAnnotation', '1 eq 3', true);
// 	addTestCaseToBenchmark('NotUsingAnnotation', '1 eq 3', false);
// 	runTests();
// };

// runBenchmarking();

import benchmarkRunner from '@fontoxml/fonto-benchmark-runner';
import { testFunction } from '@fontoxml/fonto-benchmark-runner/lib/benchmarkRunner/Types';
import { evaluateXPath } from '../src/index';

const withAnnotation: { name: string; test: testFunction } = {
	name: 'withAnnotation',
	test: () => {
		evaluateXPath('1 eq 3', undefined, undefined, undefined, undefined, { annotateAst: true });
	},
};

const withoutAnnotation: { name: string; test: testFunction } = {
	name: 'withoutAnnotation',
	test: () => {
		evaluateXPath('1 eq 3', undefined, undefined, undefined, undefined, { annotateAst: false });
	},
};

// benchmarkRunner.compareBenchmarks(
// 	'value type compare',
// 	undefined,
// 	undefined,
// 	withoutAnnotation,
// 	withAnnotation
// );

benchmarkRunner.addBenchmark('value type compare', withAnnotation.test);

benchmarkRunner.run(false);
