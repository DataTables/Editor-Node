import * as xssFilters from 'xss-filters';

/** XSS formatter */
export type Ixss = (str: string) => string;

/**
 * Editor's default XSS protection method
 *
 * @export
 * @param {string} str User submitted string
 * @returns {string} Sanitized string
 */
export default function xss( str: string ): string {
	return xssFilters.inHTMLData( str );
}
