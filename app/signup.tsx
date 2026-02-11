/**
 * Luxury Signup Screen
 * Elegant account creation with premium aesthetics
 */

import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LoadingOverlay from '../components/LoadingOverlay';
import { useAuth } from '../context/AuthContext';
import { signup as apiSignup } from '../utils/api';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, RADIUS, GRADIENTS } from '../constants/luxuryTheme';

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'stylist'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignup = async () => {
    if (!email || !password || password !== confirmPassword) return;
    setLoading(true);
    try {
      const { user, token } = await apiSignup({ email, password, role });
      await login(user, token);
      router.replace('/(tabs)/profile-setup');
    } catch (err: any) {
      // Toast error handled by API
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const canSubmit = email && password && confirmPassword && passwordsMatch;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading && <LoadingOverlay message="Creating your account..." />}

        {/* Background */}
        <LinearGradient colors={GRADIENTS.light} style={styles.background} />

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.charcoal} />
          </TouchableOpacity>
        </Animated.View>

        {/* Title Section */}
        <Animated.View
          style={[
            styles.titleSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.greeting}>Create Account</Text>
          <Text style={styles.subtitle}>Begin your luxury beauty journey</Text>
        </Animated.View>

        {/* Role Selection */}
        <Animated.View
          style={[
            styles.roleSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionLabel}>I am a</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
              onPress={() => setRole('client')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={role === 'client' ? GRADIENTS.gold : ['transparent', 'transparent']}
                style={styles.roleButtonGradient}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={role === 'client' ? COLORS.ivory : COLORS.charcoal}
                />
                <Text style={[styles.roleButtonText, role === 'client' && styles.roleButtonTextActive]}>
                  Client
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, role === 'stylist' && styles.roleButtonActive]}
              onPress={() => setRole('stylist')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={role === 'stylist' ? GRADIENTS.gold : ['transparent', 'transparent']}
                style={styles.roleButtonGradient}
              >
                <Ionicons
                  name="cut-outline"
                  size={20}
                  color={role === 'stylist' ? COLORS.ivory : COLORS.charcoal}
                />
                <Text style={[styles.roleButtonText, role === 'stylist' && styles.roleButtonTextActive]}>
                  Stylist
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Form */}
        <Animated.View
          style={[
            styles.formContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'email' && styles.inputContainerFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={focusedField === 'email' ? COLORS.primary : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'password' && styles.inputContainerFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={focusedField === 'password' ? COLORS.primary : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Create a password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'confirm' && styles.inputContainerFocused,
                confirmPassword && !passwordsMatch && styles.inputContainerError,
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={
                  confirmPassword && !passwordsMatch
                    ? COLORS.error
                    : focusedField === 'confirm'
                    ? COLORS.primary
                    : COLORS.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {confirmPassword && !passwordsMatch && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signupButton, !canSubmit && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={!canSubmit || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canSubmit ? GRADIENTS.gold : ['#E0E0E0', '#D0D0D0']}
              style={styles.signupButtonGradient}
            >
              <Text style={[styles.signupButtonText, !canSubmit && styles.signupButtonTextDisabled]}>
                Create Account
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Terms */}
        <Animated.View style={[styles.termsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>

        {/* Login Link */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.xxl,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
    width: 44,
  },
  titleSection: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.charcoal,
    marginBottom: SPACING.xs,
    fontFamily: TYPOGRAPHY.serif,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  roleSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600',
    color: COLORS.charcoal,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.subtle,
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  roleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  roleButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  roleButtonTextActive: {
    color: COLORS.ivory,
  },
  formContainer: {
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600',
    color: COLORS.charcoal,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.subtle,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.charcoal,
  },
  passwordInput: {
    paddingRight: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.error,
    marginTop: 4,
  },
  signupButton: {
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft,
    marginTop: SPACING.md,
  },
  signupButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonGradient: {
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.ivory,
    letterSpacing: 1,
  },
  signupButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  termsContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  termsText: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primaryDark,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
});
