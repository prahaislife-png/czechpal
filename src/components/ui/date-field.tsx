import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { isIsoDate, longDate } from '@/lib/about';
import { radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Text } from './text';

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The phone's own date picker; a typed date on the web, which has none. Dates are YYYY-MM-DD. */
export function DateField({ value, onChange, label }: { value?: string; onChange: (date: string | undefined) => void; label: string }) {
  const { colors } = useTheme();
  const [text, setText] = useState(value ?? '');
  const [showAndroid, setShowAndroid] = useState(false);
  const date = value ? new Date(`${value}T12:00:00`) : new Date();

  if (process.env.EXPO_OS === 'web') {
    return (
      <TextInput
        value={text}
        onChangeText={(t) => {
          setText(t);
          if (isIsoDate(t)) onChange(t);
          else if (!t) onChange(undefined);
        }}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.label3}
        inputMode="numeric"
        accessibilityLabel={`${label}, as year, month and day`}
        style={[styles.webDate, ramp.body, { color: colors.label, backgroundColor: colors.fill }]}
      />
    );
  }

  if (process.env.EXPO_OS === 'android') {
    return (
      <>
        <Pressable onPress={() => setShowAndroid(true)} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}>
          <Text variant="callout" color="accent" weight="600">
            {value ? longDate(value) : 'Choose a date'}
          </Text>
        </Pressable>
        {showAndroid && (
          <DateTimePicker
            value={date}
            mode="date"
            presentation="dialog"
            onValueChange={(_, d) => {
              setShowAndroid(false);
              onChange(toIso(d));
            }}
            onDismiss={() => setShowAndroid(false)}
          />
        )}
      </>
    );
  }

  return (
    <DateTimePicker
      value={date}
      mode="date"
      display="compact"
      accentColor={colors.accent}
      onValueChange={(_, d) => onChange(toIso(d))}
    />
  );
}

const styles = StyleSheet.create({
  webDate: { minWidth: 140, minHeight: 40, paddingHorizontal: space.md, borderRadius: radius.tile, outlineWidth: 0 },
});
