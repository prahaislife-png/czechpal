import SegmentedControlBase, { type SegmentedControlProps } from '@react-native-segmented-control/segmented-control';
import type { ComponentType } from 'react';

import { useTheme } from '@/theme/use-theme';

// The package's class typings predate React 19's JSX types; the runtime component is fine.
const SegmentedControl = SegmentedControlBase as unknown as ComponentType<SegmentedControlProps>;

/** The platform segmented control — never a rebuilt one. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { scheme } = useTheme();
  return (
    <SegmentedControl
      values={options.map((o) => o.label)}
      selectedIndex={Math.max(0, options.findIndex((o) => o.value === value))}
      onChange={(e) => onChange(options[e.nativeEvent.selectedSegmentIndex].value)}
      appearance={scheme}
      style={{ height: 36 }}
    />
  );
}
