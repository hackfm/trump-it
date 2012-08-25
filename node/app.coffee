io = require('socket.io').listen 8080
http = require 'http'

EventEmitter = require('events').EventEmitter

features = [
    'listeners',
    'scrobbles',
    'bpm',
    'avg_loudness',
    'energy',
    'percussiveness',
    'danceability'
]

parities = ['+', '-']

class Game extends EventEmitter
    constructor: ->
        @setMaxListeners 0

        # User List
        @users = []

        # Game Timer
        setInterval @gameStart, 30000;
        @gameStart();

    # Using 7digital
    getPreviewURL: (artist, track, callback) =>
        options = 
            host: 'api.7digital.com',
            path: '/1.2/track/search?q='+encodeURIComponent(artist)+'%20'+encodeURIComponent(track)+'&oauth_consumer_key=musichackday',
            method: 'GET'
        
        buffer = '';
        http.get options, (r) ->
            r.setEncoding 'utf8'
            r.on 'data', (chunk) ->
                buffer += chunk
            r.on 'end', () ->
                res = buffer.match /\<track id="([\d]+)"\>/
                if (res && (res instanceof Array) && (res.length>1))
                    callback 'http://previews.7digital.com/clips/34/'+res[1]+'.clip.mp3'

        .on 'error', (e) ->
            console.log("Got error HTTP: " + e.message);


    # Happens every 30 seconds
    gameStart: =>

        # Pick category
        @feature = @pickRandomFeature()
        @parity = @pickRandomParity()

        # Remove all those values and tracks from user objects
        @cleanUpValueOnUsers();

        # Send event
        @emit 'start', @feature, @parity
        console.log 'start. Feature picked is:', @feature, 'parity:', @parity

        # Wait for the game to end
        setTimeout =>
       
            # find winners. This messes up the ordering, so make sure you sort it by score afterwards
            @users.sort (a, b) =>
                if (b.value == null)
                    return -1
                if (a.value == null)
                    return 1
                if (@parity == '+')
                    return b.value - a.value
                else
                    return a.value - b.value

            # Add Score to users
            scores = [5, 2, 1]
            i = 0;
            for score, i in scores 
                if (@users.length > i && @users[i].value != null)
                    @users[i].score += score


            # Determin winners, if there are any
            winners = [];
            if (@users.length > 0)
                len = Math.min(@users.length, 3) - 1;
                for i in [0..len]
                    if (@users[i])
                        if (@users[i].value != null)
                            winners.push @users[i]

            console.log winners

            # Sort users back to score
            @sortUsers();

            # Send the stuff down the wire
            if (winners.length == 0) 
                console.log 'result: no winner this round'
            else
                console.log 'winner #0:', winners[0].name

                # get preview url 
                @getPreviewURL winners[0].track.artist, winners[0].track.title, (r) =>
                    @emit 'preview', r
            
            @emit 'results', winners, @users    

                
        ,15000

    sortUsers: =>
        @users.sort (a, b) ->
            return b.score - a.score
        @emit 'users'

    pickRandomFeature: =>
        i = Math.floor(Math.random() * features.length);
        return features[i]     

    pickRandomParity: =>
        i = Math.floor(Math.random() * parities.length);
        return parities[i]    

    userJoin: (name, image) =>
        @emit 'userJoin', name

        # no double joining, please
        for user in @users
            if (user.name == name) 
                return user

        # add user
        userObj = {
            name: name
            image: image
            score: 0
            value: null
            track: null
        }
        @users.push userObj
        return userObj
        @emit 'users'

    cleanUpValueOnUsers: () =>
        for user in @users
            do (user) ->
                user.value = null;
                user.track = null;

    # It's a bit stupid, but deleting elements from an array in JS is baaaah.
    userRemoveConnection: (user) =>

        name = user.name
        newList = [];
        for user in @users
            do (user) ->
                if (user.name != name) 
                    newList.push user

        @users = newList;
        @emit 'users'


# Start the game
game = new Game();

# Sockets 
io.sockets.on 'connection', (socket) ->

    socket.on 'join', (user) ->
        
        user.name = user.name.toLowerCase()

        console.log 'user joined', user.name

        userObj = game.userJoin(user.name, user.image);

        onStart = (feature, parity) ->
            socket.emit 'start', feature, parity

        onResult = (winner, track, users) ->
            socket.emit 'results', winner, track, users

        onUsers = () ->
            socket.emit 'users', game.users

        onPreview = (url) ->
            socket.emit 'preview', url
            setTimeout () ->
                socket.emit 'previewPlay'
            ,3000
            setTimeout () ->
                socket.emit 'previewStop'
            ,30000

        # Only allow one connection per user
        onUserJoin = (name) ->
            if (name == user.name)
                console.log 'force disconnect', name
                socket.disconnect();

        game.on 'start', onStart
        game.on 'results', onResult
        game.on 'users', onUsers
        game.on 'userJoin', onUserJoin
        game.on 'preview', onPreview

        # Show them what we got...
        onUsers();

        # User has made his choice
        socket.on 'pick', (track, value) ->
            console.log('user picked a track', track.title, value)
            userObj.track = track
            userObj.value = value

        onDisconnect = () ->
            console.log('user left', user.name)
            game.removeListener 'start', onStart
            game.removeListener 'results', onResult
            game.removeListener 'users', onUsers
            game.removeListener 'userJoin', onUserJoin
            game.removeListener 'preview', onPreview
            game.userRemoveConnection(user);

        # Clean up on disconnect
        socket.on 'disconnect', onDisconnect
        socket.on 'error', onDisconnect
            


# Less debug
io.set('log level', 1);