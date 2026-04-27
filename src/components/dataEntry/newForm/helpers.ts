const WASTE_PAIR_SEPARATOR = '::';

export const getWastePairKey = (disposalMethodId: string, wasteTypeId: string): string =>
  `${disposalMethodId}${WASTE_PAIR_SEPARATOR}${wasteTypeId}`;
