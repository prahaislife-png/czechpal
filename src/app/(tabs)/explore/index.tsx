import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chooser } from '@/components/explore/chooser';
import { ExploreMap } from '@/components/explore/explore-map';
import { layerLabels, mapLayers, type ExploreMapHandle, type MapLayer } from '@/components/explore/map-types';
import { PeoplePanel, PlanPanel, planBudgets, planTimes, SavedEmpty, type PlanState } from '@/components/explore/panels';
import { PlaceList } from '@/components/explore/place-card';
import { PlacePreview } from '@/components/explore/place-preview';
import { AddChip, SentenceChip, SentenceLine, Words } from '@/components/explore/sentence';
import { ExploreSheet, TAB_HEIGHT, type SheetHandle, type SheetStop } from '@/components/explore/sheet';
import { BrandMark } from '@/components/ui/brand-mark';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import {
  activities,
  activityPhrase,
  areaLabel,
  areasOf,
  filterPlaces,
  formatDistance,
  inPrague,
  NEAR,
  nearbyPlaces,
  placesInView,
  preferredFor,
  toggleActivity,
  type Bounds,
} from '@/lib/explore/filter';
import { useExplorePlaces } from '@/lib/explore/source';
import type { ActivityId, Area, ExplorePlace, LatLng } from '@/lib/explore/types';
import { useExplore } from '@/store/explore';
import { fonts, layout, radius, space } from '@/theme/tokens';
import { useExploreTheme } from '@/theme/use-theme';

type Tab = 'explore' | 'plan' | 'people' | 'saved';
type Picking = 'activity' | 'activity-add' | 'area' | 'plan-time' | 'plan-activity' | 'plan-budget' | 'plan-area';

/** The floating bar's height under the status bar. */
const BAR = 44;
/** About how tall the place card is, so the map keeps its pin clear of it. */
const PREVIEW = 200;

/**
 * Explore: the whole screen is a map of outdoor places in Prague. A paper sheet floats over it
 * with folder tabs on its top edge. "I want to … in …" filters the pins and the list together.
 * Tapping a pin or a row shows that place in a small card just above the sheet.
 */
export default function ExploreScreen() {
  const { ex } = useExploreTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [areaHeight, setAreaHeight] = useState(0);
  const H = areaHeight || windowHeight;
  const reduceMotion = useReducedMotion();
  // On iOS the tab bar floats over the screen, so the sheet's content keeps clear of it.
  const tabBar = process.env.EXPO_OS === 'ios' ? 49 + insets.bottom : 0;

  const { places, status, error, retry } = useExplorePlaces();
  const saved = useExplore((s) => s.saved);
  const savedPlaces = useMemo(
    () => Object.values(saved).sort((a, b) => b.savedAt - a.savedAt).map((s) => s.place),
    [saved],
  );

  // Filters: one state, read by the map and the list alike.
  const [wanted, setWanted] = useState<ActivityId[]>(['walk']);
  const [area, setArea] = useState<Area>('prague');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const areas = useMemo(() => areasOf(places), [places]);

  const [tab, setTab] = useState<Tab>('explore');
  const [picking, setPicking] = useState<Picking | null>(null);
  /** The activity chip being changed: picking another replaces it. */
  const [replacing, setReplacing] = useState<ActivityId | null>(null);
  const [plan, setPlan] = useState<PlanState>({ time: '2h', activity: 'nature', budget: 'free', area: 'prague' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layer, setLayer] = useState<MapLayer>('light');
  const [layersOpen, setLayersOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Near me: the shortest walk (1.5, 3 or 6 km) that finds a handful of places, nearest first.
  const near = useMemo(
    () => (area === NEAR && userLocation ? nearbyPlaces(places, { activities: wanted, query }, userLocation) : null),
    [places, wanted, area, query, userLocation],
  );
  const filtered = useMemo(
    () => near?.list ?? filterPlaces(places, { activities: wanted, area: area === NEAR ? 'prague' : area, query }),
    [near, places, wanted, area, query],
  );

  // Saved shows the saved places on the map; every other tab shows what the sentence asks for.
  const shown = tab === 'saved' ? savedPlaces : filtered;
  // A selection the filters no longer show is dropped.
  const activeId = selectedId && shown.some((p) => p.id === selectedId) ? selectedId : null;

  // The list follows the map: the best places in view, so thousands never become thousands of cards.
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const prefer = useMemo(() => (tab === 'saved' ? [] : preferredFor(wanted)), [wanted, tab]);
  const inView = useMemo(
    () => placesInView(filtered, bounds, 40, activeId, userLocation, prefer),
    [filtered, bounds, activeId, userLocation, prefer],
  );
  const selectedPlace = activeId ? (shown.find((p) => p.id === activeId) ?? null) : null;

  // Sheet heights, measured on the space actually available above the tab bar: Discover (about 28 %,
  // never less than its header), Browse (about 56 %) and Details (about 86 %, always below the
  // status bar and the sheet's own tabs).
  const [headerHeight, setHeaderHeight] = useState(180);
  const snaps = useMemo(() => {
    const usable = H - tabBar;
    const showing = (share: number) => H - tabBar - Math.round(usable * share);
    const high = Math.max(showing(0.86), insets.top + TAB_HEIGHT + space.sm);
    const low = Math.max(high + 160, Math.min(showing(0.28), H - tabBar - headerHeight));
    const mid = Math.max(high + 80, Math.min(showing(0.56), low - 80));
    return { low, mid, high };
  }, [H, insets.top, tabBar, headerHeight]);
  const [stop, setStop] = useState<SheetStop>('mid');
  const top = useSharedValue(snaps.mid);
  const sheet = useRef<SheetHandle>(null);
  const map = useRef<ExploreMapHandle>(null);
  const covered = (s: SheetStop) => H - snaps[s];
  /** What the sheet at its lowest, its tabs and the place card cover together. */
  const clearOfPreview = () => covered('low') + TAB_HEIGHT + PREVIEW;

  // A chosen place shows in a small card over the map, so the sheet steps down out of its way.
  const selectFromMap = (id: string | null) => {
    setSelectedId(id);
    setLayersOpen(false);
    if (!id) return;
    const place = shown.find((p) => p.id === id);
    if (place) announce(`${place.name}. ${place.description}`);
    setPicking(null);
    if (tab === 'plan' || tab === 'people') setTab('explore');
    if (stop !== 'low') sheet.current?.snapTo('low');
    // Keep the pin in view above the card that's about to appear.
    if (place) map.current?.focus(place, clearOfPreview());
  };

  const selectFromList = (p: ExplorePlace) => {
    setSelectedId(p.id);
    if (stop !== 'low') sheet.current?.snapTo('low');
    map.current?.focus(p, clearOfPreview());
  };

  // A new filter refits the map to what it found.
  const filterKey = `${wanted.join(',')}|${area}|${tab === 'saved' ? 'saved' : 'all'}`;
  const firstFit = useRef(true);
  useEffect(() => {
    if (firstFit.current) {
      firstFit.current = false;
      return;
    }
    // Near me frames the person as well as what's around them.
    const points = area === NEAR && userLocation && tab !== 'saved' ? [...shown, userLocation] : shown;
    if (points.length) map.current?.fit(points, covered(stop));
  }, [filterKey, near?.radius]); // eslint-disable-line react-hooks/exhaustive-deps

  // The first time the full list arrives (instead of the hand-picked fallback), frame all of it.
  const loaded = useRef(status === 'ready');
  useEffect(() => {
    if (status !== 'ready' || loaded.current) return;
    loaded.current = true;
    if (shown.length) map.current?.fit(shown, covered(stop));
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search refits too, once typing pauses, so the map doesn't jump on every letter; clearing it
  // brings back the whole result.
  const searched = useRef(false);
  useEffect(() => {
    if (query) searched.current = true;
    if (!searched.current) return;
    const t = setTimeout(() => {
      if (filtered.length) map.current?.fit(filtered, covered(stop));
    }, 450);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // Details › Show on map.
  const showRequested = useEffectEvent((id: string) => {
    const place = places.find((p) => p.id === id) ?? saved[id]?.place;
    if (!place) return;
    if (!shown.some((p) => p.id === place.id)) {
      // Make sure the sentence includes it.
      setWanted([]);
      setArea('prague');
      setQuery('');
      if (tab !== 'saved') setTab('explore');
    }
    setSelectedId(place.id);
    sheet.current?.snapTo('low');
    map.current?.focus(place, clearOfPreview());
  });
  useEffect(
    () =>
      useExplore.subscribe((s) => {
        if (!s.focusRequest) return;
        const id = s.focusRequest;
        useExplore.getState().requestFocus(null);
        showRequested(id);
      }),
    [],
  );

  const say = (text: string) => {
    setNotice(text);
    announce(text);
    setTimeout(() => setNotice((n) => (n === text ? null : n)), 4000);
  };

  // Current location: offered while the permission can still be granted.
  const [canLocate, setCanLocate] = useState(true);
  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then((p) => setCanLocate(p.granted || p.canAskAgain))
      .catch(() => setCanLocate(false));
  }, []);
  const locate = async (): Promise<LatLng | null> => {
    try {
      const p = await Location.requestForegroundPermissionsAsync();
      if (!p.granted) {
        setCanLocate(p.canAskAgain);
        say('Location is off for CzechLocal. You can still explore the whole city.');
        return null;
      }
      const here = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const at = { latitude: here.coords.latitude, longitude: here.coords.longitude };
      setUserLocation(at);
      return at;
    } catch {
      say('Couldn’t find where you are just now.');
      return null;
    }
  };

  // Choosing "near me" asks for the location first; outside Prague there's nothing near to show.
  const chooseNear = async (apply: (a: typeof NEAR) => void) => {
    const here = userLocation ?? (await locate());
    if (!here) return;
    if (!inPrague(here)) {
      say('You seem to be outside Prague, so here’s the whole city.');
      return;
    }
    apply(NEAR);
  };

  // Already allowed to know where they are, in Prague: start with what's around them.
  const choseArea = useRef(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await Location.getForegroundPermissionsAsync();
        if (!p.granted) return;
        const last = (await Location.getLastKnownPositionAsync()) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        const at = { latitude: last.coords.latitude, longitude: last.coords.longitude };
        if (cancelled || choseArea.current || !inPrague(at)) return;
        setUserLocation(at);
        setArea(NEAR);
      } catch {
        // No location: Prague as a whole, as before.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startSearch = () => {
    setTab('explore');
    setPicking(null);
    setLayersOpen(false);
    setSearching(true);
    sheet.current?.snapTo('high');
  };

  const openPicker = (p: Picking, chip: ActivityId | null = null) => {
    const closing = picking === p && replacing === chip;
    setPicking(closing ? null : p);
    setReplacing(chip);
    if (stop === 'low') sheet.current?.snapTo('mid');
    sheet.current?.scrollTo(0);
  };

  // The place card rides just above the sheet's tabs as the sheet moves.
  const previewStyle = useAnimatedStyle(() => ({ bottom: H - top.get() + TAB_HEIGHT + space.sm }));

  // The floating bar steps aside as the sheet reaches the top.
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(top.get(), [snaps.high, snaps.high + 120], [0, 1], 'clamp'),
  }));

  const counts: Record<Tab, number | undefined> = { explore: undefined, plan: undefined, people: undefined, saved: savedPlaces.length || undefined };
  const tabs = SHOWN_TABS.map((id) => ({ id, label: tabLabels[id], count: counts[id] }));

  const header =
    tab === 'explore' ? (
      <View style={styles.sentence}>
        <SentenceLine>
          <Words>I want to</Words>
          {wanted.length === 0 ? (
            <SentenceChip label="do anything" hint="Choose an activity" open={picking === 'activity'} onPress={() => openPicker('activity')} />
          ) : (
            wanted.map((a) => (
              <SentenceChip
                key={a}
                label={activityPhrase(a)}
                hint="Choose another activity"
                open={picking === 'activity' && replacing === a}
                onPress={() => openPicker('activity', a)}
              />
            ))
          )}
          <AddChip label="Add or remove activities" onPress={() => openPicker('activity-add')} />
        </SentenceLine>
        <SentenceLine>
          <Words>in</Words>
          <SentenceChip label={areaLabel(area)} hint="Choose an area" open={picking === 'area'} onPress={() => openPicker('area')} />
        </SentenceLine>
        {searching ? (
          <View style={[styles.search, { backgroundColor: ex.card, borderColor: ex.line }]}>
            <Icon name="search" size={18} color={ex.ink3} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              placeholder="Search by name or district"
              placeholderTextColor={ex.ink3}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel="Search places"
              style={[styles.searchInput, { color: ex.ink }]}
            />
            <Pressable
              onPress={() => {
                setQuery('');
                setSearching(false);
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close search">
              <Icon name="close" size={16} color={ex.ink3} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.resultLine}>
          <Text variant="footnote" weight="600" style={{ color: ex.ink2 }} accessibilityLiveRegion="polite">
            {status === 'loading'
              ? 'Loading every place in Prague…'
              : near
                ? `${count(near.list.length)} within ${formatDistance(near.radius)}`
                : inView.total === filtered.length
                ? count(filtered.length)
                : `${count(inView.total)} here · ${filtered.length.toLocaleString('en-GB')} in Prague`}
          </Text>
        </View>
      </View>
    ) : tab === 'plan' ? (
      <View style={styles.sentence}>
        <SentenceLine>
          <Words>I have</Words>
          <SentenceChip label={planTimes.find((t) => t.id === plan.time)!.label} hint="Choose how long" open={picking === 'plan-time'} onPress={() => openPicker('plan-time')} />
          <Words>and want to</Words>
          <SentenceChip label={activityPhrase(plan.activity)} hint="Choose an activity" open={picking === 'plan-activity'} onPress={() => openPicker('plan-activity')} />
        </SentenceLine>
        <SentenceLine>
          <Words>in</Words>
          <SentenceChip label={areaLabel(plan.area)} hint="Choose an area" open={picking === 'plan-area'} onPress={() => openPicker('plan-area')} />
          <Words>for</Words>
          <SentenceChip label={planBudgets.find((b) => b.id === plan.budget)!.label} hint="Choose a budget" open={picking === 'plan-budget'} onPress={() => openPicker('plan-budget')} />
        </SentenceLine>
      </View>
    ) : (
      <View style={styles.sentence}>
        <Words>{tab === 'people' ? 'People and meetups' : savedPlaces.length ? 'Places you saved' : 'Nothing saved yet'}</Words>
      </View>
    );

  const chooser = (() => {
    switch (picking) {
      // One tap: the chip becomes what was picked.
      case 'activity':
        return (
          <Chooser
            title="What do you want to do?"
            multiple={false}
            options={activities.map((a) => ({ id: a.id, label: cap(a.phrase), icon: a.icon }))}
            selected={replacing ? [replacing] : []}
            onToggle={(id) => {
              // The other chips stay; this one becomes `id`.
              setWanted((w) => toggleActivity(replacing ? w.filter((a) => a !== replacing && a !== id) : [], id));
              setPicking(null);
            }}
            onDone={() => setPicking(null)}
          />
        );
      // "+": several at once.
      case 'activity-add':
        return (
          <Chooser
            title="Mix activities"
            note="Places that fit any of them show up."
            multiple
            options={activities.map((a) => ({ id: a.id, label: cap(a.phrase), icon: a.icon }))}
            selected={wanted}
            onToggle={(id) => setWanted((w) => toggleActivity(w, id))}
            onDone={() => setPicking(null)}
          />
        );
      case 'area':
      case 'plan-area': {
        const current = picking === 'area' ? area : plan.area;
        return (
          <Chooser
            title="Where?"
            multiple={false}
            options={[
              { id: NEAR, label: 'Near me', icon: 'locate' as const, note: userLocation ? 'Within walking distance' : 'Uses your location' },
              ...areas.map((a) => ({
                id: a,
                label: areaLabel(a),
                note: `${places.filter((p) => a === 'prague' || p.district === a).length} places`,
              })),
            ]}
            selected={[current]}
            onToggle={(id) => {
              const apply = (a: string) => {
                if (picking === 'area') {
                  choseArea.current = true;
                  setArea(a);
                } else setPlan((p) => ({ ...p, area: a }));
              };
              setPicking(null);
              if (id === NEAR) chooseNear(apply);
              else apply(id);
            }}
            onDone={() => setPicking(null)}
          />
        );
      }
      case 'plan-time':
        return (
          <Chooser
            title="How long do you have?"
            multiple={false}
            options={planTimes}
            selected={[plan.time]}
            onToggle={(id) => {
              setPlan((p) => ({ ...p, time: id }));
              setPicking(null);
            }}
            onDone={() => setPicking(null)}
          />
        );
      case 'plan-activity':
        return (
          <Chooser
            title="What would you like to do?"
            multiple={false}
            options={activities.map((a) => ({ id: a.id, label: cap(a.phrase), icon: a.icon }))}
            selected={[plan.activity]}
            onToggle={(id) => {
              setPlan((p) => ({ ...p, activity: id }));
              setPicking(null);
            }}
            onDone={() => setPicking(null)}
          />
        );
      case 'plan-budget':
        return (
          <Chooser
            title="What would you like to spend?"
            multiple={false}
            options={planBudgets}
            selected={[plan.budget]}
            onToggle={(id) => {
              setPlan((p) => ({ ...p, budget: id }));
              setPicking(null);
            }}
            onDone={() => setPicking(null)}
          />
        );
      default:
        return null;
    }
  })();


  return (
    <View style={[styles.root, { backgroundColor: ex.sheet }]} onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}>
      <ExploreMap
        ref={map}
        places={shown}
        prefer={prefer}
        selectedId={activeId}
        onSelect={selectFromMap}
        insets={{ top: insets.top + BAR + space.sm, bottom: covered(stop) }}
        layer={layer}
        userLocation={userLocation}
        reduceMotion={reduceMotion}
        // Open on everything the sentence found, framed above the sheet.
        onReady={() => map.current?.fit(shown, covered(stop))}
        onBoundsChange={setBounds}
      />

      <Animated.View style={[styles.bar, { top: insets.top + space.sm }, barStyle]} pointerEvents={stop === 'high' ? 'none' : 'box-none'}>
        <View
          style={[styles.brand, { backgroundColor: ex.float, borderColor: ex.line, boxShadow: ex.shadow }]}
          accessibilityRole="header"
          accessibilityLabel="CzechLocal: explore Prague">
          <BrandMark size={24} />
          <Text maxFontSizeMultiplier={1.4} style={[styles.wordmark, { color: ex.ink }]}>
            CzechLocal
          </Text>
        </View>
        <View style={styles.controls}>
          <RoundButton icon="search" label="Search places" onPress={startSearch} />
          <RoundButton
            icon="layers"
            label="Map style"
            value={layerLabels[layer]}
            expanded={layersOpen}
            onPress={() => setLayersOpen((o) => !o)}
          />
          {canLocate ? <RoundButton icon="locate" label="Show where I am" onPress={locate} /> : null}
        </View>
      </Animated.View>

      {layersOpen ? (
        <View style={[styles.menu, { top: insets.top + space.sm + BAR + space.sm, backgroundColor: ex.float, borderColor: ex.line, boxShadow: ex.shadow }]}>
          {mapLayers.map((l) => (
            <Pressable
              key={l}
              onPress={() => {
                setLayer(l);
                setLayersOpen(false);
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: l === layer }}
              style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: ex.sheetMuted }]}>
              <Text variant="body" weight={l === layer ? '600' : '400'} style={{ color: ex.ink }}>
                {layerLabels[l]}
              </Text>
              {l === layer ? <Icon name="check" size={16} color={ex.chipInk} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {notice ? (
        <View style={[styles.notice, { top: insets.top + space.sm + BAR + space.sm, backgroundColor: ex.ink }]} pointerEvents="none">
          <Text variant="subhead" weight="500" style={{ color: ex.sheet }}>
            {notice}
          </Text>
        </View>
      ) : null}

      <ExploreSheet
        ref={sheet}
        snaps={snaps}
        stop={stop}
        onStopChange={setStop}
        top={top}
        height={H}
        bottomInset={tabBar}
        reduceMotion={reduceMotion}
        tabs={tabs}
        tab={tab}
        onTab={(t) => {
          setTab(t);
          setPicking(null);
          if (t !== 'explore') setSearching(false);
          sheet.current?.scrollTo(0);
          if (stop === 'low') sheet.current?.snapTo('mid');
        }}
        header={header}
        onHeaderHeight={(h) => setHeaderHeight((old) => (Math.abs(old - h) > 1 ? Math.round(h) : old))}>
        {chooser ??
          (tab === 'explore' ? (
            <>
              {error ? (
                <View style={[styles.offline, { backgroundColor: ex.card, borderColor: ex.line }]}>
                  <Text variant="subhead" style={[styles.offlineText, { color: ex.ink2 }]}>
                    {error}
                  </Text>
                  <Pressable onPress={retry} accessibilityRole="button" hitSlop={8}>
                    <Text variant="subhead" weight="600" chrome style={{ color: ex.chipInk }}>
                      Try again
                    </Text>
                  </Pressable>
                </View>
              ) : null}
              {inView.list.length ? (
                <>
                  <PlaceList places={inView.list} selectedId={activeId} from={userLocation} onSelect={selectFromList} />
                  {inView.total > inView.list.length ? (
                    <Text variant="footnote" style={[styles.more, { color: ex.ink3 }]}>
                      {userLocation ? 'Nearest first.' : 'The best first.'} Zoom in to see the rest of the {inView.total.toLocaleString('en-GB')} here.
                    </Text>
                  ) : null}
                </>
              ) : filtered.length ? (
                <View style={[styles.empty, { backgroundColor: ex.card, borderColor: ex.line }]}>
                  <Text variant="headline" style={{ color: ex.ink }}>
                    None in this part of the map
                  </Text>
                  <Text variant="subhead" style={{ color: ex.ink2 }}>
                    {count(filtered.length)} fit your choices elsewhere in Prague.
                  </Text>
                  <Pressable
                    onPress={() => map.current?.fit(filtered, covered(stop))}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.inkButton, { backgroundColor: ex.ink, opacity: pressed ? 0.8 : 1 }]}>
                    <Text variant="subhead" weight="600" chrome style={{ color: ex.sheet }}>
                      Show them all
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={[styles.empty, { backgroundColor: ex.card, borderColor: ex.line }]}>
                  <Text variant="headline" style={{ color: ex.ink }}>
                    Nothing here matches
                  </Text>
                  <Text variant="subhead" style={{ color: ex.ink2 }}>
                    {query ? `No place called “${query}” fits these choices.` : 'Try another activity, or the whole of Prague.'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setWanted([]);
                      setArea('prague');
                      setQuery('');
                    }}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.inkButton, { backgroundColor: ex.ink, opacity: pressed ? 0.8 : 1 }]}>
                    <Text variant="subhead" weight="600" chrome style={{ color: ex.sheet }}>
                      Show everything
                    </Text>
                  </Pressable>
                </View>
              )}
              <SourceNote />
            </>
          ) : tab === 'plan' ? (
            <PlanPanel
              plan={plan}
              matches={filterPlaces(places, { activities: [plan.activity], area: plan.area, near: userLocation }).length}
              onShow={() => {
                setWanted([plan.activity]);
                setArea(plan.area);
                setQuery('');
                setSearching(false);
                setTab('explore');
                sheet.current?.snapTo('mid');
              }}
            />
          ) : tab === 'people' ? (
            <PeoplePanel />
          ) : savedPlaces.length ? (
            <PlaceList places={savedPlaces} selectedId={activeId} from={userLocation} onSelect={selectFromList} />
          ) : (
            <SavedEmpty />
          ))}
      </ExploreSheet>

      {selectedPlace && stop !== 'high' ? (
        <Animated.View style={[styles.preview, previewStyle]} pointerEvents="box-none">
          <PlacePreview
            place={selectedPlace}
            from={userLocation}
            reduceMotion={reduceMotion}
            onClose={() => setSelectedId(null)}
            onDetails={() => router.push({ pathname: '/explore/place/[id]', params: { id: selectedPlace.id } })}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const tabLabels: Record<Tab, string> = { explore: 'Explore', plan: 'Plan', people: 'People', saved: 'Saved' };

/**
 * Plan (AI planning) and People (events) stay out until they work for real: a tab that only says
 * "not live yet" is a placeholder, and App Review rejects those. Their panels are kept for then.
 */
const SHOWN_TABS: Tab[] = ['explore', 'saved'];

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function RoundButton({
  icon,
  label,
  value,
  expanded,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  expanded?: boolean;
  onPress: () => void;
}) {
  const { ex } = useExploreTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={value ? { text: value } : undefined}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.round,
        { backgroundColor: expanded ? ex.chip : ex.float, borderColor: expanded ? ex.chipLine : ex.line, boxShadow: ex.shadow, opacity: pressed ? 0.8 : 1 },
      ]}>
      <Icon name={icon} size={19} color={expanded ? ex.chipInk : ex.ink} />
    </Pressable>
  );
}

/** Where the places and the map come from. OpenStreetMap's licence asks for this credit. */
function SourceNote() {
  const { ex } = useExploreTheme();
  return (
    <View style={styles.sourceNote}>
      <Text variant="footnote" style={{ color: ex.ink3 }}>
        Places come from OpenStreetMap, the map anyone can edit, and are refreshed regularly. Private and school-only
        places are left out. No opening hours or prices are shown: check before you go.
      </Text>
      <Pressable onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')} accessibilityRole="link" hitSlop={6}>
        <Text variant="footnote" weight="500" style={{ color: ex.ink2 }}>
          {process.env.EXPO_OS === 'web' ? 'Data and map: © OpenStreetMap contributors · OpenFreeMap · © OpenMapTiles' : 'Place data © OpenStreetMap contributors'}
        </Text>
      </Pressable>
    </View>
  );
}

const count = (n: number) => (n === 1 ? '1 place' : `${n.toLocaleString('en-GB')} places`);

const styles = StyleSheet.create({
  wordmark: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, letterSpacing: -0.2 },
  root: { flex: 1 },
  bar: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    height: BAR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: BAR,
    paddingLeft: 10,
    paddingRight: space.lg,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  controls: { flexDirection: 'row', gap: space.sm },
  round: { width: BAR, height: BAR, borderRadius: BAR / 2, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  menu: {
    position: 'absolute',
    right: layout.gutter,
    minWidth: 180,
    borderRadius: radius.tile + 2,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: space.xs,
    overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: space.lg },
  notice: { position: 'absolute', left: layout.gutter, right: layout.gutter, borderRadius: radius.tile, paddingHorizontal: space.lg, paddingVertical: space.md },
  sentence: { gap: space.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.tile,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: space.xs,
  },
  searchInput: { flex: 1, fontSize: 17, minHeight: 44 },
  resultLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xxs },
  offline: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, padding: space.lg },
  offlineText: { flex: 1 },
  more: { textAlign: 'center', paddingHorizontal: space.lg },
  empty: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.xl, gap: space.sm, alignItems: 'flex-start' },
  inkButton: { minHeight: 44, paddingHorizontal: space.xl, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: space.xs },
  sourceNote: { gap: space.sm, paddingTop: space.sm, paddingHorizontal: space.xs },
  preview: { position: 'absolute', left: 0, right: 0 },
});
