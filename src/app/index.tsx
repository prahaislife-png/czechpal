import { Redirect } from 'expo-router';

import { useLearn } from '@/store/learn';
import { useStore } from '@/store/cases';

/**
 * Where the app opens. Explore by default; Learn for someone whose plan is the A2 exam, or
 * whoever chose Learn in You. Deep links (reminders, shared content) don't pass through here.
 */
export default function Start() {
  const startTab = useStore((s) => s.startTab);
  const examGoal = useLearn((s) => s.profile?.goal === 'exam');
  const tab = startTab === 'learn' || (startTab === 'auto' && examGoal) ? '/learn' : '/explore';
  return <Redirect href={tab} />;
}
