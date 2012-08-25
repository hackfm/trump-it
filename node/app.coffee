io = require('socket.io').listen 8080

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
            @users.sort (a, b) ->
                if (b.value == null)
                    return -1
                if (a.value == null)
                    return 1
                return b.value - a.value

            # Add Score to users
            scores = [5, 2, 1]
            i = 0;
            for score, i in scores 
                if (@users.length > i && @users[i].value != null)
                    @users[i].score += score


            # Determin winner, if there is one
            winner = null;
            if (@users.length > 0)
                console.log(@users[0].value)
                if (@users[0].value != null)
                    winner = @users[0]

            # Sort users back to score
            @sortUsers();

            # Send the stuff down the wire
            if (winner == null) 
                console.log 'result: no winner this round'
                @emit 'results', null, null, @users
            else
                console.log 'results: ', winner.name, winner.track.track
                @emit 'results', winner, winner.track, @users
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
        console.log 'user joined', user.name

        userObj = game.userJoin(user.name, user.image);

        onStart = (feature, parity) ->
            socket.emit 'start', feature, parity

        onResult = (winner, track, users) ->
            socket.emit 'results', winner, track, users

        onUsers = () ->
            socket.emit 'users', game.users

        # Only allow one connection per user
        onUserJoin = (name) ->
            if (name == user.name)
                console.log 'force disconnect', name
                socket.disconnect();

        game.on 'start', onStart
        game.on 'results', onResult
        game.on 'users', onUsers
        game.on 'userJoin', onUserJoin

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
            game.userRemoveConnection(user);

        # Clean up on disconnect
        socket.on 'disconnect', onDisconnect
        socket.on 'error', onDisconnect
            


# Less debug
io.set('log level', 1);