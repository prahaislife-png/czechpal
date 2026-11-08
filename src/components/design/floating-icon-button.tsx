import * as Haptics from 'expo-haptics';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useTheme } from '@/theme/use-theme';

/**
 * A round control floating over the map or other full-bleed content: paper, a soft shadow,
 * 44 pt. `active` fills it charcoal (a mode that is on, like following your location).
 */
export function FloatingIconButton({
  icon,
  label,
  onPress,
  active,
  busy,
  style,
}: {
  icon: IconName;
  /** What VoiceOver says. */
  label: string;
  onPress: () => void;
  active?: boolean;
  busy?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        onPress();
      }}
      pressedScale={0.92}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active, busy: !!busy }}
      style={[styles.button, { backgroundColor: active ? colors.accentFill : colors.surface, boxShadow: colors.shadowRaised }, style]}>
      <View style={{ opacity: busy ? 0.5 : 1 }}>
        <Icon name={icon} size={20} color={active ? colors.onAccent : colors.label} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
