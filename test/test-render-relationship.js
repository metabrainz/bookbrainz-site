/*
 * Copyright (C) 2018  Eshan Singh
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {expect} from 'chai';
import renderRelationship from '../src/server/helpers/render.js';


const relationshipTests = {
	fullySpecified: {
		rel: {
			source: {
				bbid: 1,
				defaultAlias: {name: 'test'},
				type: 'test-type'
			},
			target: {
				bbid: 2,
				defaultAlias: {name: 'test2'},
				type: 'test-type2'
			},
			type: {displayTemplate: '{{entities.[0]}}{{entities.[1]}}'}
		},
		renderedRel: [
			'<a href="/test-type/1">test</a>',
			'<a href="/test-type2/2">test2</a>'
		].join('')
	},
	unnamedSource: {
		rel: {
			source: {
				bbid: 1,
				type: 'test-type'
			},
			target: {
				bbid: 2,
				defaultAlias: {name: 'test2'},
				type: 'test-type2'
			},
			type: {displayTemplate: '{{entities.[0]}}{{entities.[1]}}'}
		},
		renderedRel: [
			'<a href="/test-type/1">(unnamed)</a>',
			'<a href="/test-type2/2">test2</a>'
		].join('')
	}
};

function makeRelationshipTest(test) {
	return () => {
		expect(renderRelationship(test.rel)).to.equal(test.renderedRel);
	};
}

describe('renderRelationship', () => {
	it('renders a fully specified relationship',
	   makeRelationshipTest(relationshipTests.fullySpecified));
	it('renders a relationship where the source entity is unnamed',
	   makeRelationshipTest(relationshipTests.unnamedSource));
});
