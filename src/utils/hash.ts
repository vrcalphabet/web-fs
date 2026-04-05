import { WebFsFileHashType } from '../types/options'

function getLegalAlgo(algo: Exclude<WebFsFileHashType, 'md5'>): string {
  return {
    sha1: 'SHA1',
    sha256: 'SHA-256',
    sha384: 'SHA-384',
    sha512: 'SHA-512',
  }[algo]
}

export async function getHash(
  algo: Exclude<WebFsFileHashType, 'md5'>,
  buffer: BufferSource,
): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(getLegalAlgo(algo), buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hash
}
