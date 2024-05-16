import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms'
import dotenv from 'dotenv'

dotenv.config()

const client = new KMSClient({ region: 'ap-northeast-1' })

export const encrypt = async (keyId: string, plaintext: Uint8Array) => {
  const { CiphertextBlob } = await client.send(new EncryptCommand({ KeyId: keyId, Plaintext: plaintext }))
  return CiphertextBlob
}

export const decrypt = async (ciphertext: Uint8Array) => {
  const { Plaintext } = await client.send(new DecryptCommand({ CiphertextBlob: ciphertext }))
  return Plaintext
}

const keyId = process.env.KMS_KEY_ID!
const plaintext = 'Hello, World!'
const plaintextBin = Buffer.from(plaintext, 'utf-8');

(async () => {
  const encryptedBin = (await encrypt(keyId, plaintextBin))!
  const encryptedText = Buffer.from(encryptedBin).toString('base64')
  console.log('Encrypted:', encryptedText)

  const decryptedBin = (await decrypt(encryptedBin))!
  const decryptedText = Buffer.from(decryptedBin).toString('utf-8')
  console.log('Decrypted:', decryptedText)

  if (plaintext === decryptedText) {
    console.log(`\u001b[36m${'Success!'}\u001b[0m`)
  } else {
    throw new Error('Decrypted text is not equal to the original text')
  }
})()
.then(() => console.log('Done!'))
.catch((err) => {
  console.error(err)
  process.exit(1)
})
