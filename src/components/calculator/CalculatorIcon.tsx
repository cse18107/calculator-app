import Svg, { Path } from 'react-native-svg';

export type CalculatorIconName = 'backspace' | 'globe' | 'atom';

type IconDefinition = { viewBox: number; strokeWidth: number; paths: readonly string[] };

/** Path data exported from the OpenPencil design "Column - Basic calculator". */
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
