/**
 * Explore: outdoor places in Prague on a map. Shared shapes for the map, the filters, the cards
 * and the saved list. Records mirror the `explore_places` table (supabase/migrations).
 */

/** What someone wants to do: the chips in "I want to …". */
export type ActivityId = 'walk' | 'viewpoint' | 'workout' | 'cycling' | 'sport' | 'kids' | 'nature' | 'garden' | 'hidden';

/** What a place is: decides its pin. */
export type PlaceCategory = 'park' | 'viewpoint' | 'sports' | 'garden' | 'playground' | 'leisure' | 'nature' | 'hidden';

export type LatLng = { latitude: number; longitude: number };

export type ExplorePlace = {
  id: string;
  /** The place's own name, or a plain label for unnamed ones ("Playground in Žižkov"). */
  name: string;
  /** The Czech name, when the English one differs. */
  nameCs?: string;
  /** Whether `name` is the place's real name, not a label made up from its type. */
  named: boolean;
  category: PlaceCategory;
  /** Municipal district, e.g. 'Praha 7' or 'Praha-Troja'. */
  district: string;
  /** The neighbourhood people use, e.g. 'Holešovice'. */
  quarter?: string;
  latitude: number;
  longitude: number;
  /** Size of the area, for parks, gardens and woods. */
  areaHa?: number;
  activities: ActivityId[];
  /** Lasting facts (Lit at night, Basketball, 12 ha); never prices, hours or crowds. */
  attributes: string[];
  description: string;
  /** Only a photo whose source and licence were checked. */
  photo?: { uri: string; credit: string };
  /** 'osm': OpenStreetMap. 'curated': written up by CzechPal (and checked on the map). */
  source: 'osm' | 'curated';
  /** The place on openstreetmap.org, for OSM places. */
  sourceUrl?: string;
  checkedOn: string;
};

/** The whole city, or one district. */
export type Area = 'prague' | string;
