var templates=function() {

    function trackElement(artist,title,image) {
        var element = $("#templates .track").clone();
        element.find(".artist").text(artist);
        element.find(".title").text(title);
        element.find("img").attr("src",image);
        return element;
    }
    
    return {trackElement:trackElement};  
}();
