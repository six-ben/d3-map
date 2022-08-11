import { useEffect, useMemo, useState } from "react";
import ChinaUrl from "@/assets/geo/china?url";

import nameMap from "@/assets/geo/nameMap.json";

import { geoMercator, geoPath } from "d3-geo";
import styled from "styled-components";
type Path = {
  name: string;
  path: string | null;
  center: [number, number];
};

const SVGWrap = styled.svg`
  width: 100vw;
  height: 100%;
  background: #fafafa;
  position: relative;
`;

export default function D3Map() {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection>();
  const [path, setPath] = useState<Path | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  const fetchGeo = () =>
    fetch(ChinaUrl)
      .then((res) => res.json())
      .catch(() => alert("地图加载失败"));

  useEffect(() => {
    fetchGeo().then((json: GeoJSON.FeatureCollection) => {
      setGeoData(json);
    });
  }, []);

  const scale = useMemo(() => {
    let base = zoom;
    if (1 > zoom) {
      base = 1;
      setZoom(1);
    } else if (zoom > 10) {
      base = 10;
      setZoom(10);
    }
    return base * 10 + 150;
  }, [zoom]);

  const projection = useMemo(() => {
    return geoMercator().center([107, 31]).scale(scale).translate([10, 10]);
  }, [scale]);

  const pathFn = useMemo(() => geoPath().projection(projection), [projection]);

  const paths = useMemo(() => {
    return geoData?.features.map(({ geometry, properties }) => {
      const name: string = properties && properties.name;
      return {
        path: pathFn(geometry),
        center: pathFn.centroid(geometry),
        name: (nameMap as Record<string, string>)[name],
      };
    });
  }, [pathFn, geoData]);

  const renderPath = (data: Path) => {
    if (!data.path) return null;
    const isHover = data.name === path?.name;
    return (
      <path
        key={data.path}
        d={data.path}
        fill={isHover ? "#3b7a33" : "#a5a5a5"}
        stroke="#000"
        strokeWidth={0.1}
        onMouseEnter={() => setPath(data)}
        onMouseLeave={() => setPath(null)}
      ></path>
    );
  };
  return (
    <>
      <SVGWrap viewBox="-180 -90 360 180">
        {paths?.map((data) => renderPath(data))}
        {path && (
          <text
            x={path.center[0]}
            y={path.center[1]}
            fontSize={2}
            pointerEvents="none"
          >
            {path.name}
          </text>
        )}
      </SVGWrap>
      <button onClick={() => setZoom(zoom + 1)}>+</button>
      <button onClick={() => setZoom(zoom - 1)}>-</button>
    </>
  );
}
