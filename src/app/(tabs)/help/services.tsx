import { Redirect } from 'expo-router';

/**
 * "All services" used to be a second landing under Help. Its search, areas, town hall and
 * emergency numbers now live on Help itself, so old links land there.
 */
export default function ServicesScreen() {
  return <Redirect href="/help" />;
}
