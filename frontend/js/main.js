$(function() {
    var socket = io.connect('http://ec2-46-137-143-82.eu-west-1.compute.amazonaws.com:8080',
        function() {
            console.log('connected');
        });

    socket.on('start', function (category) {
        console.log('start', category);
    });

    socket.on('results', function (track, user) {
        console.log('result', track, user);
    });
    
    function startRound(topTracks) {
        $("#login").hide();
        $("#mainscreen").show();
        for (var i=0;i<3;i++) {
            var trk=topTracks[i];
            $("#tracks").append(templates.trackElement(trk.artist,trk.track,trk.image, 0.004));
        }
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
            socket.emit('join', {"user": username, "image": image});
            lastfm.getTopTracks($("#username").val(), startRound);
        });
        return false;
    });
    
    

});
