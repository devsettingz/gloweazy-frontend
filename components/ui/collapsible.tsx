import { PropsWithChildren, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export function Collapsible({ children, title }: PropsWithChildren<{ title: string }>) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  // Shared value for height
  const height = useSharedValue(0);

  // Ref to measure content
  const contentRef = useRef<View>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(height.value, { duration: 300 }),
      opacity: withTiming(isOpen ? 1 : 0, { duration: 300 }),
    };
  });

  const toggle = () => {
    setIsOpen(!isOpen);

    // Measure content height dynamically
    if (contentRef.current) {
      contentRef.current.measure((x, y, width, measuredHeight) => {
        height.value = isOpen ? 0 : measuredHeight;
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.header, { backgroundColor: Colors[colorScheme].background }]}
        onPress={toggle}
      >
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>{title}</Text>
        <IconSymbol
          name={isOpen ? 'chevron.up' : 'chevron.down'}
          color={Colors[colorScheme].text}
        />
      </TouchableOpacity>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View ref={contentRef}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
});
