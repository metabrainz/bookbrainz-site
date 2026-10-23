/*
 * Copyright (C) 2026  MetaBrainz Foundation
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 */

import {entityToOption, getEntityLabelText} from '../../../../src/client/helpers/entity';
import EntityLink from '../../../../src/client/components/entity-link';
import EntityTitle from '../../../../src/client/components/pages/entities/title';
import {I18nextProvider} from 'react-i18next';
import React from 'react';
import {createI18n} from '../../../../src/common/i18n/i18n';
// eslint-disable-next-line import/no-internal-modules
import english from '../../../../public/locales/en/translation.json';
import {expect} from 'chai';
import {renderToStaticMarkup} from 'react-dom/server';


const resources = {
	en: {translation: english},
	fr: {
		translation: {
			common: {entityType: {work: 'Œuvre'}, unnamed: '(sans nom)'},
			pages: {
				entity: {
					deletedEntityType: '{{type}} supprimé {{bbid}}',
					thisTypeWasDeleted: 'Ce {{type}} a été supprimé',
					unnamedLabel: 'Sans nom',
					unnamedType: '{{type}} sans nom {{bbid}}'
				}
			}
		}
	}
};
const unnamed = {bbid: 'test-bbid', dataId: 1, type: 'Work'};
const deleted = {...unnamed, dataId: null};

describe('Entity helper translations', () => {
	let englishI18n;
	let frenchI18n;
	beforeEach(() => {
		englishI18n = createI18n('en', resources);
		frenchI18n = createI18n('fr', resources);
	});

	it('uses each supplied translator for fallback options and plain-text titles', () => {
		expect(entityToOption(unnamed, englishI18n.t).text).to.equal('(unnamed)');
		expect(entityToOption(unnamed, frenchI18n.t).text).to.equal('(sans nom)');
		expect(getEntityLabelText(unnamed, englishI18n.t)).to.equal('Unnamed');
		expect(getEntityLabelText(unnamed, frenchI18n.t)).to.equal('Sans nom');
		expect(getEntityLabelText(deleted, frenchI18n.t)).to.equal('Œuvre supprimé test-bbid');
	});

	it('renders links and headings using their own provider instead of the last initialized locale', () => {
		const markup = renderToStaticMarkup(
			<div>
				<I18nextProvider i18n={englishI18n}>
					<EntityLink entity={unnamed}/>
				</I18nextProvider>
				<I18nextProvider i18n={frenchI18n}>
					<EntityTitle entity={deleted}/>
				</I18nextProvider>
			</div>
		);
		expect(markup).to.contain('(unnamed)');
		expect(markup).to.contain('Œuvre supprimé test-bbid');
	});
});
