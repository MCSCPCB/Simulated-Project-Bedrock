import type { SubLevel } from "../../SubLevel.js";
import type { SubLevelRenderData } from "../SubLevelRenderData.js";

/** Creates the render data used by one projected sub-level. */
export interface SubLevelRenderDispatcher {
  createRenderData(subLevel: SubLevel): SubLevelRenderData;
}
