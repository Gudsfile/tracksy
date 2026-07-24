import { createContext, useContext } from 'react'

// Whether the enclosing tab panel is currently active (visible). Panels stay
// mounted when inactive (see #560), so components that escape the panel's DOM
// subtree — e.g. a `createPortal` to `document.body` — must consult this to
// avoid rendering while their panel is hidden. Defaults to `true` so consumers
// used outside a TabPanel render normally.
export const TabPanelActiveContext = createContext<boolean>(true)
export const useTabPanelActive = () => useContext(TabPanelActiveContext)
