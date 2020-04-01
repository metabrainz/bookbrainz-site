import chai from 'chai';
import {getDefaultAliasIndex} from '../../../../../src/server/routes/entity/entity';


const {expect} = chai;

describe('getDefaultAliasIndex', () => {
	const defaultAlias = {
		default: true,
		id: 33,
		name: 'Bob'
	};
	const randomAliases = [
		{
			default: false,
			id: 1,
			name: 'Bob'
		},
		{
			default: false,
			id: 2,
			name: 'John'
		},
		{
			default: false,
			id: 100,
			name: 'Fnord'
		}
	];

	it('should return null if there is not aliasSet', () => {
		expect(getDefaultAliasIndex()).to.be.null;
		expect(getDefaultAliasIndex(null)).to.be.null;
		// eslint-disable-next-line no-undefined
		expect(getDefaultAliasIndex(undefined)).to.be.null;
	});

	it('should return null if there are no aliases in the aliasSet', () => {
		const aliasSet = {
			aliases: null
		};
		expect(getDefaultAliasIndex(aliasSet)).to.be.null;
		aliasSet.aliases = [];
		expect(getDefaultAliasIndex(aliasSet)).to.be.null;
	});

	it('should return 0 if there is no defaultAliasId and no alias marked as default', () => {
		const aliasSet = {
			aliases: randomAliases,
			defaultAliasId: null
		};
		expect(getDefaultAliasIndex(aliasSet)).to.equal(0);
	});

	it('should return the index of the first alias marked as default if there is no defaultAliasId', () => {
		const aliasSet = {
			aliases: [
				randomAliases[0],
				randomAliases[1],
				defaultAlias,
				randomAliases[2],
				defaultAlias
			],
			defaultAliasId: null
		};
		expect(getDefaultAliasIndex(aliasSet)).to.equal(2);
	});
	it("should return the index of the alias matching the set's defaultAliasId", () => {
		const aliasSet = {
			aliases: [...randomAliases, defaultAlias],
			defaultAliasId: 100
		};
		expect(getDefaultAliasIndex(aliasSet)).to.equal(2);
	});
	it("should return the index of the alias matching the set's defaultAliasId if it is a string", () => {
		const aliasSet = {
			aliases: [...randomAliases, defaultAlias],
			defaultAliasId: '100'
		};
		expect(getDefaultAliasIndex(aliasSet)).to.equal(2);
	});
});
