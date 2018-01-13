module.exports = {
    extractCoordinatesFromGoogleMapsUrl: function (url) {
        var coordsString = url.slice(url.indexOf("=") + 1);
        return coordsString.split(",");
    }
};