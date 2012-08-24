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
    
    $("#login").show();
    $("#mainscreen").hide();
    
    $("#login_button").click(function() {
        lastfm.getUserImage($("#username").val(), function(image) {
            lastfm.getTopTracks($("#username").val(), function(topTracks) {
                $("#login").hide();
                $("#mainscreen").show();
                for (var i=0;i<3;i++) {
                    var trk=topTracks[i];
                    $("#tracks").append(templates.trackElement(trk.artist,trk.track,trk.image));
                }
            });
        });
        return false;
    });

});
