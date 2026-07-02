import L from "leaflet"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
} from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"

// Leaflet CSS imports
import "leaflet/dist/leaflet.css"
import "react-leaflet-cluster/dist/assets/MarkerCluster.css"
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css"

// Geoman Drawing tool imports
import "@geoman-io/leaflet-geoman-free"
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css"

// Heatmap layer import (attaches to L globally)
import "leaflet.heat"

import markerIcon from "leaflet/dist/images/marker-icon.png"
// Fix Leaflet's default marker icons in Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// --- Mock Data ---
// San Francisco Coordinates
const MAP_CENTER: [number, number] = [37.7749, -122.4194]

// Mock points for Marker Clustering (Store Locations / Assets)
const clusterMarkers = [
  {
    position: [37.7749, -122.4194] as [number, number],
    titleKey: "map.sfCenter",
  },
  {
    position: [37.7833, -122.4167] as [number, number],
    titleKey: "map.unionSquare",
  },
  {
    position: [37.7699, -122.4468] as [number, number],
    titleKey: "map.haightAshbury",
  },
  {
    position: [37.808, -122.4177] as [number, number],
    titleKey: "map.fisherman",
  },
  {
    position: [37.7608, -122.435] as [number, number],
    titleKey: "map.castro",
  },
  {
    position: [37.7599, -122.4148] as [number, number],
    titleKey: "map.mission",
  },
  {
    position: [37.7891, -122.4014] as [number, number],
    titleKey: "map.financial",
  },
  {
    position: [37.7785, -122.3892] as [number, number],
    titleKey: "map.oracle",
  },
  {
    position: [37.7649, -122.3994] as [number, number],
    titleKey: "map.missionBay",
  },
  {
    position: [37.7954, -122.3937] as [number, number],
    titleKey: "map.ferryBuilding",
  },
]

// Mock points for Heatmap (lat, lng, intensity)
const heatmapPoints: [number, number, number][] = [
  [37.7749, -122.4194, 0.9],
  [37.7752, -122.42, 0.8],
  [37.774, -122.418, 0.6],
  [37.7833, -122.4167, 0.75],
  [37.784, -122.418, 0.85],
  [37.782, -122.415, 0.5],
  [37.7699, -122.4468, 0.95],
  [37.7705, -122.445, 0.7],
  [37.768, -122.448, 0.65],
  [37.7599, -122.4148, 0.8],
  [37.761, -122.416, 0.85],
  [37.758, -122.413, 0.9],
  [37.7891, -122.4014, 0.75],
  [37.79, -122.403, 0.7],
]

// --- Sub-components to hook into Leaflet map instance ---

export interface DrawnShape {
  id: number
  type: string
  coordinates: string
  geometry: {
    position?: [number, number]
    center?: [number, number]
    radius?: number
    positions?: [number, number][] | [number, number][][]
    bounds?: [[number, number], [number, number]]
  }
}

export const formatCoordinates = (type: string, layer: any): string => {
  if (type === "Marker") {
    const latlng = layer.getLatLng()
    return `Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`
  }
  if (type === "Circle") {
    const latlng = layer.getLatLng()
    const radius = layer.getRadius()
    return `Center: [${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}], Radius: ${radius.toFixed(1)}m`
  }

  // Polygons, Rectangles, Polylines
  const latlngs = layer.getLatLngs()
  const formatted = Array.isArray(latlngs[0])
    ? (latlngs[0] as any[])
        .map((p: any) => `[${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}]`)
        .join(", ")
    : (latlngs as any[])
        .map((p: any) => `[${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}]`)
        .join(", ")
  return `Coords: [${formatted}]`
}

export const getShapeGeometry = (type: string, layer: any) => {
  if (type === "Marker") {
    const latlng = layer.getLatLng()
    return { position: [latlng.lat, latlng.lng] as [number, number] }
  }
  if (type === "Circle") {
    const latlng = layer.getLatLng()
    const radius = layer.getRadius()
    return {
      center: [latlng.lat, latlng.lng] as [number, number],
      radius: radius,
    }
  }
  if (type === "Rectangle") {
    const bounds = layer.getBounds()
    const northEast = bounds.getNorthEast()
    const southWest = bounds.getSouthWest()
    return {
      bounds: [
        [southWest.lat, southWest.lng],
        [northEast.lat, northEast.lng],
      ] as [[number, number], [number, number]],
    }
  }
  if (type === "Polygon") {
    const latlngs = layer.getLatLngs()
    const coords = Array.isArray(latlngs[0])
      ? (latlngs[0] as any[]).map((p) => [p.lat, p.lng] as [number, number])
      : (latlngs as any[]).map((p) => [p.lat, p.lng] as [number, number])
    return { positions: coords }
  }
  if (type === "Line") {
    const latlngs = layer.getLatLngs()
    const coords = (latlngs as any[]).map(
      (p) => [p.lat, p.lng] as [number, number],
    )
    return { positions: coords }
  }
  return {}
}

// 1. Geoman Drawing Controls Component
interface GeomanControlsProps {
  enabled: boolean
  onDrawCreate: (info: Omit<DrawnShape, "id">) => void
}

function GeomanControls({ enabled, onDrawCreate }: GeomanControlsProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    if (enabled) {
      // Add Geoman drawing and editing controls
      map.pm.addControls({
        position: "topleft",
        drawMarker: true,
        drawCircleMarker: false,
        drawPolyline: true,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: true,
        editMode: true,
        dragMode: true,
        cutPolygon: false,
        removalMode: true,
      })

      // Event listener for shape creation
      const handleCreate = (e: any) => {
        const layer = e.layer
        const type = e.shape
        const coordinates = formatCoordinates(type, layer)
        const geometry = getShapeGeometry(type, layer)

        onDrawCreate({ type, coordinates, geometry })

        // Remove the layer created by Geoman so React-Leaflet renders it instead
        layer.remove()
      }

      map.on("pm:create", handleCreate)

      return () => {
        map.pm.removeControls()
        map.off("pm:create", handleCreate)
      }
    }
    map.pm.removeControls()
  }, [map, enabled, onDrawCreate])

  return null
}

// 2. Heatmap Layer Component
interface HeatmapLayerProps {
  points: [number, number, number][]
}

function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    // Create Leaflet Heatmap Layer
    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 18,
      max: 1.0,
      gradient: {
        0.4: "blue",
        0.6: "cyan",
        0.7: "lime",
        0.8: "yellow",
        1.0: "red",
      },
    })

    heatLayer.addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, points])

  return null
}

// --- Main Map Component ---
export default function LeafletMap() {
  const [showClusters, setShowClusters] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showDrawingTools, setShowDrawingTools] = useState(true)
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([])
  const { t } = useTranslation()

  const handleDrawCreate = (info: Omit<DrawnShape, "id">) => {
    setDrawnShapes((prev) => [...prev, { ...info, id: Date.now() }])
  }

  const clearDrawnShapes = () => {
    setDrawnShapes([])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Control Panel */}
      <div className="lg:col-span-1 flex flex-col gap-6 p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {t("map.controlsTitle")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t("map.controlsDesc")}
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showClusters}
              onChange={(e) => setShowClusters(e.target.checked)}
              className="h-4 w-4 rounded-sm border-primary accent-primary text-primary-foreground focus:ring-primary"
            />
            <span className="text-sm font-medium">{t("map.clusters")}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="h-4 w-4 rounded-sm border-primary accent-primary text-primary-foreground focus:ring-primary"
            />
            <span className="text-sm font-medium">{t("map.heatmap")}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDrawingTools}
              onChange={(e) => setShowDrawingTools(e.target.checked)}
              className="h-4 w-4 rounded-sm border-primary accent-primary text-primary-foreground focus:ring-primary"
            />
            <span className="text-sm font-medium">{t("map.drawing")}</span>
          </label>
        </div>

        {/* Drawn Shapes List */}
        <div className="flex-1 flex flex-col min-h-[150px]">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold">
              {t("map.drawnGeometries")}
            </h4>
            {drawnShapes.length > 0 && (
              <button
                type="button"
                onClick={clearDrawnShapes}
                className="text-[10px] text-destructive hover:underline"
              >
                {t("map.clearList")}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[220px] border border-dashed rounded-lg p-2 bg-muted/40">
            {drawnShapes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground p-4">
                {t("map.noShapes")}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {drawnShapes.map((shape) => (
                  <li
                    key={shape.id}
                    className="text-[11px] p-2 border rounded bg-card flex flex-col gap-1 border-muted shadow-2xs"
                  >
                    <span className="font-semibold text-primary uppercase">
                      {shape.type}
                    </span>
                    <span className="font-mono text-muted-foreground truncate">
                      {shape.coordinates}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Map Display */}
      <div className="lg:col-span-3 h-[550px] relative rounded-xl border overflow-hidden shadow-sm">
        <MapContainer
          center={MAP_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marker Clustering */}
          {showClusters && (
            <MarkerClusterGroup>
              {clusterMarkers.map((marker, idx) => (
                <Marker key={idx} position={marker.position}>
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-sm">
                        {t(marker.titleKey as any)}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("map.coordinate")}: {marker.position[0]},{" "}
                        {marker.position[1]}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}

          {/* Heatmap Layer */}
          {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

          {/* Geoman Drawing Controls */}
          <GeomanControls
            enabled={showDrawingTools}
            onDrawCreate={handleDrawCreate}
          />

          {/* Custom Drawn Shapes (Controlled Mode) */}
          {drawnShapes.map((shape) => {
            const handlers = {
              "pm:edit": (e: any) => {
                const updatedGeometry = getShapeGeometry(shape.type, e.target)
                const updatedCoordinates = formatCoordinates(
                  shape.type,
                  e.target,
                )
                setDrawnShapes((prev) =>
                  prev.map((s) =>
                    s.id === shape.id
                      ? {
                          ...s,
                          geometry: updatedGeometry,
                          coordinates: updatedCoordinates,
                        }
                      : s,
                  ),
                )
              },
              "pm:dragend": (e: any) => {
                const updatedGeometry = getShapeGeometry(shape.type, e.target)
                const updatedCoordinates = formatCoordinates(
                  shape.type,
                  e.target,
                )
                setDrawnShapes((prev) =>
                  prev.map((s) =>
                    s.id === shape.id
                      ? {
                          ...s,
                          geometry: updatedGeometry,
                          coordinates: updatedCoordinates,
                        }
                      : s,
                  ),
                )
              },
              "pm:remove": () => {
                setDrawnShapes((prev) => prev.filter((s) => s.id !== shape.id))
              },
            }

            if (shape.type === "Marker" && shape.geometry.position) {
              return (
                <Marker
                  key={shape.id}
                  position={shape.geometry.position}
                  eventHandlers={handlers}
                />
              )
            }
            if (
              shape.type === "Circle" &&
              shape.geometry.center &&
              shape.geometry.radius !== undefined
            ) {
              return (
                <Circle
                  key={shape.id}
                  center={shape.geometry.center}
                  radius={shape.geometry.radius}
                  eventHandlers={handlers}
                />
              )
            }
            if (shape.type === "Line" && shape.geometry.positions) {
              return (
                <Polyline
                  key={shape.id}
                  positions={shape.geometry.positions}
                  eventHandlers={handlers}
                />
              )
            }
            if (shape.type === "Polygon" && shape.geometry.positions) {
              return (
                <Polygon
                  key={shape.id}
                  positions={shape.geometry.positions}
                  eventHandlers={handlers}
                />
              )
            }
            if (shape.type === "Rectangle" && shape.geometry.bounds) {
              return (
                <Rectangle
                  key={shape.id}
                  bounds={shape.geometry.bounds}
                  eventHandlers={handlers}
                />
              )
            }
            return null
          })}
        </MapContainer>
      </div>
    </div>
  )
}
