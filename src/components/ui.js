import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '../theme';

export function Screen({ children, scroll = false, style, edges = ['top'], ...rest }) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <Container
        style={[scroll ? styles.scroll : styles.flex, style]}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
        showsVerticalScrollIndicator={false}
        {...rest}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

export function PixelText({ style, children, ...rest }) {
  return (
    <Text style={[styles.pixel, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Title({ style, children }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Body({ style, children, numberOfLines }) {
  return (
    <Text style={[styles.body, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Muted({ style, children, numberOfLines }) {
  return (
    <Text style={[styles.muted, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Card({ children, style, glow = false, onPress }) {
  const cardStyle = [styles.card, glow && styles.cardGlow, style];
  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  style,
  disabled,
  loading,
}) {
  const variants = {
    primary: { bg: colors.lime, fg: '#0A1020', border: colors.limeDark },
    dark: { bg: colors.card, fg: colors.text, border: colors.border },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
    ghost: { bg: 'transparent', fg: colors.textSoft, border: colors.borderSoft },
  };
  const v = variants[variant] || variants.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.buttonDisabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && iconPosition === 'left' ? (
            <Text style={[styles.buttonIcon, { color: v.fg }]}>{icon}</Text>
          ) : null}
          <Text style={[styles.buttonLabel, { color: v.fg }]}>{label}</Text>
          {icon && iconPosition === 'right' ? (
            <Text style={[styles.buttonIcon, { color: v.fg }]}>{icon}</Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

export function Chip({ label, icon, active, onPress, color = colors.lime }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: color, borderColor: color },
        pressed && styles.pressed,
      ]}
    >
      {icon ? <Text style={styles.chipIcon}>{icon}</Text> : null}
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ emoji, size = 44, color = colors.blue, active = false, style }) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: active ? colors.lime : color,
          backgroundColor: active ? 'rgba(200,247,81,0.14)' : 'rgba(77,166,255,0.12)',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

export function ProgressBar({ value, max, color = colors.lime, height = 14 }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${pct * 100}%`, backgroundColor: color, height: height - 4 },
        ]}
      />
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

export function Badge({ label, color = colors.lime, style }) {
  return (
    <View style={[styles.badge, { borderColor: color }, style]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ icon = '👟', title, subtitle, action }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Title style={styles.emptyTitle}>{title}</Title>
      {subtitle ? <Muted style={styles.emptySubtitle}>{subtitle}</Muted> : null}
      {action}
    </View>
  );
}

export function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing(10) },
  pixel: { fontFamily: fonts.pixel, color: colors.text },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: 0.2 },
  body: { color: colors.textSoft, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    padding: spacing(4),
  },
  cardGlow: { borderColor: colors.lime },
  pressed: { opacity: 0.75 },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing(2),
    paddingHorizontal: spacing(4),
  },
  buttonDisabled: { opacity: 0.45 },
  buttonLabel: { fontSize: 16, fontWeight: '800' },
  buttonIcon: { fontSize: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipIcon: { fontSize: 13 },
  chipLabel: { color: colors.textSoft, fontWeight: '700', fontSize: 13 },
  chipLabelActive: { color: '#0A1020' },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  progressTrack: {
    backgroundColor: colors.bgDeep,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressFill: { borderRadius: radius.pill },
  divider: { height: 2, backgroundColor: colors.borderSoft, borderRadius: 2 },
  badge: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  empty: { alignItems: 'center', paddingVertical: spacing(10), gap: spacing(2) },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { textAlign: 'center' },
  emptySubtitle: { textAlign: 'center', maxWidth: 280 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  sectionAction: { color: colors.lime, fontSize: 13, fontWeight: '700' },
});

export { styles as uiStyles };
