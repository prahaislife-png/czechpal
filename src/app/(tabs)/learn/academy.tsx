import { Redirect } from 'expo-router';

/**
 * The A2 Academy used to be a screen of its own. It now lives on Learn itself (today's plan, the
 * course by topic, the exam), so old links land there.
 */
export default function AcademyScreen() {
  return <Redirect href="/learn" />;
}
