/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState, useEffect } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import codegen from "@paloaltonetworks/postman-code-generators";
import sdk from "@paloaltonetworks/postman-collection";
import ApiCodeBlock from "@theme/ApiDemoPanel/ApiCodeBlock";
import buildPostmanRequest from "@theme/ApiDemoPanel/buildPostmanRequest";
import CodeTabs from "@theme/ApiDemoPanel/CodeTabs";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import merge from "lodash/merge";

export interface Language {
  highlight: string;
  language: string;
  logoClass: string;
  variant: string;
  variants: string[];
  options: { [key: string]: boolean };
  source?: string;
}

export const languageSet: Language[] = [
  {
    highlight: "bash",
    language: "curl",
    logoClass: "bash",
    options: {
      longFormat: false,
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "cURL",
    variants: ["curl"],
  },
  {
    highlight: "python",
    language: "python",
    logoClass: "python",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "requests",
    variants: ["requests", "http.client"],
  },
  {
    highlight: "go",
    language: "go",
    logoClass: "go",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "native",
    variants: ["native"],
  },
  {
    highlight: "javascript",
    language: "nodejs",
    logoClass: "nodejs",
    options: {
      ES6_enabled: true,
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "axios",
    variants: ["axios", "native", "request", "unirest"],
  },
  {
    highlight: "ruby",
    language: "ruby",
    logoClass: "ruby",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "Net::HTTP",
    variants: ["net::http"],
  },
  {
    highlight: "csharp",
    language: "csharp",
    logoClass: "csharp",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "RestSharp",
    variants: ["restsharp", "httpclient"],
  },
  {
    highlight: "php",
    language: "php",
    logoClass: "php",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "cURL",
    variants: ["curl", "guzzle", "pecl_http", "http_request2"],
  },
  {
    highlight: "java",
    language: "java",
    logoClass: "java",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "OkHttp",
    variants: ["okhttp", "unirest"],
  },
  {
    highlight: "powershell",
    language: "powershell",
    logoClass: "powershell",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "RestMethod",
    variants: ["restmethod"],
  },
];

export interface Props {
  postman: sdk.Request;
  codeSamples: any; // TODO: Type this...
}

function CodeTab({ children, hidden, className, onClick }: any): JSX.Element {
  return (
    <div role="tabpanel" className={className} {...{ hidden }}>
      {children}
    </div>
  );
}

function Curl({ postman, codeSamples }: Props) {
  // TODO: match theme for vscode.

  const { siteConfig } = useDocusaurusContext();

  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const server = useTypedSelector((state: any) => state.server.value);
  const body = useTypedSelector((state: any) => state.body);

  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const headerParams = useTypedSelector((state: any) => state.params.header);

  const auth = useTypedSelector((state: any) => state.auth);

  // User-defined languages array
  // Can override languageSet, change order of langs, override options and variants
  const langs = [
    ...((siteConfig?.themeConfig?.languageTabs as Language[] | undefined) ??
      languageSet),
    ...codeSamples,
  ];

  // Filter languageSet by user-defined langs
  const filteredLanguageSet = languageSet.filter((ls) => {
    return langs.some((lang) => {
      return lang.language === ls.language;
    });
  });

  // Merge user-defined langs into languageSet
  const mergedLangs = merge(filteredLanguageSet, langs);

  // Read defaultLang from localStorage
  const defaultLang: Language[] = mergedLangs.filter(
    (lang) =>
      lang.language === localStorage.getItem("docusaurus.tab.code-samples")
  );
  const [selectedVariant, setSelectedVariant] = useState();
  const [language, setLanguage] = useState(() => {
    // Return first index if only 1 user-defined language exists
    if (mergedLangs.length === 1) {
      return mergedLangs[0];
    }
    // Fall back to language in localStorage or first user-defined language
    return defaultLang[0] ?? mergedLangs[0];
  });
  const [codeText, setCodeText] = useState("");

  useEffect(() => {
    if (language && !!language.options) {
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });
      codegen.convert(
        language.language,
        language.variant,
        postmanRequest,
        language.options,
        (error: any, snippet: string) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else if (language && !!language.source) {
      setCodeText(language.source);
    } else if (language && !language.options) {
      const langSource = mergedLangs.filter(
        (lang) => lang.language === language.language
      );

      // Merges user-defined language with default languageSet
      // This allows users to define only the minimal properties necessary in languageTabs
      // User-defined properties should override languageSet properties
      const mergedLanguage = { ...langSource[0], ...language };
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });

      codegen.convert(
        mergedLanguage.language,
        mergedLanguage.variant,
        postmanRequest,
        mergedLanguage.options,
        (error: any, snippet: string) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else {
      setCodeText("");
    }
  }, [
    accept,
    body,
    contentType,
    cookieParams,
    headerParams,
    language,
    pathParams,
    postman,
    queryParams,
    server,
    auth,
    mergedLangs,
  ]);

  useEffect(() => {
    if (selectedVariant && selectedVariant !== language.variant) {
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });
      codegen.convert(
        language.language,
        selectedVariant,
        postmanRequest,
        language.options,
        (error: any, snippet: string) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    }
  });

  if (language === undefined) {
    return null;
  }

  return (
    <>
      <CodeTabs
        groupId="code-samples"
        action={{
          setLanguage: setLanguage,
          setSelectedVariant: setSelectedVariant,
        }}
        lazy
      >
        {mergedLangs.map((lang) => {
          return (
            <CodeTab
              value={lang.language}
              label={lang.language}
              key={lang.language}
              attributes={{
                className: `openapi-tabs__code-item--${lang.logoClass}`,
              }}
            >
              <CodeTabs
                className="openapi-tabs__code-container-inner"
                action={{
                  setLanguage: setLanguage,
                  setSelectedVariant: setSelectedVariant,
                }}
                includeVariant={true}
                currentLanguage={lang.language}
                defaultValue={selectedVariant}
                lazy
              >
                {lang.variants.map((variant) => {
                  return (
                    <CodeTab
                      value={variant.toLowerCase()}
                      label={variant.toUpperCase()}
                      key={`${lang.language}-${lang.variant}`}
                      attributes={{
                        className: `openapi-tabs__code-item--variant`,
                      }}
                    >
                      {/* @ts-ignore */}
                      <ApiCodeBlock
                        language={lang.highlight}
                        className="openapi-demo__code-block"
                        showLineNumbers={true}
                      >
                        {codeText}
                      </ApiCodeBlock>
                    </CodeTab>
                  );
                })}
              </CodeTabs>
            </CodeTab>
          );
        })}
      </CodeTabs>
    </>
  );
}

export default Curl;
