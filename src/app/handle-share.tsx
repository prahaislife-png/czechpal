import { router } from 'expo-router';
import { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShareIntake } from '@/components/share-intake';
import { Button } from '@/components/ui/button';
import { IconWell } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Landing screen for "Share → CzechReply" from WhatsApp, Mail, Photos or Files. */
export default function HandleShareScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const nothing = <NothingShared />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ShareBoundary fallback={nothing}>
        <ShareIntake fallback={nothing} />
      </ShareBoundary>
    </View>
  );
}

function NothingShared() {
  return (
    <View style={styles.center}>
      <IconWell name="share" tone="neutral" />
      <View style={styles.text}>
        <Text variant="title3" align="center" accessibilityRole="header">
          Nothing to read
        </Text>
        <Text variant="callout" color="label2" align="center">
          In WhatsApp, Mail or Photos, tap Share and choose CzechReply. Text, screenshots, photos and PDFs open here,
          ready to explain.
        </Text>
      </View>
      <Button label="Go to Home" variant="secondary" size="medium" onPress={() => router.replace('/')} />
    </View>
  );
}

/**
 * Receiving shares needs the share extension compiled into the app. In builds without it
 * (Expo Go, web) the native call throws; show the explanation instead of crashing.
 */
class ShareBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxxl, gap: space.xl },
  text: { gap: space.sm, maxWidth: 320 },
});
