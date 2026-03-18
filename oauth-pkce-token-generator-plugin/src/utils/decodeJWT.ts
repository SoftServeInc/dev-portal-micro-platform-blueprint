/**
 * Splits a JWT into its 3 parts (header, payload, signature),
 * decodes header & payload from base64, and parses them as JSON.
 */
export function decodeJWT(token: string): {
  header: Record<string, any> | null;
  payload: Record<string, any> | null;
  signature: string | null;
} {
  try {
    const [headerB64, payloadB64, signature] = token.split('.');
    if (!headerB64 || !payloadB64) {
      return {header: null, payload: null, signature: null};
    }

    // Decode from base64URL
    const decodeBase64Url = (str: string) => {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      return atob(base64);
    };

    const headerJson = JSON.parse(decodeBase64Url(headerB64));
    const payloadJson = JSON.parse(decodeBase64Url(payloadB64));

    return {
      header: headerJson,
      payload: payloadJson,
      signature: signature || null
    };
  } catch (error) {
    return {header: null, payload: null, signature: null};
  }
}
