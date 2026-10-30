import { NativeTabs } from 'expo-router/native-tabs';

import { iconGlyph } from '@/components/ui/icon';
import { useTheme } from '@/theme/use-theme';

/** Tabs are peers: native tab bar, no slide between them, each keeps its own stack. */
export default function AppTabs() {
  const { colors } = useTheme();
  const home = iconGlyph('home');
  const help = iconGlyph('help');
  const history = iconGlyph('history');
  const profile = iconGlyph('profile');

  return (
    <NativeTabs tintColor={colors.accent} labelStyle={{ selected: { color: colors.accent } }}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: home.ios, selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="help">
        <NativeTabs.Trigger.Label>Help</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={help.ios} md={help.md as never} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={history.ios} md={history.md as never} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: profile.ios, selected: 'person.crop.circle.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
