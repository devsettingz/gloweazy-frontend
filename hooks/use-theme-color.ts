import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

const themeColors: Record<Theme, Record<string, string>> = {
  light: {
    background: '#fff',
    text: '#000',
  },
  dark: {
    background: '#000',
    text: '#fff',
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
): string {
  const theme: Theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return themeColors[theme][colorName];
}
