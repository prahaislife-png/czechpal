import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Text } from './text';

type Props = Omit<TextInputProps, 'style' | 'onBlur' | 'onFocus'> & {
  label: string;
  /** Shown under the field once it has been left (validate on blur, never on keystroke). */
  error?: string;
  helper?: string;
};

/** Label above, input, then helper or error below. Errors stay until fixed. */
export function Field({ label, error, helper, ...input }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const showError = touched && !!error;
  const id = `field-${label.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <View style={styles.field}>
      <Text variant="subhead" weight="600" color="label2" nativeID={id} style={styles.label}>
        {label}
      </Text>
      <TextInput
        {...input}
        accessibilityLabelledBy={id}
        accessibilityHint={showError ? error : helper}
        placeholderTextColor={colors.label3}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setTouched(true);
        }}
        style={[
          styles.input,
          ramp.body,
          {
            color: colors.label,
            backgroundColor: colors.surface,
            borderColor: showError ? colors.danger : focused ? colors.accent : colors.separator,
          },
        ]}
      />
      {showError ? (
        <Text variant="footnote" color="danger" style={styles.below} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="footnote" color="label3" style={styles.below}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space.xs + 2 },
  label: { paddingHorizontal: space.xs },
  input: {
    minHeight: 50,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  below: { paddingHorizontal: space.xs },
});
