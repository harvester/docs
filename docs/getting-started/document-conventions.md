---
sidebar_position: 4
sidebar_label: Document Conventions
title: "Document Conventions"
keywords:
- Harvester
- documentation
- conventions
- release types
- release labels
- feature labels
- admonitions
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.8/getting-started/document-conventions"/>
</head>

## Release Types

The terms "Community" and "Prime" are used to differentiate the releases intended for community users and SUSE customers. "Prime" refers to SUSE Rancher Prime, which is SUSE's enterprise container management platform.

| Release Type | Versioning Convention | Example | Support Lifecycle |
| --- | --- | --- | --- |
| Community | x.y.z | v1.5.0 | Support for each community release ends when version x.(y+1).1 is released. |
| Prime | x.y.[1-z] | v1.5.1 | Prime releases receive 6 months of active support. This is followed by 12 months of maintenance support, which covers critical security-related issues. |

## Release Labels

The Harvester documentation uses the following labels to describe releases of the software.

- **Dev**: The software is under active development and has not been thoroughly tested. Upgrading from earlier releases or to later releases is not supported.

- **Latest**: The software has passed all stages of verification and testing. All remaining known issues are considered acceptable.

- **EOL**: The software has reached the end of its useful life and no further code-level maintenance is provided. You may continue to use the software within the terms of the licensing agreement.

## Feature Labels

Harvester features and add-ons are labeled according to their maturity and support commitment.

- **Experimental**: The feature is roughly implemented end to end, but automated test coverage is insufficient. The feature is not supported and is not recommended for use in production environments.

- **Technical Preview**: The main functionality is implemented, some detailed capabilities are still incomplete, and partial automated test coverage is in place. The feature is supported on a best-effort basis. Explore the feature extensively before using it in production environments.

- **GA** (General Availability): All functionality is implemented with sufficient automated test coverage. The feature is fully supported and recommended for production use. Features that are not labeled are GA.

- **Deprecated**: The feature is no longer maintained or supported, and is removed in the following release. Existing installations continue to work, but the feature is no longer updated or packaged with Harvester. The documentation identifies the replacement, if any.

**Experimental** and **Technical Preview** features have the following limitations:

- Still in development and may be functionally incomplete, unstable, or in other ways unsuitable for production use.
- May only be available for specific hardware architectures. Details and functionality are subject to change. As a result, upgrading to subsequent releases may be impossible and may require a fresh installation.
- Can be removed from the product at any time. This may occur, for example, if we discover that the feature does not meet customer or market needs, or does not comply with enterprise standards.

:::note

**Experimental** and **Technical Preview** features are usually disabled by default. The documentation provides information about how you can enable and configure such features.

For add-ons, the maturity stage is shown next to the add-on name on the **Add-ons** screen. Whether an add-on is packaged in the Harvester ISO is independent of its maturity stage.

:::

## Admonitions

Admonitions are text blocks that provide additional or important information. Each text block is marked with a special label and icon. The Harvester documentation uses the following conventions to help you interpret information.

- **Note**: Additional information that is useful but not critical.

- **Important**: Information that requires special attention, such as changes in product behavior.

- **Tip**: Helpful advice and suggestions, such as alternative methods of completing a task.

- **Caution**: Information that must be considered before proceeding with specific actions, such as errors that may occur.

- **Warning**: Critical information about harmful consequences, such as irreversible damage and data loss.