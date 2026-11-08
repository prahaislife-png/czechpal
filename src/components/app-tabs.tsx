import { NativeTabs } from 'expo-router/native-tabs';

import { iconGlyph } from '@/components/ui/icon';
import { useTheme } from '@/theme/use-theme';

/**
 * Four peers (CzechLocal 2.0): Explore Prague, Learn Czech, get Help with Czech life, and You.
 * Native tabs keep each tab's own stack and scroll position when switching.
 */
export default function AppTabs() {
  const { colors } = useTheme();
  const learn = iconGlyph('book');
  const you = iconGlyph('person');

  return (
    <NativeTabs tintColor={colors.label} labelStyle={{ selected: { color: colors.label } }}>
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} md="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="learn">
        <NativeTabs.Trigger.Label>Learn</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: learn.ios }} md={learn.md as never} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="help">
        <NativeTabs.Trigger.Label>Help</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'lifepreserver', selected: 'lifepreserver.fill' }} md="support" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="you">
        <NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} md={you.md as never} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
