import { randomInt } from 'node:crypto';

const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?';
const ALL_CHARACTERS = LOWERCASE + UPPERCASE + DIGITS + SYMBOLS;

function randomCharacter(characters: string): string {
  return characters[randomInt(0, characters.length)];
}

export function generateTemporaryPassword(length = 12): string {
  if (length < 4) {
    throw new RangeError('Temporary password length must be at least 4');
  }

  const characters = [
    randomCharacter(LOWERCASE),
    randomCharacter(UPPERCASE),
    randomCharacter(DIGITS),
    randomCharacter(SYMBOLS),
  ];

  while (characters.length < length) {
    characters.push(randomCharacter(ALL_CHARACTERS));
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index + 1);
    [characters[index], characters[swapIndex]] = [
      characters[swapIndex],
      characters[index],
    ];
  }

  return characters.join('');
}
