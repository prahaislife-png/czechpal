import { Redirect, router, useLocalSearchParams } from 'expo-router';
import type { ComponentType } from 'react';

import { mockLocked, stepLocked, type PlusReason } from '@/lib/plus/access';
import { useAccess } from '@/store/plus';

/** Opens the paywall, leading with what the person was reaching for. */
export const openPlus = (from: PlusReason) => router.push({ pathname: '/plus', params: { from } });

/**
 * Wraps a lesson or exam-task screen: a step that needs Plus opens the paywall instead, whatever
 * led there (the journey, today's plan, a topic, a link). A step opened from a mock exam follows
 * the mock's own rule.
 */
export function gatedStep(Screen: ComponentType) {
  return function GatedStep() {
    const { id, mock } = useLocalSearchParams<{ id?: string; mock?: string }>();
    const access = useAccess();
    if (mock ? mockLocked(access) : stepLocked(id, access)) return <Redirect href={{ pathname: '/plus', params: { from: mock ? 'mock' : 'course' } }} />;
    return <Screen />;
  };
}

/** Wraps a screen of the mock exam. */
export function gatedMock(Screen: ComponentType) {
  return function GatedMock() {
    const access = useAccess();
    if (mockLocked(access)) return <Redirect href={{ pathname: '/plus', params: { from: 'mock' } }} />;
    return <Screen />;
  };
}
