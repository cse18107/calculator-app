import Svg, { Path } from 'react-native-svg';

export type CalculatorIconName =
  | 'backspace'
  | 'globe'
  | 'atom'
  | 'pin'
  | 'calculator'
  | 'share'
  | 'trash'
  | 'cornerDownLeft'
  | 'close'
  | 'check'
  | 'filter';

type IconDefinition = { viewBox: number; strokeWidth: number; paths: readonly string[] };

/** Path data exported from the OpenPencil design "Column - Basic calculator" and "Column - Calculation History". */
const ICONS: Record<CalculatorIconName, IconDefinition> = {
  backspace: {
    viewBox: 22,
    strokeWidth: 1.83,
    paths: [
      'M9.17 4.58C8.71 4.58 8.27 4.75 7.93 5.06L2.13 10.32C1.94 10.49 1.83 10.74 1.83 11C1.83 11.26 1.94 11.51 2.13 11.68L7.93 16.94C8.27 17.25 8.71 17.42 9.17 17.42L18.33 17.42C18.82 17.42 19.29 17.23 19.63 16.88C19.98 16.54 20.17 16.07 20.17 15.58L20.17 6.42C20.17 5.93 19.98 5.46 19.63 5.12C19.29 4.77 18.82 4.58 18.33 4.58L9.17 4.58Z',
      'M11 8.25L16.5 13.75M16.5 8.25L11 13.75',
    ],
  },
  globe: {
    viewBox: 18,
    strokeWidth: 1.5,
    paths: [
      'M1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5C4.86 1.5 1.5 4.86 1.5 9',
      'M9 1.5C5 5.7 5 12.3 9 16.5C13 12.3 13 5.7 9 1.5M1.5 9L16.5 9',
    ],
  },
  atom: {
    viewBox: 18,
    strokeWidth: 1.5,
    paths: [
      'M8.25 9C8.25 9.41 8.59 9.75 9 9.75C9.41 9.75 9.75 9.41 9.75 9C9.75 8.59 9.41 8.25 9 8.25C8.59 8.25 8.25 8.59 8.25 9Z',
      'M15.15 15.15C16.68 13.63 15.16 9.63 11.77 6.22C8.36 2.83 4.37 1.31 2.85 2.85C1.32 4.37 2.84 8.37 6.22 11.77C9.63 15.16 13.62 16.68 15.15 15.15',
      'M11.77 11.77C15.16 8.36 16.68 4.37 15.15 2.85C13.63 1.32 9.63 2.84 6.22 6.22C2.83 9.63 1.31 13.62 2.85 15.15C4.37 16.68 8.37 15.16 11.78 11.77',
    ],
  },
  pin: {
    viewBox: 16,
    strokeWidth: 1.33,
    paths: [
      'M6 7.17C6 7.68 5.72 8.14 5.26 8.37L4.07 8.97C3.62 9.19 3.33 9.66 3.33 10.16L3.33 10.67C3.34 11.04 3.63 11.33 4 11.33L12 11.33C12.37 11.33 12.66 11.04 12.67 10.67L12.67 10.16C12.67 9.66 12.38 9.19 11.93 8.97L10.74 8.37C10.28 8.14 10 7.68 10 7.17L10 4.67C10 4.3 10.3 4 10.67 4C11.41 4 12.01 3.4 12.01 2.66C12.01 1.93 11.41 1.33 10.67 1.33L5.33 1.33C4.59 1.33 3.99 1.93 3.99 2.66C3.99 3.4 4.59 4 5.33 4C5.7 4 6 4.3 6 4.67L6 7.17Z',
      'M8 11.33L8 14.67',
    ],
  },
  calculator: {
    viewBox: 16,
    strokeWidth: 1.33,
    paths: [
      'M4 1.33L12 1.33C12.35 1.33 12.69 1.47 12.94 1.72C13.19 1.97 13.33 2.32 13.33 2.67L13.33 13.33C13.33 13.68 13.19 14.03 12.94 14.28C12.69 14.53 12.35 14.67 12 14.67L4 14.67C3.65 14.67 3.31 14.53 3.06 14.28C2.81 14.03 2.67 13.68 2.67 13.33L2.67 2.67C2.67 2.32 2.81 1.97 3.06 1.72C3.31 1.47 3.65 1.33 4 1.33',
      'M5.33 4L10.67 4M10.67 9.33L10.67 12M10.67 6.67L10.67 6.67ZM8 6.67L8.01 6.67M5.33 6.67L5.34 6.67M8 9.33L8.01 9.33M5.33 9.33L5.34 9.33M8 12L8.01 12M5.33 12L5.34 12',
    ],
  },
  share: {
    viewBox: 16,
    strokeWidth: 1.33,
    paths: [
      'M10 3.33C10 4.43 10.9 5.33 12 5.33C13.1 5.33 14 4.43 14 3.33C14 2.23 13.1 1.33 12 1.33C10.9 1.33 10 2.23 10 3.33',
      'M2 8C2 9.1 2.9 10 4 10C5.1 10 6 9.1 6 8C6 6.9 5.1 6 4 6C2.9 6 2 6.9 2 8Z',
      'M10 12.67C10 13.77 10.9 14.67 12 14.67C13.1 14.67 14 13.77 14 12.67C14 11.57 13.1 10.67 12 10.67C10.9 10.67 10 11.57 10 12.67Z',
      'M5.73 9.01L10.28 11.66M10.27 4.34L5.73 6.99',
    ],
  },
  trash: {
    viewBox: 16,
    strokeWidth: 1.33,
    paths: [
      'M6.67 7.33L6.67 11.33M9.33 7.33L9.33 11.33M12.67 4L12.67 13.33C12.67 13.69 12.53 14.03 12.28 14.28C12.03 14.53 11.69 14.67 11.33 14.67L4.67 14.67C4.31 14.67 3.97 14.53 3.72 14.28C3.47 14.03 3.33 13.69 3.33 13.33L3.33 4M2 4L14 4M5.33 4L5.33 2.67C5.33 2.31 5.47 1.97 5.72 1.72C5.97 1.47 6.31 1.33 6.67 1.33L9.33 1.33C9.69 1.33 10.03 1.47 10.28 1.72C10.53 1.97 10.67 2.31 10.67 2.67L10.67 4',
    ],
  },
  cornerDownLeft: {
    viewBox: 12,
    strokeWidth: 1,
    paths: ['M10 2L10 5.5C10 6.6 9.1 7.5 8 7.5L2 7.5', 'M4.5 5L2 7.5L4.5 10'],
  },
  close: {
    viewBox: 12,
    strokeWidth: 1,
    paths: ['M9 3L3 9M3 3L9 9'],
  },
  check: {
    viewBox: 12,
    strokeWidth: 1.2,
    paths: ['M10 3L4.5 8.5L2 6'],
  },
  filter: {
    viewBox: 10,
    strokeWidth: 0.83,
    paths: ['M9.17 1.25L0.83 1.25L4.17 5.19L4.17 7.92L5.83 8.75L5.83 5.19L9.17 1.25Z'],
  },
};

export type CalculatorIconProps = {
  name: CalculatorIconName;
  /** Rendered size in points. Use `iconSize` tokens. */
  size: number;
  /** Stroke colour. Use a palette token. */
  color: string;
};

/** Outline icon from the design. Drawn with react-native-svg. */
export function CalculatorIcon({ name, size, color }: CalculatorIconProps) {
  const icon = ICONS[name];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${icon.viewBox} ${icon.viewBox}`}>
      {icon.paths.map((d) => (
        <Path
          key={d}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={icon.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
