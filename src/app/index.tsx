import { Redirect } from 'expo-router';

import { useAcademy } from '@/store/academy';
import { useStore } from '@/store/cases';
import { useLearn } from '@/store/learn';

/**
 * Where the app opens. Explore for someone new; Learn for anyone who has started the A2 journey
 * (a lesson done, or a plan saved for the exam), so tomorrow's lesson is the first thing they
 * see. Whoever chose a tab in You gets that one. Deep links (reminders, shared content) don't
 * pass through here.
 */
export default function Start() {
  const startTab = useStore((s) => s.startTab);
  const examGoal = useLearn((s) => s.profile?.goal === 'exam');
  const learning = useAcademy((s) => Object.keys(s.lessons).length > 0);
  const tab = startTab === 'learn' || (startTab === 'auto' && (examGoal || learning)) ? '/learn' : '/explore';
  return <Redirect href={tab} />;
}
