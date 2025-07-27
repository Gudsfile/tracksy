# Tracksy app

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📊 Charts Component

The `Charts` component is responsible for orchestrating and rendering visualizations in the app. It manages how different components interact with each other, such as coordinating between the `RangeSlider` and `StreamPerHour` components. Below is a mermaid diagram that illustrates how the `Charts` works (without the summarize query):

```mermaid
sequenceDiagram
  actor SummaryPerYear
  actor StreamPerMonth
  actor Charts as Charts (Main Component)
  actor StreamPerHour
  actor RangeSlider

  Charts ->> SummaryPerYear: render
  Charts ->> StreamPerHour: render with default year
  Charts ->> RangeSlider: render with default year
  Charts ->> StreamPerMonth: render
  RangeSlider ->> Charts: year=2006
  Charts ->> StreamPerHour: render with year=2006
  RangeSlider ->> Charts: year=2007
  Charts ->> StreamPerHour: render with year=2007
```

This flow shows how user interaction leads to the rendering of dynamic charts based on fetched data.
