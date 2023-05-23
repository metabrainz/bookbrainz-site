-- Add new columns for hierarchy, description and deprecation

BEGIN TRANSACTION;

ALTER TABLE bookbrainz.work_type ADD COLUMN description TEXT;
ALTER TABLE bookbrainz.work_type ADD COLUMN parent_id INT;
ALTER TABLE bookbrainz.work_type ADD COLUMN child_order INT NOT NULL DEFAULT 0;
ALTER TABLE bookbrainz.work_type ADD COLUMN deprecated BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookbrainz.work_type ADD FOREIGN KEY (parent_id) REFERENCES bookbrainz.work_type (id);

COMMIT;


-- Add new types and modify existing ones — see https://tickets.metabrainz.org/browse/BB-740

-- Top-level types first
BEGIN TRANSACTION;

	-- Non-fiction, id 8
	UPDATE bookbrainz.work_type
		SET description='Prose work that is not fiction.',
			parent_id=NULL,
			child_order=1
		WHERE id=8;

	-- Poem, id 4
	UPDATE bookbrainz.work_type
		SET description='A work of poetry; a non-prosaic composition that uses stylistic and rhythmic qualities of language to evoke meanings in addition to, or in place of, ostensible meaning. Poetry is very variable and particularly difficult to define; generally any work described as poetry should be considered of the poem work type.',
			parent_id=NULL,
			child_order=2
		WHERE id=4;

	INSERT INTO bookbrainz.work_type ("id","label","description","parent_id","child_order")
	VALUES
		(13,'Fiction','Literary work portraying individuals or events that are imaginary, though it may be based on a true story or situation.',NULL,0);

COMMIT;

-- Then second level types
BEGIN TRANSACTION;
	
	-- Play, id 5
	UPDATE bookbrainz.work_type
		SET description='Work consisting mostly of dialogue and intended to be performed by actors.',
			parent_id=13,
			child_order=2
		WHERE id=5;
	
	-- Novel, id 1
	UPDATE bookbrainz.work_type
		SET description='Prose narrative of considerable length and a certain complexity.',
			parent_id=13,
			child_order=1
		WHERE id=1;

	-- Epic, id 3
	UPDATE bookbrainz.work_type
		SET description='Long narrative poem in which a heroic protagonist engages in an action of great mythic or historical significance.',
			parent_id=4,
			child_order=0
		WHERE id=3;
	
	-- Article, id 6
	UPDATE bookbrainz.work_type
		SET label='Periodical article',
			description='Article typically published in periodical publications, such as newspapers and magazines.',
			parent_id=8,
			child_order=6
		WHERE id=6;
		
	INSERT INTO bookbrainz.work_type ("id","label","description","parent_id","child_order")
	VALUES
		(14,'Short-form fiction','Prose narrative of limited complexity and length, too short to be considered a novel.',13,0),
		(15,'Comics/manga/sequential art','Sequence of panels of images, usually including textual devices such as speech balloons, captions, and onomatopoeia to indicate dialogue, narration, and sound effects.',13,2),
		(16,'Picture book story','A story, generally for young children, with many pictures and a simple narrative. Books consisting of such stories are called picture books.',13,3),
		
		(17,'Introductory text','Text that precedes the main work and offers some sort of introduction to it.',8,0),
		(18,'Conclusion','Text placed after the main work and offering a conclusion to the book.',8,1),
		(19,'Letter','Written message addressed to a person or organization. This work type should be used for real (not fictional) letters only. (Epistolary novels are novels and should not be split into individual letters.)',8,2),
		(20,'Essay','Piece of writing in which the author develops their own argument on some subject.',8,3),
		(21,'Speech','Address delivered to an audience (the written work being the text meant to read or the transcript of such as address).',8,4),
		(22,'Scientific literature','Scholarly work containing firsthand reports of research, often reviewed by experts (primary literature), or synthesizing and condensing what is known on specific topics (secondary literature).',8,5),
		(23,'Biographical literature','Work describing a real person’s life.',8,7),
		(24,'Reference work','Informative work intended for consultation rather than consecutive reading.',8,8),
		(25,'Legal instrument','A formal written legal document.',8,9),
		(26,'Recipe','A set of instructions for making a dish of prepared food. Recipes are generally preceded by the list of necessary ingredients.',8,10),
		
		(27,'Sonnet','A 14-line poem with a variable rhyme scheme originating in Italy, and originally consisting of two quatrains and two tercets. Traditionally, a volta occurs between the eighth and ninth lines (or before the final couplet in the Shakespearean sonnet).',4,1),
		(28,'Ballad','Short narrative poem in rhythmic verse suitable for singing, often in quatrains and rhyming the second and fourth lines.',4,2),
		(29,'Haiku','Originally, a traditional short Japanese poetic form with a 5-7-5 phonetic units pattern, now adapted in different ways in other languages.',4,3),
		(30,'Villanelle','Poetic composition consisting of nineteen lines: five tercets followed by a quatrain, with the first and third lines of the first stanza repeating alternately in the following stanzas, forming refrains, and as the final two lines of the final quatrain.',4,4);

COMMIT;


	
-- Finally, third level types
BEGIN TRANSACTION;

	-- Short Story
	UPDATE bookbrainz.work_type
	SET description='Prose narrative that is shorter than a novel or novella and that usually deals with only a few characters.',
		parent_id=14,
		child_order=0
	WHERE id=2;
	-- Novella
	UPDATE bookbrainz.work_type
	SET description='Prose narrative whose length is shorter and less complex than most novels, but longer and more complex than most short stories.',
		parent_id=14,
		child_order=1
	WHERE id=12;
	
	-- Scientific Paper
	UPDATE bookbrainz.work_type
	SET description='Aliases: research paper, research article. Original full-length manuscript the results of scholarly research in a scientific discipline.',
		parent_id=22,
		child_order=0
	WHERE id=7;
	
	-- Introduction
	UPDATE bookbrainz.work_type
	SET description='Preliminary explanation preceding the main work.',
		parent_id=17,
		child_order=0
	WHERE id=11;
	
	INSERT INTO bookbrainz.work_type ("id","label","description","parent_id","child_order")
	VALUES
		(31,'Stage play','Work in prose or verse consisting mostly of dialogue and intended to be performed by actors on a stage.',5,0),
		(32,'Screenplay','Text that provides the basis for a film production. Besides the dialogue spoken by the characters, screenplays usually also include a shot-by-shot outline of the film’s action.',5,1),
		(33,'Comic strip','A series of comics panels designed in a narrative or chronological order.',15,0),
		(34,'Yonkoma','Alias: 4-koma. Comic strip consisting of four panels of the same size arranged vertically.',15,1),
		(35,'Comics story','Multiple-page work consisting of comics panels, usually in chronological order, that tells a story. Comics stories are typically published in comic books, which can contain multiple stories.',15,2),
		(36,'Graphic novel','Long-form, generally book-length, comics story.',15,3),
		(37,'Foreword','Preliminary text, generally written someone other than the author, introducing the work or the author.',17,0),
		(38,'Preface','Introductory text, generally written by the author of the main work.',17,1),
		(39,'Afterword','Text placed after the main work providing enriching comment, such as how the book came into being or the work’s historical or cultural context.',18,0),
		(40,'Postface','Brief article or explanatory information placed at the end of a book.',18,1),
		(41,'Epistle','Letter, generally didactic and elegant in style, often addressed to a group of people.',19,0),
		(42,'Sermon','A religious discourse delivered by a preacher, generally based on a text of scripture and as part of a worship service.',21,0),
		(43,'Opinion piece','Alias: op-ed. Article expressing the author’s opinion about a subject.',6,0),
		(44,'Editorial','Article, often unsigned, expressing the opinion of the editors or publishers.',6,1),
		(45,'News article','Article relating current or recent news.',6,2),
		(46,'Review','Critical evaluation of an artistic work, performance, or product.',6,3),
		(47,'Interview','The reproduction of a series of questions posed by a member of the press and the answers given by the person being interviewed.',6,4),
		(48,'Biography','Work describing a real person’s life in detail.',23,0),
		(49,'Autobiography','Biography written by the subject themselves.',23,1),
		(50,'Memoir','Autobiographical work distinguished from autobiography by its narrow focus, generally retelling only a specific part of a person’s life.',23,2),
		(51,'Diary','A record of events in one’s life, consisting of daily autobiographical entries. Although there are exceptions, diaries are generally written as personal records with no intention of publication, but notable diaries are sometimes published.',23,3),
		(52,'Dictionary','Lists lexemes and their meanings in the same or in a different language. A dictionary may also provide additional information about the lexemes, such as their pronunciation, grammatical forms and functions, etymologies, and variant spellings.',24,0),
		(53,'Encyclopedia','Aliases: encyclopædia, encyclopaedia. Work providing extensive information on all branches of knowledge arranged into articles or entries.',24,1),
		(54,'Thesaurus','Work that arranges works according to their meaning, or simply lists their synonyms.',24,2),
		(55,'Petrarchan sonnet','Alias: Italian sonnet. Original form of the sonnet with two quatrains and two tercets, which can be joined in an octave and a sextet.',27,0),
		(56,'Shakespearean sonnet','Alias: English sonnet. English variant, with three quatrains followed by a final couplet. The three quatrains can be joined into a stanza.',27,1),
		(57,'Blank verse','Poetic composition that does not rhyme but follows a regular meter. In English, this is almost always iambic pentameter.',28,0),
		(58,'Limerick','Poetic composition consisting of five lines of chiefly anapestic verse, the third and fourth lines of two metrical feet and in the others of three feet, rhyming aabba. Limericks are often humorous, nonsensical, and sometimes lewd.',28,1),
		(59,'Japanese haiku','Traditional Japanese poetic form consisting of three phrases composed of seventeen on (phonetic units) in a 5-7-5 pattern which include a kireji (“cutting word”), and a kigo (seasonal reference).',29,0),
		(60,'Non-Japanese haiku','Adaptation of the haiku form into other languages, sometimes the 5-7-5 on pattern is interpreted as three lines of five, seven and five syllables, although this is not required. Short, concise and impressionistic wording is generally seen as an essential feature, and other haiku characteristics may be ignored or adapted in different ways.',29,1);

COMMIT;
	
	
-- Deprecate existing types (Anthology and Serial)
BEGIN TRANSACTION;

	UPDATE bookbrainz.work_type
	SET deprecated=true, description = 'deprecated'
	WHERE id IN (9,10);

COMMIT;

-- finally, set not null constraint and check in the description column like we do for other text columns
-- We do not do this at the beginning because 'description' is a new column and all values will be NULL until we set them
BEGIN TRANSACTION;
	ALTER TABLE bookbrainz.work_type
		ALTER COLUMN description SET NOT NULL;
	ALTER TABLE bookbrainz.work_type
		ADD CONSTRAINT work_type_description_check CHECK (((description <> ''::text)));
COMMIT;