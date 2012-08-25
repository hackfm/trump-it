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
    
    function getAudioFeatures(track, category) {
    }
    
    function selectTracks(topTracks, category, callback) {
        selectedTracks=[topTracks[0],topTracks[1],topTracks[2]];
        callback(selectedTracks);
    }
    
    function startRound(selectedTracks) {
        $("#login").hide();
        $("#mainscreen").show();
        $.each(selectedTracks, function(i, trk) {
            $("#tracks").append(templates.trackElement(trk.artist,trk.track,trk.image, 4.4823));
        });
        $("#tracks").find(".track").click(function() {
            var title = $(this).find(".title").text();
            var artist = $(this).find(".artist").text();
            var value = $(this).data("score");
            var image = $(this).find("img").attr("src");
            
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
    
    $("#login").show();
    $("#mainscreen").hide();
    
    $("#login_button").click(function() {
        var username=$("#username").val();
        lastfm.getUserImage(username, function(image) {
            socket.emit('join', {"name": username, "image": image});
            lastfm.getTopTracks($("#username").val(), function(tt) {
                var topTracks = shuffle(tt);
                socket.on('start', function (category) {
                    selectTracks(topTracks, category, startRound);
                });
            });
        });
        return false;
    });
    
    

});
