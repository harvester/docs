---
sidebar_position: 4
sidebar_label: Document Conventions
title: "Document Conventions"
keywords:
- Harvester
- documentation
- conventions
- labels
---

<head>
  <link rel="canonical" href="https://docs.harvesterhci.io/v1.4/getting-started/document-conventions"/>
</head>

## Release Labels

Harvester has a 26-week release cycle and an N - 1 support policy. Each release is supported for 14 months (12 months of support and 2 months for upgrades). Only the two most recent minor versions receive security and bug fixes. For more information, see the [Support Matrix](https://www.suse.com/suse-harvester/support-matrix/all-supported-versions/).

- **Dev**: The software is under active development and has not been thoroughly tested. Upgrading from earlier versions or to later versions is not supported. Use this version only for testing purposes.

- **Latest**: The software has passed all stages of verification and testing. All remaining known issues are considered acceptable. Use this version only for testing purposes.

- **Stable**: The software is considered reliable and free of critical issues. This version is recommended for general use.

- **EOL**: The software has reached the end of its useful life and no further code-level maintenance is provided. You may continue to use the software within the terms of the licensing agreement. Upgrading to the latest stable version is recommended.

:::note

Harvester provides documentation for major and minor releases. Information about enhancements and bug fixes implemented in patch releases is added to the minor release documentation.

:::

## Feature Labels

Features that are labeled **Experimental** or **Technical Preview** are available to use in non-production or limited production environments. SUSE welcomes feedback for improving the functionality and usability of these features. You can report issues in the [GitHub repository](https://github.com/harvester/harvester).

- **Experimental**: The feature is incomplete but its essential functionality is operational. Tests in a controlled environment have shown that it can coexist with existing stable features. Because of the missing components and/or evolving functionality, the feature is not recommended for use in production environments.

- **Technical Preview**: The feature is complete and its functionality is not expected to change significantly. Tests in a controlled environment have shown that it can coexist with existing stable features. Explore the feature extensively before using in production environments.

:::note

Experimental and Technical Preview features are usually disabled by default. The documentation provides information about how you can enable and configure such features. 

:::

## Admonitions

Admonitions are text blocks that provide additional or important information. Each text block is marked with a special label and icon.

- **Note**: Additional information that is useful but not critical.

- **Important**: Information that requires special attention, such as changes in product behavior.

- **Tip**: Helpful advice and suggestions, such as alternative methods of completing a task.

- **Caution**: Information that must be considered before proceeding with specific actions, such as errors that may occur.

- **Warning**: Critical information about harmful consequences, such as irreversible damage and data loss.