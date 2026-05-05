export const COLORS = {
  gray: '#727272ff',
  blue: '#1867ddff',
  green: '#2ffa14ff',
  orange: '#ee752fff',
  yellow: '#f5f071',
  red: '#ff0000',
};

export const METHOD_COLOR_MAP = {
  Landfilling: COLORS.gray,
  Recycling: COLORS.blue,
  Composting: COLORS.green,
  'Energy Recovery': COLORS.orange,
};

const createColorScale = (domain: string[]) => ({
  color: {
    domain,
    range: domain.map((key) => METHOD_COLOR_MAP[key]),
  },
});

// Disposal
export const DISPOSAL_METHOD_COLOR_DOMAIN = [
  'Landfilling',
  'Recycling',
  'Composting',
  'Energy Recovery',
];

export const DISPOSAL_METHOD_COLOR_SCALE = createColorScale(DISPOSAL_METHOD_COLOR_DOMAIN);

// Diversion
export const DIVERSION_METHOD_COLOR_DOMAIN = ['Recycling', 'Composting', 'Energy Recovery'];

export const DIVERSION_METHOD_COLOR_SCALE = createColorScale(DIVERSION_METHOD_COLOR_DOMAIN);

export const DEFAULT_WASTE_BAR_COLOR = COLORS.blue;
