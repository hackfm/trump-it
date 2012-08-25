var features = function() {
    var positiveFeatureDescriptions = {
        'listeners': "Track with the <strong>Most Listeners</strong>",
        'scrobbles': "Track with the <strong>Most Scrobbles</strong>",
        'bpm': "<strong>Fastest</strong> track",
        'avg_loudness': "<strong>Loudest</strong> track",
        'energy': "Most <strong>Energetic</strong> track", 
        'percussiveness': "Most <strong>Percussive</strong> track",
        'danceability': "Most <strong>Danceable</strong> track"
    }
    var negativeFeatureDescriptions = {
        'listeners': "Track with the <strong>Fewest Listeners</strong>",
        'scrobbles': "Track with the <strong>Fewest Scrobbles</strong>",
        'bpm': "<strong>Slowest</strong> track",
        'avg_loudness': "<strong>Quietest</strong> track",
        'energy': "Least <strong>Energetic</strong> track", 
        'percussiveness': "Least <strong>Percussive</strong> track",
        'danceability': "Least <strong>Danceable</strong> track"
    }
    
    function getDescription(feature, negative) {
        if (negative) {
            return negativeFeatureDescriptions[feature];
        } else {
            return positiveFeatureDescriptions[feature]
        }
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
