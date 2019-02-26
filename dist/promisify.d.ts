/**
 * Wrap an async function which uses a callback for completion in a Promise
 * so it can be used with `await`.
 *
 * @export
 * @template T Return type
 * @param {Function} fn Function to execute
 * @param {*} [scope=null] Scope
 * @returns {Function} Promise wrapper function
 */
export default function promisify<T>(fn: Function, scope?: any): Function;
