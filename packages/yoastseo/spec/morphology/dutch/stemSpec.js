import stem from "../../../src/morphology/dutch/stem";

const wordsToStem = [
	// -heden stemmed to -heid
	[ "mogelijkheden", "mogelijkheid" ],
	// Suffix category b (-en) preceded by a valid -en ending.
	[ "vrouwen", "vrouw" ],
	// // Suffix category b (-en) not preceded by a valid -en ending.
	[ "groen", "groen" ],
	// Suffix category b (-en). R1 preceded by less than 3 characters.
	[ "den", "den" ],
	// Suffix category b (-en) with undoubling of consonant
	[ "bakken", "bak" ],
	// Suffix category c (-s) preceded by a valid -s ending
	[ "torens", "toren" ],
	// Suffix category c (-s) not preceded by a valid -s ending.
	[ "prijs", "prijs" ],
	// Step 2 suffix preceded by a valid -e ending.
	[ "kleine", "klein" ],
	// Step 2 suffix not preceded by a valid -e ending.
	[ "missie", "missie" ],
	// A word without an R1.
	[ "zo", "zo" ],
	// A word with a vowel that should be treated like a consonant
	[ "groeien", "groei" ],
	// A word that needs to have the vowel undoubled
	[ "maan", "man" ],
	// Diminutive noun type a.
	[ "dingetje", "ding" ],
	// Diminutive noun type b.
	[ "baby'tje", "baby" ],
	// Diminutive noun type c.
	[ "vrouwtje", "vrouw" ],
	// Diminutive noun type d.
	[ "rectortje", "rector" ],
	// Diminutive noun type e.
	[ "alligatortje", "alligator" ],
	// Diminutive noun type f.
	[ "filmpje", "film" ],
	// Diminutive noun type g.
	[ "kostuumpje", "kostum" ],
	// Diminutive noun type h.
	[ "kindje", "kind" ],
	// Diminutive noun type h ending in -inkje.
	[ "kettinkje", "ketting" ],
	// Diminutive noun type i.
	[ "kuchje", "kuch" ],
	// Plural diminutive noun.
	[ "schaapjes", "schap" ],
	// A word with the -s suffix preceded by an apostrophe.
	[ "firma's", "firma" ],
	// A word with the -ën suffix.
	[ "allergieën", "allergie" ],
	// A word with the -en suffix preceded by a vowel + i.
	[ "aardbeien", "aardbei" ],
	// A word with the comparative suffix -rder.
	[ "lekkerder", "lekker" ],
	// A word with the comparative suffix -ere.
	[ "warmere", "warm" ],
	// A word with the comparative suffix -ere preceded by d.
	[ "koudere", "koud" ],
	// A word with the comparative suffix -ër.
	[ "tevreeër", "tevree" ],
	// A word with the superlative suffix -st.
	[ "warmst", "warm" ],
	// A word with the comparative suffix -st preceded by a vowel and e.
	[ "tevreest", "tevree" ],
	// A word with the comparative suffix -est.
	[ "mooiest", "mooi" ],

];

describe( "Test for stemming Dutch words", () => {
	it( "stems Dutch nouns", () => {
		wordsToStem.forEach( wordToStem => expect( stem( wordToStem[ 0 ] ) ).toBe( wordToStem[ 1 ] ) );
	} );
} );