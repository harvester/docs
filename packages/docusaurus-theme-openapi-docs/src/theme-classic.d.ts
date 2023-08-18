/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/// <reference types="@docusaurus/theme-classic" />

declare module "@docusaurus/theme-common/internal" {
  function useDoc(): any;
  export const { useDoc };
}
