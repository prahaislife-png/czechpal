import { router, Stack } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { HeaderTextButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { LANGUAGES } from '@/lib/ai';
import { useStore } from '@/store/cases';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Pick-one list: choosing a language applies it and closes, no separate Save. */
export default function LanguageScreen() {
  const { colors } = useTheme();
  const current = useStore((s) => s.language);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerLeft: () => <HeaderTextButton label="Close" /> }} />
      <List>
        {LANGUAGES.map((l) => (
          <Row
            key={l.code}
            title={l.native}
            subtitle={l.native === l.name ? undefined : l.name}
            selected={l.code === current}
            accessory={l.code === current ? <Icon name="check" size={18} color={colors.accent} /> : undefined}
            onPress={() => {
              useStore.getState().setLanguage(l.code);
              router.back();
            }}
          />
        ))}
      </List>
      <Text variant="footnote" color="label2" style={styles.footer}>
        Explanations, translations and the meaning of your Czech replies are written in this language. The Czech
        original always stays as it is. Things you already explained keep their language.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.sm },
  footer: { paddingHorizontal: space.lg },
});
