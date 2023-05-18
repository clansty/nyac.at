export default async (data: any, target: string, key: string) => {
  const bodyText = JSON.stringify(data);
  const headerNames = ['host', 'date', 'digest'];
  const pubKeyId = 'https://nyac.at/blog.json#pubkey';
  const url = new URL(target);
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(bodyText));
  const base64Hash = btoa(String.fromCharCode(...new Uint8Array(hash)));
  const headers = {
    host: url.hostname,
    date: new Date().toUTCString(),
    digest: `SHA-256=${base64Hash}`,
  };
  console.log(headers);
  const signString = headerNames
    .map(header => `${header.toLowerCase()}: ${headers[header]}`)
    .join('\n');
  const privateKeyData = atob(key);
  const privateKeyArray = new Uint8Array(privateKeyData.length);
  for (let i = 0; i < privateKeyData.length; i++) {
    privateKeyArray[i] = privateKeyData.charCodeAt(i);
  }
  const importedKey = await crypto.subtle.importKey('pkcs8', privateKeyArray, {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  }, false, ['sign']);
  const sign = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', importedKey, new TextEncoder().encode(signString));
  const base64Sign = btoa(String.fromCharCode(...new Uint8Array(sign)));
  const signature = `keyId="${pubKeyId}",headers="${headerNames.join(' ')}",signature="${base64Sign}",algorithm="rsa-sha256"`;
  console.log(signature);
  const req = await fetch(target, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/activity+json',
      Accept: 'application/activity+json',
      signature,
    },
    body: bodyText,
  });
  console.log('req', req.status);
  return req;
}
