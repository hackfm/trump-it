var features = function() {
    var featureDescriptions = {
        'listeners': "track with the <strong>Most Listeners</strong>",
        'scrobbles': "track with the <strong>Most Scrobbles</strong>",
        'bpm': "<strong>Fastest</strong> track",
        'loudness': "<strong>Loudest</strong> track",
        'energy': "Most <strong>Energetic</strong> track", 
        'percussiveness': "Most <strong>Percussive</strong> track",
        'danceability': "Most <strong>Danceable</strong> track"
    }
    
    function getDescription(feature) {
        return featureDescriptions[feature];
    }
    
    function getFeatures(artist, title, callback) {
        lastfm.getAudioFeatures(artist,title,function(audioFeatures) {
            if (audioFeatures!=null) {
                lastfm.getListeningData(artist,title, function(listeningData) {
                    callback($.extend(audioFeatures,listeningData));
                });
            } else {
                callback(null);
            }
        });
    }
    return {
        "getFeatures":getFeatures,
        "getDescription":getDescription
    };
}();
