/**
 * FROM : https://www.npmjs.com/package/ts-wol
 * 
 * 
 */

import { createSocket } from 'dgram'



/**
 * wol
 * @description Tries to awaken the specified machine (specified by its macAddress) broadcasting a `Magic Packet`
 * @param {string} macAddress The mac address of the machine to Wake-Up
 */
export const wol = (macAddress: string) => {
  const DEST_ADDR = '255.255.255.255'
  const DEST_PORT = 9

  let magicPacket: Buffer

  try {
    magicPacket = createMagicPacket(macAddress)
  }
  catch(e) {
    console.log(String(e))
    return
  }

  const client = createSocket('udp4') // Creating an IPv4 UDP socket

  // Broadcasting the Wake-On-Lan `Magic Packet` on port 9
  client.send(magicPacket, 0, magicPacket.length, DEST_PORT, DEST_ADDR, err => {
    if(err) {
      console.log(err.message)
    }
    client.close()
  })

  client.once('listening', () => {
    client.setBroadcast(true)
  })

  client.on('error', err => {
    console.log(err.message)
    client.close()
  })

}

/**
 * verifyMacAddress
 * @param {string} macAddress The mac address to verify
 * @returns {boolean} Returns wether the macAddress was verified or not
*/
const verifyMacAddress = (macAddress: string): boolean => {
  if(!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/.test(macAddress)) {
    return false
  }

  return true
}

/**
 * createMagicPacket
 * @param {string} macAddress The mac address of the machine to Wake-Up
 * @throws Throws an Error if the provided mac address is invalid
 * @throws Throws an Error if the parsing of the magic packet fails
 * @returns {Buffer} Returns a Buffer object containing the wol-datagram payload
*/
const createMagicPacket = (macAddress: string): Buffer => {
  if(!verifyMacAddress(macAddress)) {
    throw new Error('Invalid mac address')
  }

  // Creating a Wake-On-Lan datagram string (no spaces)
  const magicPacketPayload = 'ff'
    .repeat(6)
    .concat(macAddress.replaceAll(':', '').repeat(16))
  
  // Splitting the string into an array of string bytes
  const parsedMagicPacketPayload = magicPacketPayload
    .match(/.{1,2}/g)

  if(!parsedMagicPacketPayload) {
    throw new Error('An error occurred while parsing the magic packet')
  }

  // Creating the `Magic Packet` (Hex Buffer)
  const magicPacket = Buffer.from(parsedMagicPacketPayload
    .map(strByte => parseInt(strByte, 16))
  )

  return magicPacket
}

