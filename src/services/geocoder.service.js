const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',  
    apiKey:  process.env.API_KEY_GOOGLE_MAPS,
    formatter: null
  };

  const geocoder = NodeGeocoder(options);


export const geoCode = async (address) => {
    try {
        const res = await geocoder.geocode(address);
        const lat = res[0].latitude
        const lng = res[0].longitude
        return {lat, lng}

    } catch (e) {
        return e.message
    }
} 

export const reverseGeoCode = async( req ) => {
    let { lat, lon } = req.query;
    try {
        const res = await geocoder.reverse({ lat: lat, lon: lon });
        return res;
    } catch(e) {
        console.log(e.message);
        return e.message;
    }

}

