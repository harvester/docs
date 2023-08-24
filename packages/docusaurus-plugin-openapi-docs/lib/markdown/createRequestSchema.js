"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestSchema = exports.mergeAllOf = void 0;
const clsx_1 = __importDefault(require("clsx"));
const createArrayBracket_1 = require("./createArrayBracket");
const createDescription_1 = require("./createDescription");
const createDetails_1 = require("./createDetails");
const createDetailsSummary_1 = require("./createDetailsSummary");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
const jsonSchemaMergeAllOf = require("json-schema-merge-allof");
/**
 * Returns a merged representation of allOf array of schemas.
 */
function mergeAllOf(allOf) {
    const mergedSchemas = jsonSchemaMergeAllOf(allOf, {
        resolvers: {
            readOnly: function () {
                return true;
            },
            example: function () {
                return true;
            },
            "x-examples": function () {
                return true;
            },
        },
        ignoreAdditionalProperties: true,
    });
    const required = allOf.reduce((acc, cur) => {
        if (Array.isArray(cur.required)) {
            const next = [...acc, ...cur.required];
            return next;
        }
        return acc;
    }, []);
    return { mergedSchemas, required };
}
exports.mergeAllOf = mergeAllOf;
/**
 * For handling nested anyOf/oneOf.
 */
function createAnyOneOf(schema) {
    const type = schema.oneOf ? "oneOf" : "anyOf";
    return (0, utils_1.create)("div", {
        children: [
            (0, utils_1.create)("span", {
                className: "badge badge--info",
                children: type,
            }),
            (0, utils_1.create)("SchemaTabs", {
                children: schema[type].map((anyOneSchema, index) => {
                    const label = anyOneSchema.title
                        ? anyOneSchema.title
                        : `MOD${index + 1}`;
                    const anyOneChildren = [];
                    if (anyOneSchema.properties !== undefined) {
                        anyOneChildren.push(createProperties(anyOneSchema));
                        delete anyOneSchema.properties;
                    }
                    if (anyOneSchema.allOf !== undefined) {
                        anyOneChildren.push(createNodes(anyOneSchema));
                        delete anyOneSchema.allOf;
                    }
                    if (anyOneSchema.items !== undefined) {
                        anyOneChildren.push(createItems(anyOneSchema));
                        delete anyOneSchema.items;
                    }
                    if (anyOneSchema.type === "string" ||
                        anyOneSchema.type === "number" ||
                        anyOneSchema.type === "integer" ||
                        anyOneSchema.type === "boolean") {
                        anyOneChildren.push(createNodes(anyOneSchema));
                    }
                    if (anyOneChildren.length) {
                        if (schema.type === "array") {
                            return (0, utils_1.create)("TabItem", {
                                label: label,
                                value: `${index}-item-properties`,
                                children: [
                                    (0, createArrayBracket_1.createOpeningArrayBracket)(),
                                    anyOneChildren,
                                    (0, createArrayBracket_1.createClosingArrayBracket)(),
                                ]
                                    .filter(Boolean)
                                    .flat(),
                            });
                        }
                        return (0, utils_1.create)("TabItem", {
                            label: label,
                            value: `${index}-item-properties`,
                            children: anyOneChildren.filter(Boolean).flat(),
                        });
                    }
                    return undefined;
                }),
            }),
        ],
    });
}
function createProperties(schema) {
    const discriminator = schema.discriminator;
    return Object.entries(schema.properties).map(([key, val]) => {
        return createEdges({
            name: key,
            schema: val,
            required: Array.isArray(schema.required)
                ? schema.required.includes(key)
                : false,
            discriminator,
        });
    });
}
function createAdditionalProperties(schema) {
    // TODO?:
    //   {
    //   description: 'Integration configuration. See \n' +
    //     '[Integration Configurations](https://prisma.pan.dev/api/cloud/api-integration-config/).\n',
    //   example: { webhookUrl: 'https://hooks.slack.com/abcdef' },
    //   externalDocs: { url: 'https://prisma.pan.dev/api/cloud/api-integration-config' },
    //   type: 'object'
    // }
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    // TODO?:
    // {
    // items: {
    //     properties: {
    //       aliasField: [Object],
    //       displayName: [Object],
    //       fieldName: [Object],
    //       maxLength: [Object],
    //       options: [Object],
    //       redlockMapping: [Object],
    //       required: [Object],
    //       type: [Object],
    //       typeaheadUri: [Object],
    //       value: [Object]
    //     },
    //     type: 'object'
    //   },
    //   type: 'array'
    // }
    const additionalProperties = schema.additionalProperties;
    const type = additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.type;
    // Handle free-form objects
    if (String(additionalProperties) === "true" && schema.type === "object") {
        return (0, utils_1.create)("SchemaItem", {
            name: "property name*",
            required: false,
            schemaName: "any",
            qualifierMessage: (0, schema_1.getQualifierMessage)(schema.additionalProperties),
            schema: schema,
            collapsible: false,
            discriminator: false,
        });
    }
    if ((type === "object" || type === "array") &&
        ((additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.properties) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.items) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.allOf) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.additionalProperties) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.oneOf) ||
            (additionalProperties === null || additionalProperties === void 0 ? void 0 : additionalProperties.anyOf))) {
        const title = additionalProperties.title;
        const schemaName = (0, schema_1.getSchemaName)(additionalProperties);
        const required = (_a = schema.required) !== null && _a !== void 0 ? _a : false;
        return createDetailsNode("property name*", title !== null && title !== void 0 ? title : schemaName, additionalProperties, required, schema.nullable);
    }
    if (((_b = schema.additionalProperties) === null || _b === void 0 ? void 0 : _b.type) === "string" ||
        ((_c = schema.additionalProperties) === null || _c === void 0 ? void 0 : _c.type) === "object" ||
        ((_d = schema.additionalProperties) === null || _d === void 0 ? void 0 : _d.type) === "boolean" ||
        ((_e = schema.additionalProperties) === null || _e === void 0 ? void 0 : _e.type) === "integer" ||
        ((_f = schema.additionalProperties) === null || _f === void 0 ? void 0 : _f.type) === "number") {
        const additionalProperties = (_g = schema.additionalProperties) === null || _g === void 0 ? void 0 : _g.additionalProperties;
        if (additionalProperties !== undefined) {
            const type = (_j = (_h = schema.additionalProperties) === null || _h === void 0 ? void 0 : _h.additionalProperties) === null || _j === void 0 ? void 0 : _j.type;
            const schemaName = (0, schema_1.getSchemaName)((_k = schema.additionalProperties) === null || _k === void 0 ? void 0 : _k.additionalProperties);
            return (0, utils_1.create)("SchemaItem", {
                name: "property name*",
                required: false,
                schemaName: schemaName !== null && schemaName !== void 0 ? schemaName : type,
                qualifierMessage: (_l = schema.additionalProperties) !== null && _l !== void 0 ? _l : (0, schema_1.getQualifierMessage)(schema.additionalProperties),
                schema: schema,
                collapsible: false,
                discriminator: false,
            });
        }
        const schemaName = (0, schema_1.getSchemaName)(schema.additionalProperties);
        return (0, utils_1.create)("SchemaItem", {
            name: "property name*",
            required: false,
            schemaName: schemaName,
            qualifierMessage: (0, schema_1.getQualifierMessage)(schema),
            schema: schema.additionalProperties,
            collapsible: false,
            discriminator: false,
        });
    }
    return Object.entries(schema.additionalProperties).map(([key, val]) => createEdges({
        name: key,
        schema: val,
        required: Array.isArray(schema.required)
            ? schema.required.includes(key)
            : false,
    }));
}
// TODO: figure out how to handle array of objects
function createItems(schema) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    if (((_a = schema.items) === null || _a === void 0 ? void 0 : _a.properties) !== undefined) {
        return [
            (0, createArrayBracket_1.createOpeningArrayBracket)(),
            createProperties(schema.items),
            (0, createArrayBracket_1.createClosingArrayBracket)(),
        ].flat();
    }
    if (((_b = schema.items) === null || _b === void 0 ? void 0 : _b.additionalProperties) !== undefined) {
        return [
            (0, createArrayBracket_1.createOpeningArrayBracket)(),
            createAdditionalProperties(schema.items),
            (0, createArrayBracket_1.createClosingArrayBracket)(),
        ].flat();
    }
    if (((_c = schema.items) === null || _c === void 0 ? void 0 : _c.oneOf) !== undefined || ((_d = schema.items) === null || _d === void 0 ? void 0 : _d.anyOf) !== undefined) {
        return [
            (0, createArrayBracket_1.createOpeningArrayBracket)(),
            createAnyOneOf(schema.items),
            (0, createArrayBracket_1.createClosingArrayBracket)(),
        ].flat();
    }
    if (((_e = schema.items) === null || _e === void 0 ? void 0 : _e.allOf) !== undefined) {
        // TODO: figure out if and how we should pass merged required array
        const { mergedSchemas, } = mergeAllOf((_f = schema.items) === null || _f === void 0 ? void 0 : _f.allOf);
        // Handles combo anyOf/oneOf + properties
        if ((mergedSchemas.oneOf !== undefined ||
            mergedSchemas.anyOf !== undefined) &&
            mergedSchemas.properties) {
            return [
                (0, createArrayBracket_1.createOpeningArrayBracket)(),
                createAnyOneOf(mergedSchemas),
                createProperties(mergedSchemas),
                (0, createArrayBracket_1.createClosingArrayBracket)(),
            ].flat();
        }
        // Handles only anyOf/oneOf
        if (mergedSchemas.oneOf !== undefined ||
            mergedSchemas.anyOf !== undefined) {
            return [
                (0, createArrayBracket_1.createOpeningArrayBracket)(),
                createAnyOneOf(mergedSchemas),
                (0, createArrayBracket_1.createClosingArrayBracket)(),
            ].flat();
        }
        // Handles properties
        if (mergedSchemas.properties !== undefined) {
            return [
                (0, createArrayBracket_1.createOpeningArrayBracket)(),
                createProperties(mergedSchemas),
                (0, createArrayBracket_1.createClosingArrayBracket)(),
            ].flat();
        }
    }
    if (((_g = schema.items) === null || _g === void 0 ? void 0 : _g.type) === "string" ||
        ((_h = schema.items) === null || _h === void 0 ? void 0 : _h.type) === "number" ||
        ((_j = schema.items) === null || _j === void 0 ? void 0 : _j.type) === "integer" ||
        ((_k = schema.items) === null || _k === void 0 ? void 0 : _k.type) === "boolean" ||
        ((_l = schema.items) === null || _l === void 0 ? void 0 : _l.type) === "object") {
        return [
            (0, createArrayBracket_1.createOpeningArrayBracket)(),
            createNodes(schema.items),
            (0, createArrayBracket_1.createClosingArrayBracket)(),
        ].flat();
    }
    // TODO: clean this up or eliminate it?
    return [
        (0, createArrayBracket_1.createOpeningArrayBracket)(),
        Object.entries(schema.items).map(([key, val]) => createEdges({
            name: key,
            schema: val,
            required: Array.isArray(schema.required)
                ? schema.required.includes(key)
                : false,
        })),
        (0, createArrayBracket_1.createClosingArrayBracket)(),
    ].flat();
}
/**
 * For handling discriminators that do not map to a same-level property
 */
// function createDiscriminator(schema: SchemaObject) {
//   const discriminator = schema.discriminator;
//   const propertyName = discriminator?.propertyName;
//   const propertyType = "string"; // should always be string
//   const mapping: any = discriminator?.mapping;
//   // Explicit mapping is required since we can't support implicit
//   if (mapping === undefined) {
//     return undefined;
//   }
//   // Attempt to get the property description we want to display
//   // TODO: how to make it predictable when handling allOf
//   let propertyDescription;
//   const firstMappingSchema = mapping[Object.keys(mapping)[0]];
//   if (firstMappingSchema.properties !== undefined) {
//     propertyDescription =
//       firstMappingSchema.properties![propertyName!].description;
//   }
//   if (firstMappingSchema.allOf !== undefined) {
//     const { mergedSchemas }: { mergedSchemas: SchemaObject } = mergeAllOf(
//       firstMappingSchema.allOf
//     );
//     if (mergedSchemas.properties !== undefined) {
//       propertyDescription =
//         mergedSchemas.properties[propertyName!]?.description;
//     }
//   }
//   if (propertyDescription === undefined) {
//     if (
//       schema.properties !== undefined &&
//       schema.properties![propertyName!] !== undefined
//     ) {
//       propertyDescription = schema.properties![propertyName!].description;
//     }
//   }
//   return create("div", {
//     className: "openapi-discriminator__item",
//     children: create("div", {
//       children: [
//         create("strong", {
//           style: { paddingLeft: "1rem" },
//           children: propertyName,
//         }),
//         guard(propertyType, (name) =>
//           create("span", {
//             style: { opacity: "0.6" },
//             children: ` ${propertyType}`,
//           })
//         ),
//         guard(getQualifierMessage(schema.discriminator as any), (message) =>
//           create("div", {
//             style: {
//               paddingLeft: "1rem",
//             },
//             children: createDescription(message),
//           })
//         ),
//         guard(propertyDescription, (description) =>
//           create("div", {
//             style: {
//               paddingLeft: "1rem",
//             },
//             children: createDescription(description),
//           })
//         ),
//         create("DiscriminatorTabs", {
//           children: Object.keys(mapping!).map((key, index) => {
//             if (mapping[key].allOf !== undefined) {
//               const { mergedSchemas }: { mergedSchemas: SchemaObject } =
//                 mergeAllOf(mapping[key].allOf);
//               // Cleanup duplicate property from mapping schema
//               delete mergedSchemas.properties![propertyName!];
//               mapping[key] = mergedSchemas;
//             }
//             if (mapping[key].properties !== undefined) {
//               // Cleanup duplicate property from mapping schema
//               delete mapping[key].properties![propertyName!];
//             }
//             const label = key;
//             return create("TabItem", {
//               label: label,
//               value: `${index}-item-discriminator`,
//               children: [
//                 create("div", {
//                   style: { marginLeft: "-4px" },
//                   children: createNodes(mapping[key]),
//                 }),
//               ],
//             });
//           }),
//         }),
//       ],
//     }),
//   });
// }
function createDetailsNode(name, schemaName, schema, required, nullable) {
    return (0, utils_1.create)("SchemaItem", {
        collapsible: true,
        className: "schemaItem",
        children: [
            (0, createDetails_1.createDetails)({
                className: "openapi-markdown__details",
                children: [
                    (0, createDetailsSummary_1.createDetailsSummary)({
                        children: [
                            (0, utils_1.create)("span", {
                                className: "openapi-schema__container",
                                children: [
                                    (0, utils_1.create)("strong", {
                                        className: (0, clsx_1.default)("openapi-schema__property", {
                                            "openapi-schema__strikethrough": schema.deprecated,
                                        }),
                                        children: name,
                                    }),
                                    (0, utils_1.create)("span", {
                                        className: "openapi-schema__name",
                                        children: ` ${schemaName}`,
                                    }),
                                    (0, utils_1.guard)((Array.isArray(required)
                                        ? required.includes(name)
                                        : required === true) ||
                                        schema.deprecated ||
                                        nullable, () => [
                                        (0, utils_1.create)("span", {
                                            className: "openapi-schema__divider",
                                        }),
                                    ]),
                                    (0, utils_1.guard)(nullable, () => [
                                        (0, utils_1.create)("span", {
                                            className: "openapi-schema__nullable",
                                            children: "nullable",
                                        }),
                                    ]),
                                    (0, utils_1.guard)(Array.isArray(required)
                                        ? required.includes(name)
                                        : required === true, () => [
                                        (0, utils_1.create)("span", {
                                            className: "openapi-schema__required",
                                            children: "required",
                                        }),
                                    ]),
                                    (0, utils_1.guard)(schema.deprecated, () => [
                                        (0, utils_1.create)("span", {
                                            className: "openapi-schema__deprecated",
                                            children: "deprecated",
                                        }),
                                    ]),
                                ],
                            }),
                        ],
                    }),
                    (0, utils_1.create)("div", {
                        style: { marginLeft: "1rem" },
                        children: [
                            (0, utils_1.guard)((0, schema_1.getQualifierMessage)(schema), (message) => (0, utils_1.create)("div", {
                                style: { marginTop: ".5rem", marginBottom: ".5rem" },
                                children: (0, createDescription_1.createDescription)(message),
                            })),
                            (0, utils_1.guard)(schema.description, (description) => (0, utils_1.create)("div", {
                                style: { marginTop: ".5rem", marginBottom: ".5rem" },
                                children: (0, createDescription_1.createDescription)(description),
                            })),
                            createNodes(schema),
                        ],
                    }),
                ],
            }),
        ],
    });
}
/**
 * For handling discriminators that map to a same-level property (like 'petType').
 * Note: These should only be encountered while iterating through properties.
 */
function createPropertyDiscriminator(name, schemaName, schema, discriminator, required) {
    if (schema === undefined) {
        return undefined;
    }
    if (discriminator.mapping === undefined) {
        return undefined;
    }
    return (0, utils_1.create)("div", {
        className: "openapi-discriminator__item openapi-schema__list-item",
        children: (0, utils_1.create)("div", {
            children: [
                (0, utils_1.create)("span", {
                    className: "openapi-schema__container",
                    children: [
                        (0, utils_1.create)("strong", {
                            className: "openapi-discriminator__name openapi-schema__property",
                            children: name,
                        }),
                        (0, utils_1.guard)(schemaName, (name) => (0, utils_1.create)("span", {
                            className: "openapi-schema__name",
                            children: ` ${schemaName}`,
                        })),
                        (0, utils_1.guard)(required, () => [
                            (0, utils_1.create)("span", {
                                className: "openapi-schema__required",
                                children: "required",
                            }),
                        ]),
                    ],
                }),
                (0, utils_1.guard)((0, schema_1.getQualifierMessage)(discriminator), (message) => (0, utils_1.create)("div", {
                    style: {
                        paddingLeft: "1rem",
                    },
                    children: (0, createDescription_1.createDescription)(message),
                })),
                (0, utils_1.guard)(schema.description, (description) => (0, utils_1.create)("div", {
                    style: {
                        paddingLeft: "1rem",
                    },
                    children: (0, createDescription_1.createDescription)(description),
                })),
                (0, utils_1.create)("DiscriminatorTabs", {
                    className: "openapi-tabs__discriminator",
                    children: Object.keys(discriminator === null || discriminator === void 0 ? void 0 : discriminator.mapping).map((key, index) => {
                        const label = key;
                        return (0, utils_1.create)("TabItem", {
                            // className: "openapi-tabs__discriminator-item",
                            label: label,
                            value: `${index}-item-discriminator`,
                            children: [createNodes(discriminator === null || discriminator === void 0 ? void 0 : discriminator.mapping[key])],
                        });
                    }),
                }),
            ],
        }),
    });
}
/**
 * Creates the edges or "leaves" of a schema tree. Edges can branch into sub-nodes with createDetails().
 */
function createEdges({ name, schema, required, discriminator, }) {
    var _a, _b, _c, _d;
    const schemaName = (0, schema_1.getSchemaName)(schema);
    if (discriminator !== undefined && discriminator.propertyName === name) {
        return createPropertyDiscriminator(name, "string", schema, discriminator, required);
    }
    if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    if (schema.allOf !== undefined) {
        const { mergedSchemas, required, } = mergeAllOf(schema.allOf);
        const mergedSchemaName = (0, schema_1.getSchemaName)(mergedSchemas);
        if (mergedSchemas.oneOf !== undefined ||
            mergedSchemas.anyOf !== undefined) {
            return createDetailsNode(name, mergedSchemaName, mergedSchemas, required, schema.nullable);
        }
        if (mergedSchemas.properties !== undefined) {
            return createDetailsNode(name, mergedSchemaName, mergedSchemas, required, schema.nullable);
        }
        if (mergedSchemas.additionalProperties !== undefined) {
            return createDetailsNode(name, mergedSchemaName, mergedSchemas, required, schema.nullable);
        }
        // array of objects
        if (((_a = mergedSchemas.items) === null || _a === void 0 ? void 0 : _a.properties) !== undefined) {
            return createDetailsNode(name, mergedSchemaName, mergedSchemas, required, schema.nullable);
        }
        if (mergedSchemas.readOnly && mergedSchemas.readOnly === true) {
            return undefined;
        }
        return (0, utils_1.create)("SchemaItem", {
            collapsible: false,
            name,
            required: Array.isArray(required) ? required.includes(name) : required,
            schemaName: schemaName,
            qualifierMessage: (0, schema_1.getQualifierMessage)(schema),
            schema: mergedSchemas,
        });
    }
    if (schema.properties !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    if (schema.additionalProperties !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    // array of objects
    if (((_b = schema.items) === null || _b === void 0 ? void 0 : _b.properties) !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    if (((_c = schema.items) === null || _c === void 0 ? void 0 : _c.anyOf) !== undefined || ((_d = schema.items) === null || _d === void 0 ? void 0 : _d.oneOf) !== undefined) {
        return createDetailsNode(name, schemaName, schema, required, schema.nullable);
    }
    if (schema.readOnly && schema.readOnly === true) {
        return undefined;
    }
    // primitives and array of non-objects
    return (0, utils_1.create)("SchemaItem", {
        collapsible: false,
        name,
        required: Array.isArray(required) ? required.includes(name) : required,
        schemaName: schemaName,
        qualifierMessage: (0, schema_1.getQualifierMessage)(schema),
        schema: schema,
    });
}
/**
 * Creates a hierarchical level of a schema tree. Nodes produce edges that can branch into sub-nodes with edges, recursively.
 */
function createNodes(schema) {
    const nodes = [];
    // if (schema.discriminator !== undefined) {
    //   return createDiscriminator(schema);
    // }
    if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
        nodes.push(createAnyOneOf(schema));
    }
    if (schema.allOf !== undefined) {
        const { mergedSchemas } = mergeAllOf(schema.allOf);
        // allOf seems to always result in properties
        if (mergedSchemas.properties !== undefined) {
            nodes.push(createProperties(mergedSchemas));
        }
    }
    if (schema.properties !== undefined) {
        nodes.push(createProperties(schema));
    }
    if (schema.additionalProperties !== undefined) {
        nodes.push(createAdditionalProperties(schema));
    }
    // TODO: figure out how to handle array of objects
    if (schema.items !== undefined) {
        nodes.push(createItems(schema));
    }
    if (nodes.length && nodes.length > 0) {
        return nodes.filter(Boolean).flat();
    }
    // primitive
    if (schema.type !== undefined) {
        return (0, utils_1.create)("li", {
            children: (0, utils_1.create)("div", {
                children: [
                    (0, utils_1.create)("strong", { children: schema.type }),
                    (0, utils_1.guard)(schema.format, (format) => (0, utils_1.create)("span", {
                        style: { opacity: "0.6" },
                        children: ` ${format}`,
                    })),
                    (0, utils_1.guard)((0, schema_1.getQualifierMessage)(schema), (message) => (0, utils_1.create)("div", {
                        style: { marginTop: "var(--ifm-table-cell-padding)" },
                        children: (0, createDescription_1.createDescription)(message),
                    })),
                    (0, utils_1.guard)(schema.description, (description) => (0, utils_1.create)("div", {
                        style: { marginTop: "var(--ifm-table-cell-padding)" },
                        children: (0, createDescription_1.createDescription)(description),
                    })),
                ],
            }),
        });
    }
    // Unknown node/schema type should return undefined
    // So far, haven't seen this hit in testing
    return "any";
}
function createRequestSchema({ title, body, ...rest }) {
    var _a;
    if (body === undefined ||
        body.content === undefined ||
        Object.keys(body).length === 0 ||
        Object.keys(body.content).length === 0) {
        return undefined;
    }
    // Get all MIME types, including vendor-specific
    const mimeTypes = Object.keys(body.content);
    if (mimeTypes && mimeTypes.length > 1) {
        return (0, utils_1.create)("MimeTabs", {
            className: "openapi-tabs__mime",
            schemaType: "request",
            children: mimeTypes.map((mimeType) => {
                const firstBody = body.content[mimeType].schema;
                if (firstBody === undefined) {
                    return undefined;
                }
                if (firstBody.properties !== undefined) {
                    if (Object.keys(firstBody.properties).length === 0) {
                        return undefined;
                    }
                }
                return (0, utils_1.create)("TabItem", {
                    label: mimeType,
                    value: `${mimeType}`,
                    children: [
                        (0, createDetails_1.createDetails)({
                            className: "openapi-markdown__details mime",
                            "data-collapsed": false,
                            open: true,
                            ...rest,
                            children: [
                                (0, createDetailsSummary_1.createDetailsSummary)({
                                    className: "openapi-markdown__details-summary-mime",
                                    children: [
                                        (0, utils_1.create)("h3", {
                                            className: "openapi-markdown__details-summary-header-body",
                                            children: `${title}`,
                                        }),
                                        (0, utils_1.guard)(body.required && body.required === true, () => [
                                            (0, utils_1.create)("span", {
                                                className: "openapi-schema__required",
                                                children: "required",
                                            }),
                                        ]),
                                    ],
                                }),
                                (0, utils_1.create)("div", {
                                    style: { textAlign: "left", marginLeft: "1rem" },
                                    children: [
                                        (0, utils_1.guard)(body.description, () => [
                                            (0, utils_1.create)("div", {
                                                style: { marginTop: "1rem", marginBottom: "1rem" },
                                                children: (0, createDescription_1.createDescription)(body.description),
                                            }),
                                        ]),
                                    ],
                                }),
                                (0, utils_1.create)("ul", {
                                    style: { marginLeft: "1rem" },
                                    children: createNodes(firstBody),
                                }),
                            ],
                        }),
                    ],
                });
            }),
        });
    }
    const randomFirstKey = Object.keys(body.content)[0];
    const firstBody = (_a = body.content[randomFirstKey].schema) !== null && _a !== void 0 ? _a : body.content[randomFirstKey];
    if (firstBody === undefined) {
        return undefined;
    }
    // we don't show the table if there is no properties to show
    if (firstBody.properties !== undefined) {
        if (Object.keys(firstBody.properties).length === 0) {
            return undefined;
        }
    }
    return (0, utils_1.create)("MimeTabs", {
        className: "openapi-tabs__mime",
        children: [
            (0, utils_1.create)("TabItem", {
                label: randomFirstKey,
                value: `${randomFirstKey}-schema`,
                children: [
                    (0, createDetails_1.createDetails)({
                        className: "openapi-markdown__details mime",
                        "data-collapsed": false,
                        open: true,
                        ...rest,
                        children: [
                            (0, createDetailsSummary_1.createDetailsSummary)({
                                className: "openapi-markdown__details-summary-mime",
                                children: [
                                    (0, utils_1.create)("h3", {
                                        className: "openapi-markdown__details-summary-header-body",
                                        children: `${title}`,
                                    }),
                                    (0, utils_1.guard)(firstBody.type === "array", (format) => (0, utils_1.create)("span", {
                                        style: { opacity: "0.6" },
                                        children: ` array`,
                                    })),
                                    (0, utils_1.guard)(body.required, () => [
                                        (0, utils_1.create)("strong", {
                                            className: "openapi-schema__required",
                                            children: "required",
                                        }),
                                    ]),
                                ],
                            }),
                            (0, utils_1.create)("div", {
                                style: { textAlign: "left", marginLeft: "1rem" },
                                children: [
                                    (0, utils_1.guard)(body.description, () => [
                                        (0, utils_1.create)("div", {
                                            style: { marginTop: "1rem", marginBottom: "1rem" },
                                            children: (0, createDescription_1.createDescription)(body.description),
                                        }),
                                    ]),
                                ],
                            }),
                            (0, utils_1.create)("ul", {
                                style: { marginLeft: "1rem" },
                                children: createNodes(firstBody),
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}
exports.createRequestSchema = createRequestSchema;
