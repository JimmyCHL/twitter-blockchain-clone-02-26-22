const key = process.env.NEXT_PUBLIC_PINATA_API_KEY
const secret = process.env.NEXT_PUBLIC_PINATA_API_SECRET

import axios from 'axios'

export const pinJSONToIPFS = async (json) => {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

  return axios
    .post(url, json, {
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then((response) => {
      return response.data.IpfsHash
    })
    .catch((error) => {
      console.log(error)
    })
}

export const pinFileToIPFS = async (file, pinataMetadata) => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'

  let data = new FormData()

  data.append('file', file) //first value should be file
  data.append('pinataMetadata', JSON.stringify(pinataMetadata)) //after the the key-value, the value can only be Strings, Numbers (integers or decimals), Dates (Provided in ISO_8601 format)

  return axios
    .post(url, data, {
      maxBodyLength: Infinity, //the max request body size
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`, //The boundary acts like a marker of each chunk of name/value pairs passed when a form gets submitted.
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then((response) => {
      return response.data.IpfsHash
    })
    .catch((error) => {
      console.log(error)
    })
}
