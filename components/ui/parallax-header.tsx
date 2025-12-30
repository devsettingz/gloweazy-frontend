import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ThemedView } from '../themed-view';

type Props = {
  headerHeight?: number;
  headerImage: React.ReactNode;
  children: React.ReactNode;
};

export default function ParallaxHeader({ headerHeight = 240, headerImage, children }: Props) {
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const translateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight / 2],
    extrapolate: 'clamp',
  });

  const scale = scrollY.interpolate({
    inputRange: [-headerHeight, 0],
    outputRange: [2, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerContainer, { height: headerHeight, transform: [{ translateY }] }]}>
        <Animated.View style={{ transform: [{ scale }] }}>{headerImage}</Animated.View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerHeight }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <ThemedView style={styles.body}>{children}</ThemedView>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
});
