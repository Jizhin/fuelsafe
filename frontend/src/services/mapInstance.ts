import type maplibregl from "maplibre-gl";

let _map: maplibregl.Map | null = null;
export const setMapInstance = (m: maplibregl.Map) => { _map = m; };
export const getMap = () => _map;
