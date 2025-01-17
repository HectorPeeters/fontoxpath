import { Document } from '../types/Types';
import INodesFactory from './INodesFactory';

export default class DomBackedNodesFactory implements INodesFactory {
	private _documentNode: Document | null;

	constructor(contextItem: any) {
		if (contextItem && 'nodeType' in contextItem) {
			const ownerDocument = contextItem.ownerDocument || contextItem;
			if (
				typeof ownerDocument.createElementNS === 'function' &&
				typeof ownerDocument.createProcessingInstruction === 'function' &&
				typeof ownerDocument.createTextNode === 'function' &&
				typeof ownerDocument.createComment === 'function'
			) {
				this._documentNode = ownerDocument;
			}
		}

		if (!this._documentNode) {
			this._documentNode = null;
		}
	}

	public createAttributeNS(namespaceURI: string, name: string) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createAttributeNS(namespaceURI, name);
	}

	public createCDATASection(contents: string) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createCDATASection(contents);
	}

	public createComment(contents: string) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createComment(contents);
	}

	public createDocument() {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.implementation.createDocument(null, null, null);
	}

	public createElementNS(namespaceURI: string, name: string) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createElementNS(namespaceURI, name);
	}

	public createProcessingInstruction(target: string, data: string) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createProcessingInstruction(target, data);
	}

	public createTextNode(contents: string) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createTextNode(contents);
	}
}
