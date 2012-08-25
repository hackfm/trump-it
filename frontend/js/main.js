function shuffle(v){
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
}

$(function() {
    var socket = io.connect('http://ec2-46-137-143-82.eu-west-1.compute.amazonaws.com:8080',
        function() {
            console.log('connected');
        });
    

    socket.on('results', function (track, user) {
        console.log('result', track, user);
    });
    
    
    function selectTracks(tracklist, category, callback) {
        selectedTracks=[tracklist.pop(),tracklist.pop(),tracklist.pop()];
        startRound(selectedTracks,category);
    }
    
    function startRound(selectedTracks,category) {
        $("#login").hide();
        $("#mainscreen").show();
        $("#tracks").empty();
        $.each(selectedTracks, function(i, trk) {
            $("#tracks").append(templates.trackElement(trk.artist,trk.track,trk.image,trk.features[category]));
        });
        $("#tracks").find(".track").click(function() {
            var title = $(this).find(".title").text();
            var artist = $(this).find(".artist").text();
            var value = $(this).data("score");
            var image = $(this).find("img").attr("src");
            $("#tracks").find(".track").not(this).fadeOut("slow");
            socket.emit("pick", 
                {
                  "artist":artist,
                  "title":title,
                  "image":image
                },
                value);
            console.log("track_click", artist,title,value);
        });
    }
    
    var tracksWithData=[];
    function fetchFeatures(topTracks) {
        if (topTracks.length==0) {
            return;
        }
        var trk=topTracks.pop();
        features.getFeatures(trk.artist,trk.track, function(feat) {
            if (feat!=null) {
                tracksWithData.push($.extend({},trk,{features: feat}));
            }
            fetchFeatures(topTracks);
        });
    }
    
    
    
    $("#login_button").click(function() {
        var username=$("#username").val();
        lastfm.getUserImage(username, function(image) {
            socket.emit('join', {"name": username, "image": image});
            lastfm.getTopTracks($("#username").val(), function(tt) {
                var topTracks = shuffle(tt);
                fetchFeatures(topTracks);
                socket.on('start', function (category) {
                    if (tracksWithData.length<3) return;
                    console.log(category);
                    selectTracks(tracksWithData, category);
                });
            });
        });
        return false;
    });
    
    $("#login").show();
    $("#mainscreen").hide();

});
