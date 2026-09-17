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
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import PixelIcon from './PixelIcon';
import { colors, spacing, type } from '../theme';
import { arcade } from '../utils/format';

const NOTCH = 3;

/* ---------- Fondo de gabinete ---------- */

/** Grilla tenue de fósforo, como el fondo de un cabinet. */
export function GridBackdrop({ cell = 24, color = colors.bgGrid, opacity = 1 }) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      pointerEvents="none"
      opacity={opacity}
    >
      <Defs>
        <Pattern id="grid" width={cell} height={cell} patternUnits="userSpaceOnUse">
          <Rect x="0" y="0" width={cell} height="1" fill={color} />
          <Rect x="0" y="0" width="1" height={cell} fill={color} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
    </Svg>
  );
}

/** Líneas de barrido del tubo CRT. */
export function Scanlines({ opacity = 0.16, period = 4 }) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      pointerEvents="none"
      opacity={opacity}
    >
      <Defs>
        <Pattern id="scan" width={period} height={period} patternUnits="userSpaceOnUse">
          <Rect x="0" y="0" width={period} height={period / 2} fill="#000000" />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#scan)" />
    </Svg>
  );
}

export function Screen({
  children,
  scroll = false,
  style,
  edges = ['top'],
  grid = true,
  ...rest
}) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {grid ? <GridBackdrop /> : null}
      <Container
        style={[scroll ? styles.flex : styles.flex, style]}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
        showsVerticalScrollIndicator={false}
        {...rest}
      >
        {children}
      </Container>
      <Scanlines />
    </SafeAreaView>
  );
}

/* ---------- Tipografía ---------- */

export function Display({ style, children, color = colors.lime, ...rest }) {
  return (
    <Text style={[type.hero, { color }, style]} {...rest}>
      {arcade(children)}
    </Text>
  );
}

export function Title({ style, children, color = colors.text, ...rest }) {
  return (
    <Text style={[type.title, { color }, style]} {...rest}>
      {arcade(children)}
    </Text>
  );
}

export function Score({ style, children, color = colors.lime, small = false }) {
  return <Text style={[small ? type.scoreSm : type.score, { color }, style]}>{children}</Text>;
}

export function Label({ style, children, color = colors.text, numberOfLines }) {
  return (
    <Text style={[type.label, { color }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Body({ style, children, numberOfLines }) {
  return (
    <Text style={[type.body, { color: colors.textDim }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Muted({ style, children, numberOfLines }) {
  return (
    <Text style={[type.small, { color: colors.textFaint }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

/** Rótulo de máquina: mayúsculas espaciadas, como los headers de un arcade. */
export function Caption({ style, children, color = colors.textFaint }) {
  return (
    <Text style={[type.tiny, styles.caption, { color }, style]}>
      {String(children).toUpperCase()}
    </Text>
  );
}

/* ---------- Marcos ---------- */

/**
 * El marco tiene dos capas (sombra + caja), así que los estilos de
 * posición van al contenedor y los de apariencia a la caja interior.
 */
const LAYOUT_KEYS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'position',
  'top', 'left', 'right', 'bottom', 'zIndex',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'marginHorizontal', 'marginVertical',
]);

function splitStyle(style) {
  const flat = StyleSheet.flatten(style) || {};
  const outer = {};
  const inner = {};
  Object.entries(flat).forEach(([k, v]) => {
    if (LAYOUT_KEYS.has(k)) outer[k] = v;
    else inner[k] = v;
  });
  return [outer, inner];
}

function Notches({ color }) {
  return (
    <>
      <View style={[styles.notch, { top: -1, left: -1, backgroundColor: color }]} />
      <View style={[styles.notch, { top: -1, right: -1, backgroundColor: color }]} />
      <View style={[styles.notch, { bottom: -1, left: -1, backgroundColor: color }]} />
      <View style={[styles.notch, { bottom: -1, right: -1, backgroundColor: color }]} />
    </>
  );
}

/**
 * Panel con borde duro, esquinas en escalón y sombra sin difuminar.
 * Es la pieza básica de toda la interfaz.
 */
export function Panel({
  children,
  style,
  tone = 'default',
  onPress,
  notchColor = colors.bg,
  shadow = true,
}) {
  const tones = {
    default: { bg: colors.panel, border: colors.border },
    lit: { bg: colors.panelLit, border: colors.borderLit },
    dark: { bg: colors.panelAlt, border: colors.borderDim },
    neon: { bg: colors.panel, border: colors.lime },
    cyan: { bg: colors.panel, border: colors.cyan },
    magenta: { bg: colors.panel, border: colors.magenta },
  };
  const t = tones[tone] || tones.default;
  const [outer, inner] = splitStyle(style);
  // Si el panel se estira dentro de una fila, la caja tiene que ocupar
  // todo el alto; si no, la sombra queda asomando abajo.
  const stretches =
    outer.flex != null ||
    outer.flexGrow != null ||
    outer.height != null ||
    outer.minHeight != null;

  const frame = (pressed) => (
    <View style={[styles.frameWrap, !onPress && outer]}>
      {shadow ? (
        <View
          style={[styles.shadowLayer, pressed && styles.shadowLayerPressed]}
          pointerEvents="none"
        />
      ) : null}
      <View
        style={[
          styles.panel,
          { backgroundColor: t.bg, borderColor: t.border },
          pressed && styles.panelPressed,
          stretches && styles.panelStretch,
          inner,
        ]}
      >
        {children}
        <Notches color={notchColor} />
      </View>
    </View>
  );

  if (!onPress) return frame(false);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={outer}>
      {({ pressed }) => frame(pressed)}
    </Pressable>
  );
}

/* ---------- Controles ---------- */

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  style,
  disabled,
  loading,
  size = 'md',
}) {
  const variants = {
    primary: { bg: colors.lime, fg: colors.bgDeep, border: colors.limeDim },
    cyan: { bg: colors.cyan, fg: colors.bgDeep, border: colors.cyanDim },
    magenta: { bg: colors.magenta, fg: '#12030A', border: colors.magentaDim },
    dark: { bg: colors.panelLit, fg: colors.text, border: colors.borderLit },
    ghost: { bg: 'transparent', fg: colors.textDim, border: colors.border },
    danger: { bg: 'transparent', fg: colors.red, border: colors.red },
  };
  const v = variants[variant] || variants.primary;
  const sizes = {
    sm: { minHeight: 38, px: spacing(3), font: 8, icon: 13 },
    md: { minHeight: 48, px: spacing(4), font: 10, icon: 16 },
    lg: { minHeight: 56, px: spacing(5), font: 12, icon: 18 },
  };
  const s = sizes[size] || sizes.md;
  const blocked = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={blocked ? undefined : onPress}
      style={style}
    >
      {({ pressed }) => (
        <View style={styles.frameWrap}>
          <View
            style={[
              styles.shadowLayer,
              pressed && !blocked && styles.shadowLayerPressed,
            ]}
            pointerEvents="none"
          />
          <View
            style={[
              styles.button,
              {
                backgroundColor: v.bg,
                borderColor: v.border,
                minHeight: s.minHeight,
                paddingHorizontal: s.px,
              },
              pressed && !blocked && styles.panelPressed,
              blocked && styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={v.fg} size="small" />
            ) : (
              <>
                {icon && iconPosition === 'left' ? (
                  <PixelIcon name={icon} size={s.icon} color={v.fg} />
                ) : null}
                <Text style={[type.title, { fontSize: s.font, color: v.fg, lineHeight: s.font + 6 }]}>
                  {arcade(label)}
                </Text>
                {icon && iconPosition === 'right' ? (
                  <PixelIcon name={icon} size={s.icon} color={v.fg} />
                ) : null}
              </>
            )}
            <Notches color={colors.bg} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, color = colors.text, size = 22, flip, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }, style]}
    >
      <PixelIcon name={icon} size={size} color={color} flip={flip} />
    </Pressable>
  );
}

export function Chip({ label, icon, active, onPress, color = colors.lime }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: color, borderColor: color },
        pressed && { opacity: 0.75 },
      ]}
    >
      {icon ? (
        <PixelIcon
          name={icon}
          size={13}
          color={active ? colors.bgDeep : colors.textDim}
        />
      ) : null}
      <Text
        style={[
          type.title,
          styles.chipLabel,
          { color: active ? colors.bgDeep : colors.textDim },
        ]}
      >
        {arcade(label)}
      </Text>
    </Pressable>
  );
}

/* ---------- Avatares ---------- */

export function Avatar({ avatar, size = 44, active = false, style }) {
  const sprite = avatar?.sprite || 'ghost';
  const tint = avatar?.color || colors.cyan;
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderColor: active ? colors.lime : tint,
          backgroundColor: colors.panelAlt,
        },
        style,
      ]}
    >
      <PixelIcon name={sprite} size={size * 0.72} color={tint} />
    </View>
  );
}

/* ---------- Medidores ---------- */

/** Barra segmentada: cada bloque es una "vida" del medidor. */
export function SegmentBar({
  value,
  max,
  segments = 16,
  color = colors.lime,
  height = 14,
  trackColor = colors.bgDeep,
}) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const filled = Math.round(ratio * segments);
  return (
    <View style={[styles.segTrack, { height, backgroundColor: trackColor }]}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              backgroundColor: i < filled ? color : 'transparent',
              opacity: i < filled ? (i > segments * 0.75 ? 1 : 0.85) : 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function Divider({ style, color = colors.borderDim }) {
  return <View style={[styles.divider, { backgroundColor: color }, style]} />;
}

export function Badge({ label, color = colors.lime, icon, style }) {
  return (
    <View style={[styles.badge, { borderColor: color }, style]}>
      {icon ? <PixelIcon name={icon} size={11} color={color} /> : null}
      <Text style={[type.tiny, styles.badgeText, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

export function SectionHeader({ title, actionLabel, onAction, color = colors.lime }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionTick, { backgroundColor: color }]} />
        <Text style={[type.title, { fontSize: 11, color: colors.text }]}>
          {arcade(title)}
        </Text>
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={10} style={styles.sectionAction}>
          <Text style={[type.tiny, { color, letterSpacing: 0.6 }]}>
            {actionLabel.toUpperCase()}
          </Text>
          <PixelIcon name="chevron" size={10} color={color} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ icon = 'shoe', title, subtitle, action }) {
  return (
    <View style={styles.empty}>
      <PixelIcon name={icon} size={52} color={colors.borderLit} />
      <Title style={styles.emptyTitle}>{title}</Title>
      {subtitle ? <Body style={styles.emptySubtitle}>{subtitle}</Body> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: spacing(10) },
  caption: { letterSpacing: 1.2 },

  frameWrap: { position: 'relative', alignSelf: 'stretch' },
  shadowLayer: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.shadow,
  },
  shadowLayerPressed: { left: 1, top: 1, right: -1, bottom: -1 },
  panel: { borderWidth: 3, padding: spacing(4) },
  panelStretch: { flex: 1 },
  panelPressed: { transform: [{ translateX: 3 }, { translateY: 3 }] },
  notch: { position: 'absolute', width: NOTCH, height: NOTCH },

  button: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing(2),
  },
  buttonDisabled: { opacity: 0.4 },
  iconButton: { padding: spacing(1) },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
  },
  chipLabel: { fontSize: 8, lineHeight: 14 },

  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },

  segTrack: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: colors.border,
    padding: 2,
    gap: 2,
  },
  segment: { flex: 1 },

  divider: { height: 2 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderWidth: 2,
    alignSelf: 'flex-start',
    backgroundColor: colors.panelAlt,
  },
  badgeText: { letterSpacing: 0.8 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  sectionTick: { width: 4, height: 14 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },

  empty: { alignItems: 'center', paddingVertical: spacing(10), gap: spacing(3) },
  emptyTitle: { textAlign: 'center', fontSize: 11 },
  emptySubtitle: { textAlign: 'center', maxWidth: 280 },
});

export { styles as uiStyles };
