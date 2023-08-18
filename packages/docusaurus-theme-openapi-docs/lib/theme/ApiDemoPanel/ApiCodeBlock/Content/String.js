/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useThemeConfig, usePrismTheme } from "@docusaurus/theme-common";
import {
  parseCodeBlockTitle,
  parseLanguage,
  parseLines,
  containsLineNumbers,
  useCodeWordWrap,
} from "@docusaurus/theme-common/internal";
import Container from "@theme/ApiDemoPanel/ApiCodeBlock/Container";
import CopyButton from "@theme/ApiDemoPanel/ApiCodeBlock/CopyButton";
import ExpandButton from "@theme/ApiDemoPanel/ApiCodeBlock/ExpandButton";
import Line from "@theme/ApiDemoPanel/ApiCodeBlock/Line";
import WordWrapButton from "@theme/ApiDemoPanel/ApiCodeBlock/WordWrapButton";
import clsx from "clsx";
import Highlight, { defaultProps } from "prism-react-renderer";

export default function CodeBlockString({
  children,
  className: blockClassName = "",
  metastring,
  title: titleProp,
  showLineNumbers: showLineNumbersProp,
  language: languageProp,
}) {
  const {
    prism: { defaultLanguage, magicComments },
  } = useThemeConfig();
  const language =
    languageProp ?? parseLanguage(blockClassName) ?? defaultLanguage;
  const prismTheme = usePrismTheme();
  const wordWrap = useCodeWordWrap();
  // We still parse the metastring in case we want to support more syntax in the
  // future. Note that MDX doesn't strip quotes when parsing metastring:
  // "title=\"xyz\"" => title: "\"xyz\""
  const title = parseCodeBlockTitle(metastring) || titleProp;
  const { lineClassNames, code } = parseLines(children, {
    metastring,
    language,
    magicComments,
  });
  const showLineNumbers =
    showLineNumbersProp ?? containsLineNumbers(metastring);

  return (
    <Container
      as="div"
      className={clsx(
        blockClassName,
        language &&
          !blockClassName.includes(`language-${language}`) &&
          `language-${language}`
      )}
    >
      {title && <div className="openapi-demo__code-block-title">{title}</div>}
      <div className="openapi-demo__code-block-content">
        <Highlight
          {...defaultProps}
          theme={prismTheme}
          code={code}
          language={language ?? "text"}
        >
          {({ className, tokens, getLineProps, getTokenProps }) => (
            <pre
              /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
              tabIndex={0}
              ref={wordWrap.codeBlockRef}
              className={clsx(
                className,
                "openapi-demo__code-block",
                "thin-scrollbar"
              )}
            >
              <code
                className={clsx(
                  "openapi-demo__code-block-lines",
                  showLineNumbers && "openapi-demo__code-block-lines-numbering"
                )}
              >
                {tokens.map((line, i) => (
                  <Line
                    key={i}
                    line={line}
                    getLineProps={getLineProps}
                    getTokenProps={getTokenProps}
                    classNames={lineClassNames[i]}
                    showLineNumbers={showLineNumbers}
                  />
                ))}
              </code>
            </pre>
          )}
        </Highlight>
        <div className="openapi-demo__code-block-btn-group">
          {(wordWrap.isEnabled || wordWrap.isCodeScrollable) && (
            <WordWrapButton
              className="openapi-demo__code-block-code-btn"
              onClick={() => wordWrap.toggle()}
              isEnabled={wordWrap.isEnabled}
            />
          )}
          <CopyButton
            className="openapi-demo__code-block-code-btn"
            code={code}
          />
          <ExpandButton
            className={clsx(
              "openapi-demo__code-block-code-btn",
              "openapi-demo__expand-btn"
            )}
            code={code}
            language={language}
            showLineNumbers={showLineNumbers}
            blockClassName={blockClassName}
            title={title}
            lineClassNames={lineClassNames}
            wordWrap={wordWrap}
          />
        </div>
      </div>
    </Container>
  );
}
