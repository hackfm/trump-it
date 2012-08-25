function shuffle(v){
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
}

$(function() {
    var socket = io.connect('http://ec2-46-137-143-82.eu-west-1.compute.amazonaws.com:8080',
        function() {
            console.log('connected');
        });
    

    function getAudioFeatures(track, category) {
    }
    
    function selectTracks(topTracks, category, callback) {
        selectedTracks=[topTracks.pop(),topTracks.pop(),topTracks.pop()];
        callback(selectedTracks);
    }
    
    function startRound(selectedTracks) {
        $("#login").hide();
        $("#mainscreen").show();
        //$('.result_screen').hide();
        $("#tracks").empty();
        $.each(selectedTracks, function(i, trk) {
            $("#tracks").append(templates.trackElement(trk.artist,trk.track,trk.image, 4.4823));
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
    
    function showResults(winner, track, users) {
        $('#mainscreen').hide();
        if (winner != null) {
            $('#winner').show();
            $('#winning_user img').attr('src', winner.image);
            $('#winning_user .username').text(winner.name);
            $('#winning_track img').attr('src', track.image);
            $('#winning_track .artist').text(track.artist);
            $('#winning_track .title').text(track.title);
        }
        else
        {
            $('#no_winner').show();
        }
        

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
                    console.log('start');
                    selectTracks(topTracks, category, startRound);
                });

                socket.on('results', function (winner, track, users) {
                    console.log('result', winner, track, users);
                    showResults(winner, track, users);
                });
            });
        });
        return false;
    });
    
    

});
