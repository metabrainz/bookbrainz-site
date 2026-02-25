import {getAcceptedLanguageCodes, parseAcceptLanguage} from '../../../../src/server/helpers/i18n';
import chai from 'chai';


const {expect} = chai;

describe('i18n helpers', () => {
	describe('parseAcceptLanguage', () => {
		it('should parse and sort language tags by q-value', () => {
			const result = parseAcceptLanguage('fr-CA,fr;q=0.8,en;q=0.6');

			expect(result).to.deep.equal([
				{code: 'fr', subtags: ['ca'], weight: 1},
				{code: 'fr', subtags: [], weight: 0.8},
				{code: 'en', subtags: [], weight: 0.6}
			]);
		});

		it('should handle whitespace and normalize casing', () => {
			const result = parseAcceptLanguage(' EN-us ;q=0.9 , FR ; q=0.8 ');

			expect(result).to.deep.equal([
				{code: 'en', subtags: ['us'], weight: 0.9},
				{code: 'fr', subtags: [], weight: 0.8}
			]);
		});

		it('should skip malformed language values', () => {
			const result = parseAcceptLanguage('@@,en;q=0.8,*;q=0.5');

			expect(result).to.deep.equal([
				{code: 'en', subtags: [], weight: 0.8}
			]);
		});

		it('should skip invalid q-values', () => {
			const result = parseAcceptLanguage('de;q=abc,en;q=0.7,fr;q=1.5');

			expect(result).to.deep.equal([
				{code: 'en', subtags: [], weight: 0.7}
			]);
		});
	});

	describe('getAcceptedLanguageCodes', () => {
		it('should return normalized language codes ordered by preference', () => {
			const request = {
				headers: {'accept-language': 'fr-CA;q=0.7,EN;q=0.9'}
			};

			expect(getAcceptedLanguageCodes(request)).to.deep.equal(['en', 'fr']);
		});
	});
});
