import type { ActivityId, ExplorePlace, PlaceCategory } from './types';

/** The columns the app reads from `explore_places`. */
export const COLUMNS =
  'id,name,name_cs,named,category,district,quarter,lat,lng,area_ha,activities,attributes,description,photo_url,photo_credit,source,source_url,checked_on';

/** One `explore_places` row, as the client selects it. */
export type Row = {
  id: string;
  name: string;
  name_cs: string | null;
  named: boolean;
  category: PlaceCategory;
  district: string;
  quarter: string | null;
  lat: number;
  lng: number;
  area_ha: number | null;
  activities: ActivityId[];
  attributes: string[];
  description: string;
  photo_url: string | null;
  photo_credit: string | null;
  source: 'osm' | 'curated';
  source_url: string | null;
  checked_on: string;
};

export function fromRow(r: Row): ExplorePlace {
  return {
    id: r.id,
    name: r.name,
    ...(r.name_cs ? { nameCs: r.name_cs } : {}),
    named: r.named,
    category: r.category,
    district: r.district,
    ...(r.quarter ? { quarter: r.quarter } : {}),
    latitude: r.lat,
    longitude: r.lng,
    ...(r.area_ha !== null ? { areaHa: r.area_ha } : {}),
    activities: r.activities,
    attributes: r.attributes,
    description: r.description,
    // The table only stores photos whose licence was checked; both fields or neither.
    ...(r.photo_url && r.photo_credit ? { photo: { uri: r.photo_url, credit: r.photo_credit } } : {}),
    source: r.source,
    ...(r.source_url ? { sourceUrl: r.source_url } : {}),
    checkedOn: r.checked_on,
  };
}
