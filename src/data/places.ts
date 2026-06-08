import type { Place } from '@/types'

/**
 * Mock catalog of French places, grouped loosely by région. Static for the
 * prototype — a clean seam to later replace with a geo API / postcode lookup.
 * The guest picks one of these first in the Design step (search or scroll).
 */
export const PLACES: Place[] = [
  // Île-de-France
  { id: 'paris', name: 'Paris', region: 'Île-de-France' },
  { id: 'versailles', name: 'Versailles', region: 'Île-de-France' },
  { id: 'boulogne-billancourt', name: 'Boulogne-Billancourt', region: 'Île-de-France' },
  { id: 'saint-denis', name: 'Saint-Denis', region: 'Île-de-France' },
  { id: 'nanterre', name: 'Nanterre', region: 'Île-de-France' },
  { id: 'mantes-la-jolie', name: 'Mantes-la-Jolie', region: 'Île-de-France' },

  // Auvergne-Rhône-Alpes
  { id: 'lyon', name: 'Lyon', region: 'Auvergne-Rhône-Alpes' },
  { id: 'grenoble', name: 'Grenoble', region: 'Auvergne-Rhône-Alpes' },
  { id: 'saint-etienne', name: 'Saint-Étienne', region: 'Auvergne-Rhône-Alpes' },
  { id: 'villeurbanne', name: 'Villeurbanne', region: 'Auvergne-Rhône-Alpes' },
  { id: 'clermont-ferrand', name: 'Clermont-Ferrand', region: 'Auvergne-Rhône-Alpes' },
  { id: 'annecy', name: 'Annecy', region: 'Auvergne-Rhône-Alpes' },
  { id: 'chambery', name: 'Chambéry', region: 'Auvergne-Rhône-Alpes' },
  { id: 'valence', name: 'Valence', region: 'Auvergne-Rhône-Alpes' },

  // Provence-Alpes-Côte d'Azur
  { id: 'marseille', name: 'Marseille', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'nice', name: 'Nice', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'toulon', name: 'Toulon', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'aix-en-provence', name: 'Aix-en-Provence', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'avignon', name: 'Avignon', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'cannes', name: 'Cannes', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'gap', name: 'Gap', region: "Provence-Alpes-Côte d'Azur" },

  // Occitanie
  { id: 'toulouse', name: 'Toulouse', region: 'Occitanie' },
  { id: 'montpellier', name: 'Montpellier', region: 'Occitanie' },
  { id: 'nimes', name: 'Nîmes', region: 'Occitanie' },
  { id: 'perpignan', name: 'Perpignan', region: 'Occitanie' },
  { id: 'beziers', name: 'Béziers', region: 'Occitanie' },

  // Nouvelle-Aquitaine
  { id: 'bordeaux', name: 'Bordeaux', region: 'Nouvelle-Aquitaine' },
  { id: 'limoges', name: 'Limoges', region: 'Nouvelle-Aquitaine' },
  { id: 'pau', name: 'Pau', region: 'Nouvelle-Aquitaine' },
  { id: 'la-rochelle', name: 'La Rochelle', region: 'Nouvelle-Aquitaine' },
  { id: 'bayonne', name: 'Bayonne', region: 'Nouvelle-Aquitaine' },
  { id: 'poitiers', name: 'Poitiers', region: 'Nouvelle-Aquitaine' },

  // Hauts-de-France
  { id: 'lille', name: 'Lille', region: 'Hauts-de-France' },
  { id: 'amiens', name: 'Amiens', region: 'Hauts-de-France' },
  { id: 'roubaix', name: 'Roubaix', region: 'Hauts-de-France' },
  { id: 'dunkerque', name: 'Dunkerque', region: 'Hauts-de-France' },
  { id: 'calais', name: 'Calais', region: 'Hauts-de-France' },

  // Grand Est
  { id: 'strasbourg', name: 'Strasbourg', region: 'Grand Est' },
  { id: 'reims', name: 'Reims', region: 'Grand Est' },
  { id: 'metz', name: 'Metz', region: 'Grand Est' },
  { id: 'nancy', name: 'Nancy', region: 'Grand Est' },
  { id: 'mulhouse', name: 'Mulhouse', region: 'Grand Est' },
  { id: 'colmar', name: 'Colmar', region: 'Grand Est' },
  { id: 'troyes', name: 'Troyes', region: 'Grand Est' },

  // Pays de la Loire
  { id: 'nantes', name: 'Nantes', region: 'Pays de la Loire' },
  { id: 'angers', name: 'Angers', region: 'Pays de la Loire' },
  { id: 'le-mans', name: 'Le Mans', region: 'Pays de la Loire' },
  { id: 'saint-nazaire', name: 'Saint-Nazaire', region: 'Pays de la Loire' },

  // Bretagne
  { id: 'rennes', name: 'Rennes', region: 'Bretagne' },
  { id: 'brest', name: 'Brest', region: 'Bretagne' },
  { id: 'quimper', name: 'Quimper', region: 'Bretagne' },
  { id: 'lorient', name: 'Lorient', region: 'Bretagne' },
  { id: 'vannes', name: 'Vannes', region: 'Bretagne' },

  // Normandie
  { id: 'rouen', name: 'Rouen', region: 'Normandie' },
  { id: 'le-havre', name: 'Le Havre', region: 'Normandie' },
  { id: 'caen', name: 'Caen', region: 'Normandie' },
  { id: 'cherbourg', name: 'Cherbourg', region: 'Normandie' },

  // Bourgogne-Franche-Comté
  { id: 'dijon', name: 'Dijon', region: 'Bourgogne-Franche-Comté' },
  { id: 'besancon', name: 'Besançon', region: 'Bourgogne-Franche-Comté' },
  { id: 'belfort', name: 'Belfort', region: 'Bourgogne-Franche-Comté' },

  // Centre-Val de Loire
  { id: 'tours', name: 'Tours', region: 'Centre-Val de Loire' },
  { id: 'orleans', name: 'Orléans', region: 'Centre-Val de Loire' },
  { id: 'bourges', name: 'Bourges', region: 'Centre-Val de Loire' },

  // Corse
  { id: 'ajaccio', name: 'Ajaccio', region: 'Corse' },
  { id: 'bastia', name: 'Bastia', region: 'Corse' },
]

/** Accent/­case-insensitive key so "etienne" matches "Saint-Étienne". */
function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function getPlace(id: string | null): Place | undefined {
  return PLACES.find((p) => p.id === id)
}

/** Filter places by a free-text query against name + région (accent-insensitive). */
export function searchPlaces(query: string): Place[] {
  const q = fold(query.trim())
  if (!q) return PLACES
  return PLACES.filter((p) => fold(p.name).includes(q) || fold(p.region).includes(q))
}
