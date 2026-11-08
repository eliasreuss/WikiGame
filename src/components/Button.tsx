import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { color, radius, type } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'accent' | 'secondary';
  accent?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function Button({ label, onPress, icon, variant = 'primary', accent = color.primary, disabled, style, accessibilityHint }: Props) {
  const bg = variant === 'primary' ? color.ink : variant === 'accent' ? accent : color.surface;
  const fg = variant === 'secondary' ? color.ink : '#fff';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[styles.base, { backgroundColor: bg, opacity: disabled ? 0.4 : 1 }, variant === 'secondary' && styles.secondary, style]}
    >
      <View style={styles.row}>
        <Text style={[type.label, { color: fg }]}>{label}</Text>
        {icon ? <Icon name={icon} size={20} color={fg} strokeWidth={2} /> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { height: 58, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  secondary: { borderWidth: 1, borderColor: color.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
