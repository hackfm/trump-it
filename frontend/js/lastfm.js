var lastfm=function() {
    var api_key="202ece1f999e55ce1c3aaabbbad6ae40";
    var api_root="http://ws.audioscrobbler.com/2.0/?";
    
    function getUserImage(userName, callback) {
        $.getJSON(api_root,
            {
                method:"user.getInfo",
                api_key:api_key,
                user:userName,
                format:"json"
            }, function(response) {
                callback(response.user.image[1]["#text"]);
            });
    }
    
    function getTopTracks(userName, callback) {
        $.getJSON(api_root,
            {
                method:"user.getTopTracks",
                api_key:api_key,
                user:userName,
                period:"12month",
                limit:100,
                format:"json"
            }, function(rawData) {
                var results=[];
                var trackArray = rawData.toptracks.track;
                $.each(rawData.toptracks.track, function(i, rawTrack) {
                    var artist = rawTrack.artist.name;
                    var track = rawTrack.name;
                    var image = "";
                    if (rawTrack.hasOwnProperty("image")) {
                        image=rawTrack.image[1]["#text"];
                    }
                    results.push(
                        {
                            "artist":artist,
                            "track":track,
                            "image":image
                        });
                });
                callback(results);
            });
    }
    
    
    return {
        "getTopTracks":getTopTracks,
        "getUserImage":getUserImage
    };
}();
