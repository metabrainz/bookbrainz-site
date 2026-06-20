function isbn13(value: string): boolean {
	const cleaned = value.replace(/[- ]/g, '');
	if (!/^\d{13}$/.test(cleaned)) {
		return false;
	}
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		sum += Number(cleaned.charAt(i)) * ((i % 2) === 0 ? 1 : 3);
	}
	const checkDigit = (10 - (sum % 10)) % 10;
	return checkDigit === Number(cleaned.charAt(12));
}

function isbn10(value: string): boolean {
	const cleaned = value.replace(/[- ]/g, '');
	if (!/^\d{9}[\dX]$/i.test(cleaned)) {
		return false;
	}
	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += Number(cleaned.charAt(i)) * (10 - i);
	}
	const lastChar = cleaned.charAt(9).toUpperCase();
	sum += lastChar === 'X' ? 10 : Number(lastChar);
	return sum % 11 === 0;
}


export const BUILTIN_VALIDATORS: Record<string, (value: string) => boolean> = {
	isbn10,
	isbn13
};

export function getAvailableValidatorNames(): string[] {
	return Object.keys(BUILTIN_VALIDATORS);
}
