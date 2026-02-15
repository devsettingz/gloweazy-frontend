import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../constants/luxuryTheme';

export default function SignupSuccessScreen() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)/profile-setup');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)/profile-setup');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.light} style={styles.background} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={120} color={COLORS.success} />
        </View>

        {/* Success Text */}
        <Text style={styles.title}>Welcome Aboard!</Text>
        <Text style={styles.subtitle}>Your account has been created</Text>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Ionicons name="mail" size={24} color={COLORS.primary} style={styles.messageIcon} />
          <Text style={styles.messageText}>
            We&apos;ve sent a verification email to you. Please verify your account to unlock all features.
          </Text>
        </View>

        {/* Next Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Next Steps:</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Complete your profile</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Browse top stylists</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Book your first appointment</Text>
          </View>
        </View>

        {/* Continue Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.continueButtonGradient}>
              <Text style={styles.continueButtonText}>Complete Profile</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.ivory} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Auto-continue hint */}
        <Text style={styles.hint}>Continuing automatically in 3 seconds...</Text>
      </Animated.View>
    </View>
  );
}

// Add TouchableOpacity import
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...{
      shadowColor: COLORS.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
    fontFamily: TYPOGRAPHY.serif,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.h4,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.ivory,
    padding: SPACING.lg,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  stepsTitle: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600',
    color: COLORS.charcoal,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  stepText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...{
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  continueButtonGradient: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  continueButtonText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.ivory,
    letterSpacing: 0.5,
  },
  hint: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
});
