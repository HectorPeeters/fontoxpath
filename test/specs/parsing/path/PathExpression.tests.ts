import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPath,
	evaluateXPathToAsyncIterator,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('relative paths', () => {
	it('supports relative paths', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode']], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('someChildNode', documentNode.documentElement), [
			documentNode.documentElement.firstChild,
		]);
	});

	it('supports addressing the parent axis with ..', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode', ['someGrandChild']]], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('../child::someNode', documentNode.documentElement),
			[documentNode.documentElement]
		);
	});

	it('sets the contextSequence', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode', ['someGrandChild']]], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNumbers('//*/position()', documentNode.documentElement),
			[1, 2, 3]
		);
	});

	it('Starts from a contextItem, not the contextSequence', () => {
		jsonMlMapper.parse(
			[
				'someElement',
				['someChildElement', 'A piece of text'],
				['someChildElement', 'A piece of text'],
				['someChildElement', 'A piece of text'],
				['someChildElement', 'A piece of text'],
			],
			documentNode
		);
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'/*/*[./text() => contains("piece of")]',
				documentNode.firstChild
			)
		);
	});

	it('returns its results sorted on document order', () => {
		jsonMlMapper.parse(['someNode', ['firstNode'], ['secondNode']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'(//secondNode, //firstNode)/self::node()',
				documentNode.documentElement
			),
			[documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]
		);
	});

	it('supports postfix expressions as sequences', () => {
		jsonMlMapper.parse(['someNode', ['firstNode'], ['secondNode']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'/someNode/(secondNode, firstNode)/self::node()',
				documentNode.documentElement
			),
			[documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]
		);
	});

	it('supports walking from attribute nodes', () => {
		jsonMlMapper.parse(
			['someNode', { someAttribute: 'someValue' }, ['someChildNode']],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes('@someAttribute/..', documentNode.documentElement),
			[documentNode.documentElement]
		);
	});

	it('allows returning other things then nodes at the last step of the path', () =>
		chai.assert.equal(evaluateXPathToNumber('./42', documentNode), 42));

	it('sorts attribute nodes after their element', () => {
		jsonMlMapper.parse(
			['someNode', { someAttribute: 'someValue' }, ['someChildNode']],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'((@someAttribute, /someNode, //someChildNode)/.)[1]',
				documentNode.documentElement
			),
			[documentNode.documentElement],
			'Document element first'
		);
		chai.assert.deepEqual(
			evaluateXPathToString(
				'((@someAttribute, /someNode, //someChildNode)/.)[2]',
				documentNode.documentElement
			),
			'someValue',
			'attributes of the document element second'
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'((@someAttribute, /someNode, //someChildNode)/.)[3]',
				documentNode.documentElement
			),
			[documentNode.documentElement.firstChild],
			'Descendant elements last'
		);
	});

	it('sorts and dedupes child::/parent:: axes correctly', () => {
		jsonMlMapper.parse(
			['someNode', ['someChildNode'], ['someChildNode'], ['someChildNode']],
			documentNode
		);
		chai.assert.equal(
			evaluateXPathToString('/*/*/../name()', documentNode.documentElement),
			'someNode'
		);
	});

	it('sorts descendant::/child:: axes correctly', () => {
		jsonMlMapper.parse(
			[
				'someNode',
				['someChildNode', ['someGrandChildA1'], ['someGrandChildA2']],
				['someChildNode', ['someGrandChildB1'], ['someGrandChildB2']],
				['someChildNode', ['someGrandChildC1'], ['someGrandChildC2']],
			],
			documentNode
		);
		chai.assert.equal(
			evaluateXPathToString(
				'descendant::someChildNode/*/name()',
				documentNode.documentElement
			),
			'someGrandChildA1 someGrandChildA2 someGrandChildB1 someGrandChildB2 someGrandChildC1 someGrandChildC2'
		);
	});

	it('sorts child::/descendant:: axes correctly', () => {
		jsonMlMapper.parse(
			[
				'someNode',
				['someChildNode', ['someGrandChildA1'], ['someGrandChildA2']],
				['someChildNode', ['someGrandChildB1'], ['someGrandChildB2']],
				['someChildNode', ['someGrandChildC1'], ['someGrandChildC2']],
			],
			documentNode
		);
		chai.assert.equal(
			evaluateXPathToString(
				'(/someNode/someChildNode//*)!name()',
				documentNode.documentElement
			),
			'someGrandChildA1 someGrandChildA2 someGrandChildB1 someGrandChildB2 someGrandChildC1 someGrandChildC2'
		);
	});

	it('sorts //text() across different levels correctly', () => {
		chai.assert.equal(
			evaluateXPathToString(
				'let $dom := <ref id="bib12"><mixed-citation publication-type="journal"><?AuthorQuery id="Q14" queryText="CrossRef reports the DOI should be &quot;10.1175/1520-0477(1986)067&lt;1226:SCOPMM&gt;2.0.CO;2&quot;, not &quot;10.1175/1520-0477(1986)067,1226:SCOPMM.2.0.CO;2&quot;. eXtyles has used the CrossRef-supplied DOI. (Ref. &quot;Wilheit, 1986&quot;)"?><person-group person-group-type="author"><string-name><surname>Wilheit</surname>, <given-names>T. T.</given-names></string-name></person-group>, <year>1986</year>: <article-title>Some comments on passive microwave measurement of rain.</article-title> <source>Bull. Amer. Meteor. Soc.</source>, <volume>67</volume>, <fpage>1226</fpage>–<lpage>1232</lpage>, doi:<pub-id pub-id-type="doi">10.1175/1520-0477(1986)067&lt;1226:SCOPMM&gt;2.0.CO;2</pub-id></mixed-citation></ref> return $dom//text() => string-join("~~")',
				documentNode,
				null,
				null,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'Wilheit~~, ~~T. T.~~, ~~1986~~: ~~Some comments on passive microwave measurement of rain.~~Bull. Amer. Meteor. Soc.~~, ~~67~~, ~~1226~~–~~1232~~, doi:~~10.1175/1520-0477(1986)067<1226:SCOPMM>2.0.CO;2'
		);
	});

	it('sorts descendant-or-self::/child:: axes correctly', () => {
		jsonMlMapper.parse(
			[
				'someNode',
				['someChildNode', ['someGrandChildA1'], ['someGrandChildA2']],
				['someChildNode', ['someGrandChildB1'], ['someGrandChildB2']],
				['someChildNode', ['someGrandChildC1'], ['someGrandChildC2']],
			],
			documentNode
		);
		chai.assert.equal(
			evaluateXPathToString(
				'/descendant-or-self::*/child::*!name()',
				documentNode.documentElement
			),
			'someChildNode someGrandChildA1 someGrandChildA2 someChildNode someGrandChildB1 someGrandChildB2 someChildNode someGrandChildC1 someGrandChildC2'
		);
	});

	it('sorts descendant-or-self::/child::/descendant-or-self:: axes correctly', () => {
		jsonMlMapper.parse(
			[
				'someNode',
				[
					'someChildNode',
					['someGrandChildA1', ['someGrandGrandChildA1-1'], ['someGrandGrandChildA1-2']],
					['someGrandChildA2', ['someGrandGrandChildA2-1'], ['someGrandGrandChildA2-2']],
				],
				[
					'someChildNode',
					['someGrandChildB1', ['someGrandGrandChildB1-1'], ['someGrandGrandChildB1-2']],
					['someGrandChildB2', ['someGrandGrandChildB2-1'], ['someGrandGrandChildB2-2']],
				],
				[
					'someChildNode',
					['someGrandChildC1', ['someGrandGrandChildC1-1'], ['someGrandGrandChildC1-2']],
					[
						'someGrandChildC2',
						['someGrandGrandChild1C2-1'],
						['someGrandGrandChild1C2-2'],
					],
				],
			],
			documentNode
		);
		chai.assert.equal(
			evaluateXPathToString(
				'/descendant-or-self::*/child::*/descendant-or-self::*!name()',
				documentNode.documentElement
			),
			'someChildNode someGrandChildA1 someGrandGrandChildA1-1 someGrandGrandChildA1-2 someGrandChildA2 someGrandGrandChildA2-1 someGrandGrandChildA2-2 someChildNode someGrandChildB1 someGrandGrandChildB1-1 someGrandGrandChildB1-2 someGrandChildB2 someGrandGrandChildB2-1 someGrandGrandChildB2-2 someChildNode someGrandChildC1 someGrandGrandChildC1-1 someGrandGrandChildC1-2 someGrandChildC2 someGrandGrandChild1C2-1 someGrandGrandChild1C2-2'
		);
	});

	it('sorts descendant::/ancestor:: axes correctly', () => {
		jsonMlMapper.parse(
			[
				'someNode',
				['someChildNodeA', ['someGrandChild'], ['someGrandChild']],
				['someChildNodeB', ['someGrandChild'], ['someGrandChild']],
				['someChildNodeC', ['someGrandChild'], ['someGrandChild']],
			],
			documentNode
		);
		chai.assert.equal(
			evaluateXPathToString(
				'descendant::someGrandChild/ancestor::*!name()',
				documentNode.documentElement
			),
			'someNode someChildNodeA someChildNodeB someChildNodeC'
		);
	});

	it('sorts descendant-or-self::/descendant:: axes correctly', () => {
		jsonMlMapper.parse(
			[
				'someNode',
				['someChildNodeA', ['someGrandChildA1'], ['someGrandChildA2']],
				['someChildNodeB', ['someGrandChildB1'], ['someGrandChildB2']],
				['someChildNodeC', ['someGrandChildC1'], ['someGrandChildC2']],
			],
			documentNode
		);
		chai.assert.equal(
			evaluateXPathToString(
				'descendant-or-self::*/descendant::*!name()',
				documentNode.documentElement
			),
			'someChildNodeA someGrandChildA1 someGrandChildA2 someChildNodeB someGrandChildB1 someGrandChildB2 someChildNodeC someGrandChildC1 someGrandChildC2'
		);
	});

	it('sorts attribute nodes alphabetically', () => {
		jsonMlMapper.parse(
			[
				'someNode',
				{ AsomeAttribute: 'someValue', BsomeOtherAttribute: 'someOtherValue' },
				['someChildNode'],
			],
			documentNode
		);
		// We need to convert to string becase string-join expects strings and function conversion is not in yet
		chai.assert.equal(
			evaluateXPathToString(
				'(@BsomeOtherAttribute, @AsomeAttribute)/string() => string-join(", ")',
				documentNode.documentElement
			),
			'someValue, someOtherValue'
		);
	});

	it('allows mixed pathseparators and abbreviated steps', function () {
		jsonMlMapper.parse(['someNode', ['someChildNode', ['someGrandChild']]], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToFirstNode(
				'/someNode/someChildNode//someGrandChild/../..//someGrandChild',
				documentNode.documentElement
			),
			documentNode.documentElement.firstChild.firstChild
		);
	});

	it('supports addressing the contextNode with .', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode', ['someGrandChild']]], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('.//*', documentNode.documentElement), [
			documentNode.documentElement.firstChild,
			documentNode.documentElement.firstChild.firstChild,
		]);
	});

	it('does not require context for the first item', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode', ['someGrandChild']]], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'function ($node) { $node//someGrandChild }(.)',
				documentNode.documentElement
			),
			[documentNode.documentElement.firstChild.firstChild]
		);
	});
});
