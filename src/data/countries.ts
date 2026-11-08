import raw from './countries.json';

export type Country = {
  qid: string;
  name: string;
  iso2: string;
  lat: number;
  lon: number;
  wikiTitle: string;
};

export const COUNTRIES = raw as Country[];
