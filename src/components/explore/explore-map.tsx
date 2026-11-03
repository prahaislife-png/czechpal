import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import MapView, { Marker, type MapStyleElement, type Region } from 'react-native-maps';

import { boundsOf, categories, LABEL_WORLD_SIZE, pinsInView, PRAGUE, type Bounds, type Cluster } from '@/lib/explore/filter';
import type { LatLng } from '@/lib/explore/types';
import { useTheme } from '@/theme/use-theme';

import { ClusterPin, pinAnchorY, PlacePin } from './map-pin';
import { flyMs, grow, visibleBounds, type ExploreMapProps, type MapLayer } from './map-types';

const START: Region = { ...PRAGUE, latitudeDelta: 0.11, longitudeDelta: 0.11 };

const boundsOfRegion = (r: Region): Bounds => ({
  south: r.latitude - r.latitudeDelta / 2,
  north: r.latitude + r.latitudeDelta / 2,
  west: r.longitude - r.longitudeDelta / 2,
  east: r.longitude + r.longitudeDelta / 2,
});

const mapType = (layer: MapLayer) =>
  layer === 'satellite' ? 'hybrid' : layer === 'light' ? (process.env.EXPO_OS === 'ios' ? 'mutedStandard' : 'standard') : 'standard';

/**
 * The native map: Apple Maps on iOS, Google Maps on Android, both bundled in Expo Go and free.
 * Pins are grouped when they would overlap; tapping a group zooms in to it.
 */
export function ExploreMap({ ref, places, prefer, selectedId, onSelect, insets, layer, userLocation, reduceMotion, onReady, onBoundsChange }: ExploreMapProps) {
  const map = useRef<MapView>(null);
  const { width, height } = useWindowDimensions();
  const { scheme } = useTheme();
  const [region, setRegion] = useState<Region>(START);

  // The best few dozen places in the visible part of the map become pins; zooming in brings out more.
  const worldSize = (width * 360) / region.longitudeDelta;
  const labels = worldSize >= LABEL_WORLD_SIZE;
  const clusters = useMemo(
    // Named pins need room for their names.
    () => pinsInView(places, grow(visibleBounds(boundsOfRegion(region), insets, height), 0.1), worldSize, selectedId, 45, labels ? 64 : 38, prefer),
    [places, region, insets.top, insets.bottom, height, worldSize, labels, selectedId, prefer], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const pad = (bottom = insets.bottom) => ({ top: insets.top + 24, bottom: bottom + 24, left: 36, right: 36 });

  useImperativeHandle(ref, () => ({
    // Fitting a small box round the place (rather than centring on it) honours the padding on
    // both platforms, so the place lands in the part of the map the sheet leaves visible.
    focus: (p: LatLng, bottom?: number) => {
      const visible = Math.max(0.2, (height - insets.top - (bottom ?? insets.bottom)) / height);
      const dLat = Math.max(0.0025, Math.min(region.latitudeDelta, 0.04) * visible * 0.3);
      const dLng = Math.max(0.0035, Math.min(region.longitudeDelta, 0.04) * 0.3);
      map.current?.fitToCoordinates(
        [
          { latitude: p.latitude - dLat, longitude: p.longitude - dLng },
          { latitude: p.latitude + dLat, longitude: p.longitude + dLng },
        ],
        { edgePadding: pad(bottom), animated: !reduceMotion },
      );
    },
    fit: (points: LatLng[], bottom?: number) => {
      const b = boundsOf(points, 0);
      if (!b) return;
      map.current?.fitToCoordinates(
        [
          { latitude: b.south, longitude: b.west },
          { latitude: b.north, longitude: b.east },
        ],
        { edgePadding: pad(bottom), animated: !reduceMotion },
      );
    },
  }));

  // Move to the user once, when their location first arrives.
  const located = useRef(false);
  useEffect(() => {
    if (!userLocation || located.current) return;
    located.current = true;
    map.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.03, longitudeDelta: 0.03 }, flyMs(reduceMotion));
  }, [userLocation, reduceMotion]);

  // Tapping a group zooms in two steps towards it (or straight to it, if it's small).
  const zoomInto = (c: Extract<Cluster, { kind: 'cluster' }>) => {
    const b = boundsOf(c.places, 0.2)!;
    // Half the box: the group's own size, but at most an eighth of today's view (two zoom steps).
    const dLat = Math.min(Math.max((b.north - b.south) / 2, 0.002), region.latitudeDelta / 8);
    const dLng = Math.min(Math.max((b.east - b.west) / 2, 0.003), region.longitudeDelta / 8);
    map.current?.fitToCoordinates(
      [
        { latitude: c.latitude - dLat, longitude: c.longitude - dLng },
        { latitude: c.latitude + dLat, longitude: c.longitude + dLng },
      ],
      { edgePadding: pad(), animated: !reduceMotion },
    );
  };

  // The list shows what's in the visible part of the map, so it follows the sheet as well.
  useEffect(() => {
    onBoundsChange(visibleBounds(boundsOfRegion(region), insets, height));
  }, [region, insets.top, insets.bottom, height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      initialRegion={START}
      onMapReady={onReady}
      onRegionChangeComplete={setRegion}
      mapType={mapType(layer)}
      userInterfaceStyle={scheme}
      customMapStyle={process.env.EXPO_OS === 'android' && layer === 'light' ? (scheme === 'dark' ? undefined : warmAndroid) : undefined}
      showsUserLocation={!!userLocation}
      showsPointsOfInterests={layer !== 'light'}
      showsBuildings={false}
      showsTraffic={false}
      showsCompass={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      pitchEnabled={false}
      moveOnMarkerPress={false}
      legalLabelInsets={{ top: 0, left: 12, right: 0, bottom: insets.bottom + 6 }}
      mapPadding={process.env.EXPO_OS === 'android' ? { top: 0, left: 0, right: 0, bottom: insets.bottom } : undefined}
      onPress={(e) => {
        if (e.nativeEvent.action !== 'marker-press') onSelect(null);
      }}>
      {clusters.map((c) =>
        c.kind === 'place' ? (
          <PlaceMarker
            key={`${c.id}:${c.id === selectedId}:${labels}`}
            cluster={c}
            selected={c.id === selectedId}
            label={(labels && c.place.named) || c.id === selectedId ? c.place.name : undefined}
            onPress={() => onSelect(c.id)}
          />
        ) : (
          <ClusterMarker key={c.id} cluster={c} onPress={() => zoomInto(c)} />
        ),
      )}
    </MapView>
  );
}

/** Custom marker views are snapshotted; tracking changes only for a moment keeps panning smooth. */
function useBriefTracking() {
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setTracks(false), 600);
    return () => clearTimeout(t);
  }, []);
  return tracks;
}

function PlaceMarker({
  cluster,
  selected,
  label,
  onPress,
}: {
  cluster: Extract<Cluster, { kind: 'place' }>;
  selected: boolean;
  label?: string;
  onPress: () => void;
}) {
  const tracks = useBriefTracking();
  const { place } = cluster;
  return (
    <Marker
      coordinate={cluster}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={tracks}
      anchor={{ x: 0.5, y: pinAnchorY(!!label) }}
      zIndex={selected ? 10 : label ? 2 : 1}
      accessibilityLabel={`${place.name}, ${categories[place.category].label}`}>
      <PlacePin category={place.category} selected={selected} label={label} />
    </Marker>
  );
}

function ClusterMarker({ cluster, onPress }: { cluster: Extract<Cluster, { kind: 'cluster' }>; onPress: () => void }) {
  const tracks = useBriefTracking();
  return (
    <Marker
      coordinate={cluster}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={tracks}
      anchor={{ x: 0.5, y: 0.5 }}
      accessibilityLabel={`${cluster.places.length} places. Zoom in`}>
      <ClusterPin count={cluster.places.length} />
    </Marker>
  );
}

/** Google Maps, warmed to match the sheet: cream land, soft green parks, pale blue water. */
const warmAndroid: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#F3EEE4' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6F675B' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FBF7EF' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#D9E5C8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#FBF7EF' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#EDE3D0' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#C5D8E5' }] },
];
