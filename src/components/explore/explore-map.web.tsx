import 'maplibre-gl/dist/maplibre-gl.css';

import { MapLibreMap, Marker } from 'maplibre-gl';
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pressable, StyleSheet, View } from 'react-native';

import { boundsOf, categories, LABEL_WORLD_SIZE, pinsInView, PRAGUE, type Bounds, type Cluster } from '@/lib/explore/filter';
import type { LatLng } from '@/lib/explore/types';
import { useTheme } from '@/theme/use-theme';

import { ClusterPin, pinCentre, PlacePin } from './map-pin';
import { flyMs, grow, visibleBounds, type ExploreMapProps, type MapLayer } from './map-types';

/** OpenFreeMap: OpenStreetMap vector tiles with no key, no account and no usage fees. */
const styleUrl = (layer: MapLayer, dark: boolean) =>
  `https://tiles.openfreemap.org/styles/${layer === 'detailed' ? 'liberty' : dark ? 'dark' : 'positron'}`;

/** Paint for Positron's layers; a layer a style lacks is skipped. */
const warm: [layer: string, prop: string, value: string][] = [
  ['background', 'background-color', '#F3EEE4'],
  ['landuse_residential', 'fill-color', '#EFE8DA'],
  ['park', 'fill-color', '#D9E5C8'],
  ['landcover_wood', 'fill-color', '#D2E0C0'],
  ['water', 'fill-color', '#C5D8E5'],
  ['waterway', 'line-color', '#C5D8E5'],
  ['building', 'fill-color', '#E7DFD0'],
];

const ZOOM = 12.2;

/** The web map: MapLibre GL, with the same pins as the phone rendered into its markers. */
export function ExploreMap({ ref, places, prefer, selectedId, onSelect, insets, layer, userLocation, reduceMotion, onReady, onBoundsChange }: ExploreMapProps) {
  const { scheme } = useTheme();
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [view, setView] = useState<{ zoom: number; bounds: Bounds | null; height: number }>({ zoom: ZOOM, bounds: null, height: 1 });
  const [ready, setReady] = useState(false);

  const pad = (bottom = insets.bottom) => ({ top: insets.top + 24, bottom: bottom + 24, left: 36, right: 36 });

  const onSelectRef = useRef(onSelect);
  const onReadyRef = useRef(onReady);
  const onBoundsRef = useRef(onBoundsChange);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onReadyRef.current = onReady;
    onBoundsRef.current = onBoundsChange;
  }, [onSelect, onReady, onBoundsChange]);
  const look = useRef({ layer, dark: scheme === 'dark', url: styleUrl(layer, scheme === 'dark') });

  useEffect(() => {
    if (!host.current) return;
    const m = new MapLibreMap({
      container: host.current,
      style: look.current.url,
      center: [PRAGUE.longitude, PRAGUE.latitude],
      zoom: ZOOM,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    m.touchZoomRotate.disableRotation();
    m.on('moveend', () => {
      const b = m.getBounds();
      const bounds = { south: b.getSouth(), north: b.getNorth(), west: b.getWest(), east: b.getEast() };
      setView({ zoom: m.getZoom(), bounds, height: m.getContainer().clientHeight || 1 });
    });
    m.on('load', () => {
      setReady(true);
      onReadyRef.current();
    });
    // Positron is grey; warm it to the sheet's paper each time a light style loads.
    m.on('style.load', () => {
      if (look.current.layer !== 'light' || look.current.dark) return;
      for (const [id, prop, value] of warm) if (m.getLayer(id)) m.setPaintProperty(id, prop as never, value as never);
    });
    m.on('click', (e) => {
      // A click on a pin is handled by the pin; only the bare map clears the selection.
      if ((e.originalEvent.target as HTMLElement).closest('.explore-pin')) return;
      onSelectRef.current(null);
    });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // Style follows the layer control and the colour scheme.
  useEffect(() => {
    const url = styleUrl(layer, scheme === 'dark');
    look.current = { layer, dark: scheme === 'dark', url: look.current.url };
    if (!map.current || look.current.url === url) return;
    look.current.url = url;
    map.current.setStyle(url);
  }, [layer, scheme]);

  const labels = 512 * 2 ** view.zoom >= LABEL_WORLD_SIZE;
  // The best few dozen places in the visible part of the map become pins; zooming in brings out more.
  const clusters = useMemo(
    () =>
      pinsInView(
        places,
        view.bounds ? grow(visibleBounds(view.bounds, insets, view.height), 0.1) : null,
        512 * 2 ** view.zoom,
        selectedId,
        45,
        // Named pins need room for their names.
        labels ? 64 : 38,
        prefer,
      ),
    [places, view, selectedId, labels, prefer, insets.top, insets.bottom], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // One MapLibre marker per pin; React draws the pin into its element through a portal.
  const markers = useRef(new Map<string, { marker: Marker; el: HTMLDivElement }>());
  const [elements, setElements] = useState<{ cluster: Cluster; el: HTMLDivElement }[]>([]);
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    const live = new Set(clusters.map((c) => c.id));
    for (const [id, { marker }] of markers.current) {
      if (!live.has(id)) {
        marker.remove();
        markers.current.delete(id);
      }
    }
    for (const c of clusters) {
      const existing = markers.current.get(c.id);
      if (existing) {
        existing.marker.setLngLat([c.longitude, c.latitude]);
        continue;
      }
      const el = document.createElement('div');
      el.className = 'explore-pin';
      // Anchored at the pin's centre, with any name hanging below it.
      const marker = new Marker({ element: el, anchor: 'top', offset: [0, -pinCentre()] }).setLngLat([c.longitude, c.latitude]).addTo(m);
      markers.current.set(c.id, { marker, el });
    }
    // The selected pin draws above its neighbours.
    for (const [id, { el }] of markers.current) el.style.zIndex = id === selectedId ? '2' : '1';
    setElements(clusters.map((c) => ({ cluster: c, el: markers.current.get(c.id)!.el })));
  }, [clusters, ready, selectedId]);

  // The user's position, as a plain blue dot.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready || !userLocation) return;
    const el = document.createElement('div');
    el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#2F6BFF;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)';
    const dot = new Marker({ element: el }).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(m);
    m.easeTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 14, padding: pad(), duration: flyMs(reduceMotion) });
    return () => {
      dot.remove();
    };
  }, [userLocation, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    focus: (p: LatLng, bottom?: number) =>
      map.current?.easeTo({
        center: [p.longitude, p.latitude],
        zoom: Math.max(map.current.getZoom(), 14),
        padding: pad(bottom),
        duration: flyMs(reduceMotion),
      }),
    fit: (points: LatLng[], bottom?: number) => {
      const b = boundsOf(points, 0);
      if (!b) return;
      map.current?.fitBounds(
        [
          [b.west, b.south],
          [b.east, b.north],
        ],
        { padding: pad(bottom), maxZoom: 15, duration: flyMs(reduceMotion) },
      );
    },
  }));

  // Tapping a group zooms in two steps towards it (or straight to it, if it's small).
  const zoomInto = (c: Extract<Cluster, { kind: 'cluster' }>) => {
    const m = map.current;
    if (!m) return;
    const b = boundsOf(c.places, 0.2)!;
    const fit = m.cameraForBounds(
      [
        [b.west, b.south],
        [b.east, b.north],
      ],
      { padding: pad() },
    );
    const zoom = Math.min(Math.max(fit?.zoom ?? 0, m.getZoom() + 2), 17);
    m.easeTo({ center: [c.longitude, c.latitude], zoom, padding: pad(), duration: flyMs(reduceMotion) });
  };

  // The list shows what's in the visible part of the map, so it follows the sheet as well.
  useEffect(() => {
    if (!view.bounds) return;
    onBoundsRef.current(visibleBounds(view.bounds, insets, view.height));
  }, [view.bounds, insets.top, insets.bottom]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={StyleSheet.absoluteFill}>
      <div ref={host} style={{ position: 'absolute', inset: 0 }} />
      {elements.map(({ cluster: c, el }) =>
        createPortal(
          c.kind === 'place' ? (
            <Pressable
              onPress={() => onSelect(c.id)}
              accessibilityRole="button"
              accessibilityLabel={`${c.place.name}, ${categories[c.place.category].label}`}
              accessibilityState={{ selected: c.id === selectedId }}>
              <PlacePin
                category={c.place.category}
                selected={c.id === selectedId}
                label={(labels && c.place.named) || c.id === selectedId ? c.place.name : undefined}
              />
            </Pressable>
          ) : (
            <Pressable onPress={() => zoomInto(c)} accessibilityRole="button" accessibilityLabel={`${c.places.length} places. Zoom in`}>
              <ClusterPin count={c.places.length} />
            </Pressable>
          ),
          el,
          c.id,
        ),
      )}
    </View>
  );
}
