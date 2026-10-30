import * as Clipboard from 'expo-clipboard';
import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { HeaderTextButton } from '@/components/ui/header-button';
import { Text } from '@/components/ui/text';
import { submitPastedText } from '@/lib/capture';
import { layout, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const MIN_LENGTH = 20;

export default function PasteScreen() {
  const { colors } = useTheme();
  // Uncontrolled input: the text lives in a ref; state only tracks what the button needs.
  const text = useRef('');
  // Clipboard pastes re-seed the input by remounting it with a new default value.
  const [seed, setSeed] = useState({ key: 0, value: '' });
  const [length, setLength] = useState(0);
  const [focused, setFocused] = useState(false);

  const onChange = (value: string) => {
    text.current = value;
    setLength(value.trim().length);
  };

  const pasteFromClipboard = async () => {
    const value = await Clipboard.getStringAsync();
    if (!value) return;
    onChange(value);
    setSeed((s) => ({ key: s.key + 1, value }));
  };

  const submit = () => {
    const id = submitPastedText(text.current.trim());
    const review = { pathname: '/review/[id]', params: { id } } as const;
    // Close the sheet, then continue in the main stack. Opened from a deep link there is
    // nothing underneath to dismiss to, so take its place instead.
    if (router.canDismiss()) {
      router.dismiss();
      router.push(review);
    } else {
      router.replace(review);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderTextButton label="Cancel" />,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.labelRow}>
          <Text variant="subhead" weight="600" color="label2" nativeID="paste-label">
            Czech message
          </Text>
          <Pressable onPress={pasteFromClipboard} hitSlop={12} accessibilityRole="button">
            <Text variant="subhead" weight="500" color="accent">
              Paste from clipboard
            </Text>
          </Pressable>
        </View>
        <TextInput
          key={seed.key}
          defaultValue={seed.value}
          onChangeText={onChange}
          multiline
          autoFocus
          textAlignVertical="top"
          placeholder="Vážený pane, …"
          placeholderTextColor={colors.label3}
          accessibilityLabelledBy="paste-label"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            ramp.callout,
            {
              color: colors.label,
              backgroundColor: colors.surface,
              borderColor: focused ? colors.accent : colors.separator,
            },
          ]}
        />
        <Text variant="footnote" color="label2">
          Include the greeting and the signature — they help explain who it’s from and how formal to be.
        </Text>
      </ScrollView>
      <BottomBar inModal>
        <Button
          label="Continue"
          onPress={submit}
          disabled={length < MIN_LENGTH}
          accessibilityHint={length < MIN_LENGTH ? 'Paste at least a sentence first' : undefined}
        />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, gap: space.sm },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xs },
  input: {
    minHeight: 240,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: space.lg,
    lineHeight: 24,
    // The focused border is the focus indicator; suppress the browser's default ring.
    outlineWidth: 0,
  },
});
