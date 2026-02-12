// Fallback for using MaterialIcons on Android and web.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Core navigation
  'house.fill': 'home',
  'sparkles': 'star',
  'square.and.pencil': 'edit',
  'gearshape.fill': 'settings',
  'person.fill': 'person',
  'bell.fill': 'notifications',

  // Communication
  'paperplane.fill': 'send',
  'envelope.fill': 'mail',
  'phone.fill': 'call',

  // Media & files
  'photo.fill': 'image',
  'video.fill': 'videocam',
  'doc.fill': 'description',

  // Actions
  'plus': 'add',
  'minus': 'remove',
  'trash.fill': 'delete',
  'magnifyingglass': 'search',

  // Navigation arrows
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',

  // Status
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'exclamationmark.triangle.fill': 'warning',
} as IconMapping;
/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name] ?? 'help'; // fallback if unmapped
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
