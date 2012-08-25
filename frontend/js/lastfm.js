var lastfm=function() {
    var api_key="202ece1f999e55ce1c3aaabbbad6ae40";
    var api_root="http://ws.audioscrobbler.com/2.0/?";
    
    function getPreviewMp3(artist, title) {
        return api_root+$.param({
            method: "track.getPreviewmp3",
            api_key:api_key,
            artist:artist,
            track:title
        });
    }
    
    function getAudioFeatures(artist, title, callback) {
        $.getJSON(api_root,
            {
                method:"track.getAudioFeatures",
                api_key:api_key,
                format:"json",
                "artist":artist,
                "track":title
            }, function(response) {
                if (response.audiofeatures=="\n    ") {
                    callback(null);
                } else {
                    callback(response.audiofeatures);
                }
            });
    }
    
    function getListeningData(artist,title,callback) {
        $.getJSON(api_root,
            {
                method:"track.getInfo",
                api_key:api_key,
                format:"json",
                "artist":artist,
                "track":title
            }, function(response) {
                var listeningData = {
                    listeners: response.track.listeners,
                    scrobbles: response.track.playcount
                };
                callback(listeningData);
            });
    }
    
    function getUserImage(userName, callback) {
        $.getJSON(api_root,
            {
                method:"user.getInfo",
                api_key:api_key,
                user:userName,
                format:"json"
            }, function(response) {
                callback(response.user.image[1]["#text"].replace('/64/', '/64s/'));
            });
    }
    
    
    
    function getTopTracks(userName, callback) {
        $.getJSON(api_root,
            {
                method:"user.getTopTracks",
                api_key:api_key,
                user:userName,
                period:"6month",
                limit:200,
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
        "getUserImage":getUserImage,
        "getAudioFeatures":getAudioFeatures,
        "getListeningData":getListeningData,
        "getPreviewMp3":getPreviewMp3
    };
}();
