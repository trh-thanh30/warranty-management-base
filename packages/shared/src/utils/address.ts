const WORD_SEPARATOR_PATTERN = /[^\p{L}\p{N}]+/u;

export function containsDisallowedVietnamAddressDetailUnit(value: string) {
  const words = value
    .toLocaleLowerCase("vi")
    .split(WORD_SEPARATOR_PATTERN)
    .filter(Boolean);

  return words.some((word, index) => {
    const previousWord = words[index - 1];
    const nextWord = words[index + 1];

    if (word === "phường") return true;
    if (word === "phuong") return nextWord !== undefined;

    if (word === "xã" || word === "xa") {
      const isTown = previousWord === "thị" || previousWord === "thi";
      const isStreetName =
        previousWord === "đường" ||
        previousWord === "duong" ||
        previousWord === "phố" ||
        previousWord === "pho";

      if (isTown || isStreetName) return false;
      return word === "xã" || nextWord !== undefined;
    }

    if (word === "tỉnh" || word === "tinh") {
      const isProvincialRoad = nextWord === "lộ" || nextWord === "lo";
      if (isProvincialRoad) return false;
      return word === "tỉnh" || nextWord !== undefined;
    }

    return (
      (word === "thành" || word === "thanh") &&
      (nextWord === "phố" || nextWord === "pho")
    );
  });
}
