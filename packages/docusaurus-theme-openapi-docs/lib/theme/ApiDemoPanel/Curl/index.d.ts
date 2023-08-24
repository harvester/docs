/// <reference types="react" />
import sdk from "@paloaltonetworks/postman-collection";
export interface Language {
    highlight: string;
    language: string;
    logoClass: string;
    variant: string;
    variants: string[];
    options: {
        [key: string]: boolean;
    };
    source?: string;
}
export declare const languageSet: Language[];
export interface Props {
    postman: sdk.Request;
    codeSamples: any;
}
declare function Curl({ postman, codeSamples }: Props): JSX.Element | null;
export default Curl;
