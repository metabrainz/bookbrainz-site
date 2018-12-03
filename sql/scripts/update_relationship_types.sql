BEGIN;

UPDATE bookbrainz.relationship_type
	SET
		deprecated=true,
		link_phrase='is an edition of',
		reverse_link_phrase='has an edition',
		source_entity_type='Edition',
		target_entity_type='Publication'
	WHERE id=3;

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Marriage',
	'This links artists who were or are married.',
	'is/was married to',
	'is/was married to',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Involved With',
	'Indicates that two persons were romantically involved with each other without being married.',
	'is/was involved with',
	'is/was involved with',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Member of Group',
	'This indicates a person is a member of a group.',
	'is/was a member of',
	'has/had a member',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Parent',
	'Indicates a parent-child relationship.',
	'is the parent of',
	'is the child of',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Sibling',
	'This links two siblings (brothers or sisters).',
	'is the sibling of',
	'is the sibling of',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Subgroup',
	'This links a subgroup to the group from which it was created. This relationship type is the functional equivalent of the member of group type for group-group relationships.',
	'is/was a subgroup of',
	'has/had a subgroup',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Founder',
	'This indicates a creator (generally a person) was the founder of a group.',
	'was a founder of',
	'was founded by',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Pen Name',
	'This links an author''s pen name with their legal name.',
	'is/was a pen name of',
	'is/was the legal name of',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Collaboration',
	'This is used to specify that a creator collaborated on a short-term project, for cases where creator credits can''t be used.',
	'is/was a collaborator on',
	'has/had a collaborator',
	'Creator',
	'Creator'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Founded',
	'This relationship type can be used to link a publisher to the person or people who founded it.',
	'was a founder of',
	'was founded by',
	'Creator',
	'Publisher'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Employee',
	'Indicates that a creator is or was an employee of a publisher.',
	'is/was employed by',
	'is/was an employer of',
	'Creator',
	'Publisher'
);

UPDATE bookbrainz.relationship_type
	SET
		link_phrase='edited',
		reverse_link_phrase='was edited by',
		description='Indicates that a creator was the person responsible for editing a work to create an edition.',
		source_entity_type='Creator',
		target_entity_type='Edition'
	WHERE id=5;

UPDATE bookbrainz.relationship_type
	SET
		label='Illustrator',
		link_phrase='illustrated',
		reverse_link_phrase='was illustrated by',
		description='Indicates that a creator was the person responsible for illustrating an edition.',
		source_entity_type='Creator',
		target_entity_type='Edition'
	WHERE id=2;

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Proofreader',
	'Indicates that a creator was the person responsible for proofreading an edition.',
	'proofread',
	'was proofread by',
	'Creator',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Compiler',
	'Indicates that a creator was the person responsible for compiling an edition (for example, an anthology).',
	'compiled',
	'was compiled by',
	'Creator',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Designer',
	'Indicates that a creator was the person responsible for designing some aspect of an edition.',
	'designed',
	'was designed by',
	'Creator',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Typsetter',
	'Indicates that a creator was the person responsible for typesetting an edition.',
	'typeset',
	'was typeset by',
	'Creator',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Photographer',
	'Indicates that a creator provided photography for an edition.',
	'provided photography for',
	'has photography provided by',
	'Creator',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Blurb',
	'Indicates that a creator wrote the blurb for an edition.',
	'wrote blurb for',
	'has blurb written by',
	'Creator',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Art Director',
	'Indicates that a creator provided art direction for an edition.',
	'was the art director for',
	'has art direction provided by',
	'Creator',
	'Edition'
);

UPDATE bookbrainz.relationship_type
	SET
		label='Author',
		link_phrase='wrote',
		reverse_link_phrase='was written by',
		description='This relationship is used to link a work to its author.',
		source_entity_type='Creator',
		target_entity_type='Work'
	WHERE id=8;

UPDATE bookbrainz.relationship_type
	SET
		label='Translator',
		link_phrase='translated',
		reverse_link_phrase='was translated by',
		description='Indicates that a creator produced a work which is the translation of another work.',
		source_entity_type='Creator',
		target_entity_type='Work'
	WHERE id=9;

UPDATE bookbrainz.relationship_type
	SET
		label='Worked On',
		link_phrase='worked on',
		reverse_link_phrase='was worked on by',
		description='Indicates that a creator had some creative input into a work.',
		source_entity_type='Creator',
		target_entity_type='Work'
	WHERE id=1;

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Illustrator',
	'Indicates that a creator was the person responsible for illustrating a work, where the illustrations are a key part of the work (for example, a picture book or comic).',
	'illustrated',
	'was illustrated by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Inker',
	'Indicates that a creator was the person responsible for inking a work (usually a comic book).',
	'inked',
	'was inked by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Story',
	'Indicates that a creator provided the story for a work (usually a comic book).',
	'provided story for',
	'has story provided by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Letterer',
	'Indicates that a creator was the person responsible for lettering a work (usually a comic book).',
	'lettered',
	'was lettered by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Artist',
	'Indicates that a creator was the artist for a particular work.',
	'provided art for',
	'has art provided by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Revisor',
	'Indicates that a creator revised a work to create a new work, which is a revision of the original work.',
	'revised',
	'was revised by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Reconstructed',
	'Indicates that a creator reconstructed a work from incomplete fragments of an original, previously lost work.',
	'reconstructed',
	'was reconstructed by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Dedication',
	'Indicates that a work is dedicated to a particular creator',
	'has a dedication in',
	'is dedicated to',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Previous Attribution',
	'Indicates that a work was previously attributed to a creator, until the true creator was known',
	'previously had the attribution for',
	'was previously attributed to',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Commission',
	'Indicates that a work was commissioned by a particular creator',
	'commissioned',
	'was commissioned by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Licensor',
	'Indicates that a work was licensed by a particular creator (usually, the original author of a particular element used in the work)',
	'licensed',
	'was licensed by',
	'Creator',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Owner',
	'Indicates that one publisher owns another publisher',
	'is/was the owner of',
	'is/was owned by',
	'Publisher',
	'Publisher'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Renamed',
	'Indicates that a publisher was renamed, and links the publishers under the old and new names',
	'was renamed to',
	'was renamed from',
	'Publisher',
	'Publisher'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Split',
	'Indicates the link between a publisher and (one of) its successor(s), where a publisher has been split',
	'was split to',
	'was split from',
	'Publisher',
	'Publisher'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Split',
	'Indicates the link between a publisher and (one of) its predecessor(s), where several publishers have been merged.',
	'was merged from',
	'was merged to',
	'Publisher',
	'Publisher'
);

UPDATE bookbrainz.relationship_type
	SET
		link_phrase='published',
		reverse_link_phrase='published by',
		description='Represents the relationship between a publisher, and an edition published by that publisher.',
		source_entity_type='Publisher',
		target_entity_type='Edition'
	WHERE id=4;

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Copyright',
	'Indicates that a publisher holds the copyright for an edition.',
	'holds the copyright for',
	'is copyright by',
	'Publisher',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Licensor',
	'Indicates that an edition was licensed by a publisher (for example, when a publisher holds the rights to an edition but allows another publisher to publish).',
	'licensed',
	'was licensed by',
	'Publisher',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Licensee',
	'Indicates that an edition was licensed to a publisher (for example, when a publisher holds the rights to an edition but allows another publisher to publish).',
	'licensee',
	'was licensed to',
	'Publisher',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Manufactured',
	'Indicates that an edition was manufactured (printed) by a publisher.',
	'manufactured',
	'was manufactured by',
	'Publisher',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Promoted',
	'Indicates that an edition was promoted (marketed) by a publisher.',
	'promoted',
	'was promoted by',
	'Publisher',
	'Edition'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Distributed',
	'Indicates that an edition was distributed by a publisher.',
	'distributed',
	'was distributed by',
	'Publisher',
	'Edition'
);


INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Commission',
	'Indicates that a work was commissioned by a particular publisher',
	'commissioned',
	'was commissioned by',
	'Publisher',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Licensor',
	'Indicates that a work was licensed by a particular publisher',
	'licensed',
	'was licensed by',
	'Publisher',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Revision',
	'Indicates that one edition is a revision of another',
	'is a revision of',
	'was revised to',
	'Edition',
	'Edition'
);

UPDATE bookbrainz.relationship_type
	SET
		link_phrase='contains',
		reverse_link_phrase='is contained in',
		description='Represents the relationship between an edition, and a work which is contained in that edition.',
		source_entity_type='Edition',
		target_entity_type='Work'
	WHERE id=10;

UPDATE bookbrainz.relationship_type
	SET
		link_phrase='inspired',
		reverse_link_phrase='was inspired by',
		source_entity_type='Work',
		target_entity_type='Work'
	WHERE id=6;

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Quotation',
	'Indicates that one work quotes another work',
	'quotes',
	'is quoted by',
	'Work',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Part',
	'Indicates that one work is a part of another work',
	'is part of',
	'has a part',
	'Work',
	'Work'
);


INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Derivative',
	'Indicates that one work is a derivative, or is based on another work',
	'is derived from',
	'has a derivative',
	'Work',
	'Work'
);

INSERT INTO bookbrainz.relationship_type (
	label,
	description,
	link_phrase,
	reverse_link_phrase,
	source_entity_type,
	target_entity_type
) VALUES (
	'Translation',
	'Indicates that one work is a translation of another work',
	'is a translation of',
	'was translated to',
	'Work',
	'Work'
);

UPDATE bookbrainz.relationship_type
	SET
		link_phrase='is a parody of',
		reverse_link_phrase='was parodied in',
		description='Indicates that one work is a parody of another work',
		source_entity_type='Work',
		target_entity_type='Work'
	WHERE id=7;

COMMIT;
