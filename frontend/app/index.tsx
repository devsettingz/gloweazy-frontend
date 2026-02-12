/**
 * GlowEazy Home Screen - Luxury Edition
 * Premium landing page with sophisticated aesthetics
 */

import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, RADIUS, GRADIENTS } from '../constants/luxuryTheme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Background Gradient */}
      <LinearGradient
        colors={GRADIENTS.light}
        style={styles.background}
      />

      {/* Decorative Elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Logo / Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={GRADIENTS.gold}
              style={styles.logoGradient}
            >
              <Text style={styles.logoIcon}>✦</Text>
            </LinearGradient>
          </View>
          <Text style={styles.brandName}>GlowEazy</Text>
          <Text style={styles.tagline}>Luxury Beauty & Wellness</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Book premium beauty services with ease</Text>
        </View>

        {/* Main Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Continue as Client</Text>
              <Text style={styles.buttonSubtext}>Book appointments & services</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <View style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Continue as Stylist</Text>
              <Text style={styles.buttonSubtextDark}>Manage your business</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => router.push('/signup')}
            activeOpacity={0.7}
          >
            <Text style={styles.tertiaryButtonText}>Create an Account</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Link */}
        <TouchableOpacity
          style={styles.adminLink}
          onPress={() => router.push('/admin/api-status')}
        >
          <Text style={styles.adminLinkText}>Developer API Testing</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Premium beauty experiences await</Text>
          <View style={styles.footerDivider} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: '100%',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.3,
    top: -100,
    right: -100,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.blush,
    opacity: 0.4,
    bottom: 100,
    left: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
    paddingBottom: SPACING.xxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  logoIcon: {
    fontSize: 36,
    color: COLORS.ivory,
    fontWeight: '300',
  },
  brandName: {
    fontSize: 42,
    fontWeight: '300',
    color: COLORS.charcoal,
    letterSpacing: 4,
    marginBottom: SPACING.xs,
    fontFamily: TYPOGRAPHY.serif,
  },
  tagline: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.primary,
    marginVertical: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  buttonWrapper: {
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft,
  },
  primaryButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.ivory,
    letterSpacing: 1,
  },
  buttonSubtext: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.ivory,
    opacity: 0.9,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: COLORS.ivory,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.charcoal,
    letterSpacing: 1,
  },
  buttonSubtextDark: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  tertiaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  tertiaryButtonText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.primaryDark,
    fontWeight: '500',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  adminLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
  },
  adminLinkText: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.primaryLight,
    marginTop: SPACING.md,
  },
});
