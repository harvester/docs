"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const postman_collection_1 = __importDefault(
  require("@paloaltonetworks/postman-collection")
);
const Curl_1 = __importDefault(require("@theme/ApiDemoPanel/Curl"));
function ApiDemoPanel({ item, infoPath }) {
  const postman = new postman_collection_1.default.Request(item.postman);
  return react_1.default.createElement(
    react_1.default.Fragment,
    null,
    react_1.default.createElement(Curl_1.default, {
      postman: postman,
      codeSamples: item["x-code-samples"] ?? [],
    })
  );
}
exports.default = ApiDemoPanel;
