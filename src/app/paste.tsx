import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { HeaderTextButton } from '@/components/ui/header-button';
import { Text } from '@/components/ui/text';
import { draftFromText, leaveModalForReview } from '@/lib/capture';
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
    leaveModalForReview(draftFromText(text.current.trim()));
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
            Czech text
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
          placeholder="Napište nebo vložte text…"
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
          A sign, a menu, a chat or a whole letter. For messages, include the greeting and signature so the reply can match.
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
    outlineColor: 'transparent',
  },
});
