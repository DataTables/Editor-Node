/** XSS formatter */
export declare type Ixss = (str: string) => string;
/**
 * Editor's default XSS protection method
 *
 * @export
 * @param {string} str User submitted string
 * @returns {string} Sanitized string
 */
export default function xss(str: string): string;
