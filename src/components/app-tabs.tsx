import { NativeTabs } from 'expo-router/native-tabs';

import { iconGlyph } from '@/components/ui/icon';
import { useTheme } from '@/theme/use-theme';

/** Three peers: the scanner and everything it leads to (Home), learning Czech (Learn), and every contact and place (Find). */
export default function AppTabs() {
  const { colors } = useTheme();
  const home = iconGlyph('home');
  const find = iconGlyph('search');
  const learn = iconGlyph('book');

  return (
    <NativeTabs tintColor={colors.accent} labelStyle={{ selected: { color: colors.accent } }}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: home.ios, selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="learn">
        <NativeTabs.Trigger.Label>Learn</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: learn.ios }} md={learn.md as never} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="help">
        <NativeTabs.Trigger.Label>Find</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={find.ios} md={find.md as never} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
