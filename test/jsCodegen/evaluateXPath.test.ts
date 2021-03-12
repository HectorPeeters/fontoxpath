import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import evaluateXPathToNodes from '../../src/evaluateXPathToNodes';
import evaluateXPathToBoolean from '../../src/evaluateXPathToBoolean';

describe('js codegen backend', () => {
	let document = new slimdom.Document();
	jsonMlMapper.parse(
		[
			'xml',
			['title', 'Tips'],
			['tips', ['tip', 'Make it work'], ['tip', 'Make it right'], ['tip', 'Make it fast']],
		],
		document
	);
	it('evaluates to boolean', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('/element()/element()/text()', document, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('/text()', document, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('/element()/element(tips)/text()', document, null, null, {
				backend: 'js-codegen',
			})
		);
	});
	it('evaluates to nodes', () => {
		const results = evaluateXPathToNodes(
			'/element()/element()/element()/text()',
			document,
			null,
			null,
			{ backend: 'js-codegen' }
		);
		chai.assert.equal(results.length, 3);
	});
	it('evaluates name test to boolean', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('/xml', document, null, null, { backend: 'js-codegen' })
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('/html', document, null, null, { backend: 'js-codegen' })
		);
	});
	describe("wildcard", () => {
		it('selects elements', () => {
			const results = evaluateXPathToNodes('/xml/*', document, null, null, {
				backend: 'js-codegen',
			})
			chai.assert.equal(results.length, 2);
		})
		it('does not select text elements', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('/xml/tips/tip/*', document, null, null, {
				backend: 'js-codegen',
			}))
		})
	})
	it('evaluates self axis', () => {
		const xmlNode: slimdom.Node = document.firstChild;
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::element()', xmlNode, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('self::text()', xmlNode, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::xml', xmlNode, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('self::p', xmlNode, null, null, {
				backend: 'js-codegen',
			})
		);
	});
	describe('filter expressions', () => {
		let document = new slimdom.Document();
		jsonMlMapper.parse(
			[
				'xml',
				['title', 'Tips'],
				['extra'],
				[
					'tips',
					['tip', 'Make it work'],
					['tip', 'Make it right'],
					['tip', 'Make it fast'],
				]
			],
			document
		);
		it('evaluates basic filter expressions', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('/xml/tips[parent::element()]', document, null, null, {
				backend: 'js-codegen',
			}))
			chai.assert.isFalse(evaluateXPathToBoolean('/xml/tips/tip/text()[parent::text()]', document, null, null, {
				backend: 'js-codegen',
			}))
			chai.assert.isTrue(evaluateXPathToBoolean('/xml/tips/tip/text()[parent::element()]', document, null, null, {
				backend: 'js-codegen',
			}))
		})
		it('compiles filter expressions with and "and" expression', () => {
			const results = evaluateXPathToNodes(
				'/element()/element()[parent::element(xml) and child::element(tip)]',
				document,
				null,
				null,
				{
					backend: 'js-codegen',
				}
			);
			chai.assert.equal(results.length, 1);
		});
		it('compiles filter expressions with and "or" expression', () => {
			const results = evaluateXPathToNodes(
				'/xml/element()[child::element() or self::element(title)]',
				document,
				null,
				null,
				{
					backend: 'js-codegen',
				}
			);
			chai.assert.equal(results.length, 2);
		});
		it('compiles filter expressions with "and" and "or" expressions', () => {
			const results = evaluateXPathToNodes(
				'/xml/element()[child::text() and self::element(title) or self::element(tips)]',
				document,
				null,
				null,
				{
					backend: 'js-codegen',
				}
			);
			chai.assert.equal(results.length, 2);
		});
	});
});