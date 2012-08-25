var templates=function() {

    function trackElement(artist,title,image,value,feature) {
        var element = $("#templates .track").clone();
        element.find(".artist").text(artist);
        element.find(".title").text(title);
        element.find("img").attr("src",image);
        element.find(".display_score").text(feature+": "+value);
        element.data("score",value);
        return element;
    }

    function userForLeaderboardElement(name,image,score) {
        var element = $("#templates .userForLeaderboard").clone();
        element.find(".score").text(score);
        element.find("img").attr("src",image);
        element.find("img").attr("alt",name);
        element.attr('href', 'http://www.last.fm/user/'+encodeURIComponent(name));
        element.attr('title', name);
        return element;
    }
    
    return {
        "trackElement":trackElement,
        "userForLeaderboardElement":userForLeaderboardElement
    };  
}();
