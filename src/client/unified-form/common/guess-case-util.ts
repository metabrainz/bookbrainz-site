export const articles = {
    en: ['the', 'a', 'an'],
    nl: ['de', 'het', 'een', "'t", "'n"],
    no: ['en', 'et', 'den', 'det', 'de'],
    es: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'],
    fr: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de la'],
    de: ['der', 'die', 'das', 'ein', 'eine'],
    it: ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una'],
    pt: ['o', 'a', 'os', 'as', 'um', 'uma'],
    sv: ['en', 'ett', 'den', 'det', 'de'],
    da: ['en', 'et', 'den', 'det', 'de'],
    fi: ['']
};

export const languageParticles = {
    nl: ['van', 'de', 'den', 'der', 'ter', 'van der', 'van den'],
    de: ['von', 'van', 'zu', 'zum', 'zur'],
    fr: ['de', 'du', 'de la', 'des', "d'"],
    es: ['de', 'del', 'de la', 'y'],
    it: ['di', 'de', 'da', 'dal', 'della', 'dei'],
    pt: ['de', 'do', 'da', 'dos', 'das'],
};

export const suffixes = [
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi',
    'xii', 'xiii', 'xiv', 'xv', 'jr', 'junior', 'sr', 'senior', 'phd', 'md',
    'dmd', 'dds', 'esq'
];

/**
 * Removes all period characters (dots) from the input string, returning a new
 * string.
 *
 * @param {String} name the input string to strip
 * @returns {String} the string with dots removed
 */
export function stripDot(name: string): string {
    return name.replace(/\./g, '');
}

export function addSuffixes(nameResult: string, suffixes: string[]): string {
    if (suffixes.length === 0) return nameResult;
    const [lastName, firstName] = nameResult.split(', ');
    return `${lastName} ${suffixes.join(' ')}, ${firstName}`;
}

export function parseDutchName(words: string[], particles: string[]): string | null {
	if (words.length < 2) return null;

	if (words.length >= 3) {
		const twoParticle = `${words[words.length - 3]} ${words[words.length - 2]}`.toLowerCase();
		if (particles.includes(twoParticle)) {
			const lastName = words.slice(-3).join(' ');
			const firstName = words.slice(0, -3).join(' ');
			return `${lastName}, ${firstName}`;
		}
	}

	const particle = words[words.length - 2].toLowerCase();
	if (particles.includes(particle)) {
		const lastName = words.slice(-2).join(' ');
		const firstName = words.slice(0, -2).join(' ');
		return `${lastName}, ${firstName}`;
	}

	return null;
}

export function parseNorwegianName(words: string[]): string | null {
	if (words.length === 3) {
		const lastName = words.slice(1).join(' ');
		const firstName = words[0];
		return `${lastName}, ${firstName}`;
	}

	return null;
}

export function parseSpanishName(words: string[], particles: string[]): string | null {
	if (words.length < 2) return null;
	
	const yIndex = words.findIndex(w => w.toLowerCase() === 'y');
	if (yIndex > 0 && yIndex < words.length - 1) {
		const lastName = words.slice(yIndex - 1).join(' ');
		const firstName = words.slice(0, yIndex - 1).join(' ');
		return `${lastName}, ${firstName}`;
	}
	
	if (words.length >= 3) {
		const lastName = words.slice(-2).join(' ');
		const firstName = words.slice(0, -2).join(' ');
		return `${lastName}, ${firstName}`;
	}
	
	return null;
}

export function parseFrenchName(words: string[], particles: string[]): string | null {
	if (words.length < 3) return null;

	const particle = words[words.length - 2].toLowerCase();
	if (particles.includes(particle)) {
		const lastName = words.slice(-2).join(' ');
		const firstName = words.slice(0, -2).join(' ');
		return `${lastName}, ${firstName}`;
	}

	return null;	
}

export function parseGermanName(words: string[], particles: string[]): string | null {
	if (words.length < 3) return null;

	const particle = words[words.length - 2].toLowerCase();
	if (particles.includes(particle)) {
		const lastName = words.slice(-2).join(' ');
		const firstName = words.slice(0, -2).join(' ');
		return `${lastName}, ${firstName}`;
	}

	return null;	
}

export function parseItalianName(words: string[], particles: string[]): string | null {
	if (words.length < 3) return null;
	
	const particle = words[words.length - 2].toLowerCase();
	if (particles.includes(particle)) {
		const lastName = words.slice(-2).join(' ');
		const firstName = words.slice(0, -2).join(' ');
		return `${lastName}, ${firstName}`;
	}
	
	return null;
}

export function parsePortugueseName(words: string[], particles: string[]): string | null {
	if (words.length < 3) return null;
	
	const particle = words[words.length - 2].toLowerCase();
	if (particles.includes(particle)) {
		const lastName = words.slice(-2).join(' ');
		const firstName = words.slice(0, -2).join(' ');
		return `${lastName}, ${firstName}`;
	}
	
	return null;
}
	
export function parseScandinavianName(words: string[]): string | null {
	if (words.length === 3) {
		const lastName = words.slice(1).join(' ');
		const firstName = words[0];
		return `${lastName}, ${firstName}`;
	}
	return null;
}

export function parseEasternName(name: string): string {
	return name;
}

export function parseRussianName(words: string[]): string | null {
	if (words.length >= 3) {
		const lastName = words[words.length - 1];
		const firstName = words.slice(0, -1).join(' ');
		return `${lastName}, ${firstName}`;
	}
	return null;
}

export function makeSortName(name: string, language?: string): string {
    const lang = language || 'en';
    /*
     * Remove leading and trailing spaces, and return a blank sort name if
     * the string is empty
     */
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        return '';
    }

    const words = trimmedName.replace(/,/g, '').split(' ');

    // If there's only one word, simply copy the name as the sort name
    if (words.length === 1) {
        return trimmedName;
    }
    
    // First, check if sort name is for collective, by detecting article
    const firstWord = stripDot(words[0]);
    const article = articles[lang] || articles.en;
    if (article.length > 0 && article.includes(firstWord.toLowerCase())) {
        // The Collection of Stories --> Collection of Stories, The
        return `${words.slice(1).join(' ')}, ${firstWord}`;
    }

    /*
     * From here on, it is assumed that the sort name is for a person
     * Split suffixes
     */
    const isWordSuffix =
        words.map((word) => suffixes.includes(stripDot(word).toLowerCase()));
    const lastSuffix = isWordSuffix.lastIndexOf(false) + 1;

    // Test this to check that splice will not have a 0 deleteCount
    const suffixWords =
        lastSuffix < words.length ? words.splice(lastSuffix) : [];

    if (lang === 'nl') {
        const result = parseDutchName(words, languageParticles.nl);
        if (result) return addSuffixes(result, suffixWords);
    }
    if (lang === 'no' || lang === 'nb' || lang === 'nn') {
        const result = parseNorwegianName(words);
        if (result) return addSuffixes(result, suffixWords);
    }
    if (lang === 'es') {
        const result = parseSpanishName(words, languageParticles.es);
        if (result) return addSuffixes(result, suffixWords);
    }
    if (lang === 'fr') {
        const result = parseFrenchName(words, languageParticles.fr);
        if (result) return addSuffixes(result, suffixWords);
    }
    if (lang === 'de') {
        const result = parseGermanName(words, languageParticles.de);
        if (result) return addSuffixes(result, suffixWords);
    }
    if (lang === 'it') {
        const result = parseItalianName(words, languageParticles.it);
        if (result) return addSuffixes(result, suffixWords);
    }
    if (lang === 'pt') {
        const result = parsePortugueseName(words, languageParticles.pt);
        if (result) return addSuffixes(result, suffixWords);
    }
    if (lang === 'sv' || lang === 'da') {
        const result = parseScandinavianName(words);
        if (result) return addSuffixes(result, suffixWords);
    }
    
    if (lang === 'ja' || lang === 'zh' || lang === 'ko' || lang === 'hu') {
        return parseEasternName(trimmedName);
    }
    
    if (lang === 'ru') {
        const result = parseRussianName(words);
        if (result) return addSuffixes(result, suffixWords);
    }

    // Rearrange names to (last name, other names)
    const INDEX_BEFORE_END = -1;

    let [lastName] = words.splice(INDEX_BEFORE_END);
    if (suffixWords.length > 0) {
        lastName += ` ${suffixWords.join(' ')}`;
    }

    return `${lastName}, ${words.join(' ')}`;
}