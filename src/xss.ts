
import * as xssFilters from 'xss-filters';


export interface Ixss {
    (str: string): string;
}


export default function xss ( str: string ): string {
    return xssFilters.inHTMLData( str );
}
