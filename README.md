# RoofRay

Explore a city in 3D, select a building, and see how solar panels could affect its energy costs. RoofRay combines address search, rooftop solar data, and adjustable savings estimates in a single map view.

*Historical screenshot from before the RoofRay rename.*

## Get started

The application uses Next.js 14, React 18, and TypeScript. Install Node.js and npm, then:

1. Run `npm ci` to install dependencies.
2. Copy `.env.example` to `.env.local` and enter your service credentials.
3. Run `npm run dev`.
4. Open [the dashboard](http://localhost:3000/dashboard).

The root page links to the dashboard. The interactive map lives at `/dashboard`.

## Configure the services

| Environment variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CESIUM_ACCESS_TOKEN` | Cesium ion token for terrain and building assets |
| `NEXT_PUBLIC_CESIUM_ASSET_ID` | Building tileset ID; `96188` is the existing OSM Buildings example |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Token for Mapbox tiles |
| `NEXT_PUBLIC_MAPBOX_STYLE_USERNAME` | Owner of the Mapbox style |
| `NEXT_PUBLIC_MAPBOX_STYLE_ID` | Map style displayed beneath the buildings |
| `GOOGLE_API_KEY` | Server-side key for Places, Geocoding, and Solar requests |

Provide a Cesium ion token with access to your assets and a Mapbox style available to your token. To display a custom city model, upload CityGML data to Cesium ion, convert it to 3D Tiles, and configure the resulting asset ID.

The Google Cloud project needs billing and the Places, Geocoding, and Solar APIs enabled. Optional scripts in `tools/` assist with authentication, project setup, and key creation. Review them before use: they can install system packages and modify Google Cloud resources.

Variables starting with `NEXT_PUBLIC_` are included in the browser bundle. Keep the Google key in the server environment and store local credentials in `.env.local`.

## Use the map

- Search for an address. Use the arrow keys to select a suggestion, Enter to navigate, and Escape to close search.
- Hover over a building to highlight it, then select it to open its details.
- Request solar data from the details panel.
- Adjust the panel count and average monthly electricity bill to compare estimates.

The savings model uses fixed assumptions for energy prices, installation costs, panel capacity, depreciation, and a 25-year installation lifetime. These values live in `src/features/feature-info/solar-calculations.ts`. Results depend on those assumptions and the available Google Solar data.

## Project layout

```text
src/
  app/
    api/                  Server routes for Google service requests
    dashboard/            Map page and dashboard layout
  features/
    map/                  Cesium scene, selection, and camera defaults
    search/               Address search and camera navigation
    feature-info/         Building details and savings calculations
    fade/                 Visibility transitions
    loading/              Map loading overlay
  types/                  Shared TypeScript definitions
tools/                    Optional Google Cloud setup scripts
docs/media/               README images
```

Cesium renders the globe and 3D content through Resium components. Cesium ion supplies terrain and building tilesets; Mapbox supplies the base imagery. Next.js API routes handle Google requests on the server.

During compilation, `next.config.js` copies Cesium workers, widgets, and supporting assets into `public/cesium`. This generated directory is excluded from version control.

### Code conventions

Use kebab-case for source filenames, PascalCase for React components and types, and camelCase for functions and local variables. Components have descriptive filenames such as `solar-map.tsx` and `building-details.tsx`. Fixed model constants use uppercase names. Next.js route filenames retain their framework names, including `page.tsx` and `route.ts`.

### Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run the Next.js ESLint checks |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

## Deployment

The repository includes a Dockerfile and Fly.io configuration. Next.js emits standalone server output, which the Docker image runs with `node server.js`.

Supply the `NEXT_PUBLIC_*` values when building the image; the Dockerfile exposes matching build arguments. Set `GOOGLE_API_KEY` in the server's runtime environment. A Next.js hosting service can also build the project with `npm run build` using the same environment values.

## Current limitations

- React Strict Mode is disabled because of existing Resium lifecycle issues.
- Solar coverage and panel configurations depend on the upstream data.
- Google responses are not stored in a project database for reuse.
- A city-wide solar potential overlay is not implemented.

## Credits

Original contributors:

- Sebastian Stupak: technology research, development, and documentation.
- Michelle Yvonne Jürgens: solar research, development, and design.

The original documentation credits the German Federal Statistical Office for the CityGML data used in the showcase. It links to the [open geodata download](https://opengeodata.lgl-bw.de/#/(sidenav:product/12)) and the [Data Licence Germany - Attribution - Version 2.0](https://www.govdata.de/dl-de/by-2-0).

See [LICENSE](LICENSE) for the software license.
