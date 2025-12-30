import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function ExploreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <IconSymbol
        size={310}
        color="#808080"
        name="chevron.left.forwardslash.chevron.right"
        style={styles.headerImage}
      />

      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>

      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <ThemedText>
        This app has two screens: <ThemedText type="defaultSemiBold">index.tsx</ThemedText> and{' '}
        <ThemedText type="defaultSemiBold">explore.tsx</ThemedText>
      </ThemedText>

      <ThemedText>
        The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText> sets up the tab navigator.
      </ThemedText>

      <ExternalLink href="https://docs.expo.dev/router/introduction">
        <ThemedText type="link">Learn more</ThemedText>
      </ExternalLink>

      <Image
        source={require('@/assets/images/react-logo.png')}
        style={{ width: 100, height: 100, alignSelf: 'center', marginVertical: 20 }}
      />

      <ExternalLink href="https://reactnative.dev/docs/images">
        <ThemedText type="link">Learn more</ThemedText>
      </ExternalLink>

      {Platform.select({
        ios: (
          <ThemedText>
            This screen demonstrates how to build layouts without using ParallaxHeader.
          </ThemedText>
        ),
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerImage: {
    color: '#808080',
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
});
