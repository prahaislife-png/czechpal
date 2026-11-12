import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { forYou } from '@/lib/help/for-you';
import { listPlaces, type Place } from '@/lib/help/places';
import { useStore } from '@/store/cases';

/**
 * For you: the offices that are this person's own, and their permit's end date when it is
 * getting close, from what they told the app in About you. With nothing told yet, one row asks.
 */
export function ForYouSection() {
  const about = useStore((s) => s.about);
  const mine = useMemo(() => forYou(about), [about]);
  const townHall = useTownHall(mine.townHallDistrict);

  if (mine.empty)
    return (
      <View>
        <SectionHeader title="For you" />
        <List>
          <Row
            icon="person"
            title="Tell CzechLocal where you live"
            subtitle="Your district and permit, and Help shows your own offices and what’s coming up"
            chevron
            onPress={() => router.push('/about')}
          />
        </List>
      </View>
    );

  if (!mine.office && !mine.permit && !townHall) return null;

  return (
    <View>
      <SectionHeader title="For you" />
      <List>
        {mine.permit ? (
          <Row
            icon="calendar"
            title={mine.permit.title}
            subtitle={mine.permit.detail}
            chevron
            onPress={() =>
              mine.permit!.checklist ? router.push({ pathname: '/help/checklists/[id]', params: { id: mine.permit!.checklist } }) : router.push('/help/checklists')
            }
          />
        ) : null}
        {mine.office ? (
          <Row
            icon="government"
            title={`Your immigration office: ${mine.office.office.short}`}
            subtitle={`For ${mine.office.district} · hours and today’s waits`}
            chevron
            onPress={() => router.push({ pathname: '/help/offices/[id]', params: { id: mine.office!.office.id } })}
          />
        ) : null}
        {townHall ? (
          <Row
            icon="home"
            title="Your town hall"
            subtitle={[mine.townHallDistrict, townHall.address].filter(Boolean).join(' · ')}
            chevron
            onPress={() => router.push({ pathname: '/help/place/[id]', params: { id: townHall.id } })}
          />
        ) : null}
      </List>
    </View>
  );
}

/** The town hall for a district; nothing until it's found, or offline. Never a stale one. */
function useTownHall(district: string | undefined): Place | undefined {
  const [found, setFound] = useState<{ district: string; place?: Place } | null>(null);
  useEffect(() => {
    if (!district) return;
    let active = true;
    listPlaces('town_hall')
      .then((all) => {
        if (active) setFound({ district, place: all.find((p) => p.district === district) });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [district]);
  return found && found.district === district ? found.place : undefined;
}
