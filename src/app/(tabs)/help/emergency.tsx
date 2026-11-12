import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmergencyRow } from '@/components/help/emergency-row';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { emergencyNumbers, emergencyPhrases } from '@/lib/help/directory';
import { supportLines } from '@/lib/help/urgent';
import { speak, useCzechVoice } from '@/lib/learn/voice';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const tell = ['Where you are: the address, or what you can see around you', 'What happened', 'How many people need help', 'Stay on the line until they tell you to hang up'];

/**
 * Emergency: every number to call, what to tell the operator, the sentences to say in Czech,
 * and the lines for someone to talk to. One tap dials.
 */
export default function EmergencyScreen() {
  const { colors } = useTheme();
  const voice = useCzechVoice();
  const rate = useLearn((s) => s.rate);
  const canListen = voice.state === 'available';
  const [primary, ...others] = emergencyNumbers;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View>
        <List inset={false}>
          <EmergencyRow {...primary} prominent />
          {others.map((e) => (
            <EmergencyRow key={e.number} {...e} />
          ))}
        </List>
        <Text variant="footnote" color="label3" style={styles.footer}>
          Emergency calls are free from any phone.
        </Text>
      </View>

      <View style={[styles.tell, { backgroundColor: colors.dangerSoft }]}>
        <Text variant="headline">What to tell them</Text>
        {tell.map((line, i) => (
          <View key={line} style={styles.tellRow}>
            <Text variant="callout" weight="700" color="danger" tabular style={styles.tellNumber}>
              {i + 1}
            </Text>
            <Text variant="callout" style={styles.flex}>
              {line}
            </Text>
          </View>
        ))}
      </View>

      <View>
        <SectionHeader title="Say it in Czech" />
        <List>
          {emergencyPhrases.map((p) => (
            <Row
              key={p.cs}
              title={p.cs}
              subtitle={p.en}
              accessory={canListen ? <Icon name="speaker" size={18} color={colors.accent} /> : undefined}
              onPress={canListen ? () => speak(p.cs, { voice: voice.voice, rate }) : undefined}
              accessibilityHint={canListen ? 'Plays it in Czech' : undefined}
            />
          ))}
        </List>
      </View>

      <View>
        <SectionHeader title="Not life-threatening?" />
        <List>
          <Row icon="night" title="Sick tonight or at the weekend?" subtitle="After-hours doctors, dentists and night pharmacies" chevron onPress={() => router.push('/help/urgent')} />
        </List>
      </View>

      <View>
        <SectionHeader title="Someone to talk to" />
        <List inset={false}>
          {supportLines.map((l) => (
            <EmergencyRow key={l.number} number={l.number} label={l.label} detail={l.detail} />
          ))}
        </List>
        <Text variant="footnote" color="label3" style={styles.footer}>
          Free and open day and night. Official 116 numbers listed by the Czech government.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  footer: { paddingHorizontal: space.lg, marginTop: space.sm },
  tell: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.sm },
  tellRow: { flexDirection: 'row', gap: space.md },
  tellNumber: { minWidth: 16 },
});
