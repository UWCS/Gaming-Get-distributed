$(document).ready(function() {

$("#search-bar").on("input", function() {
    queries = $(this).val().split(",");
    applySearch();
});

$(".game-ticket-tag").click(function() {

    let tag = $(this).text().trim().toLowerCase();

    if (event.ctrlKey) {
        if (!queries.includes(tag)) {
            queries.push(tag);
        }
    } else if (event.shiftKey) {
        queries = [];
    } else {
        queries = [tag];
    }

    applySearch();
    showSearch();
});

});



let queries = [];

function applySearch() {
search = queries.map(e => e.trim().toLowerCase());
search = search.filter(function(e) {
    return e;
});
search = search.map(e => e.toString().replace(/\s+/g, ' '));
var games = $(".game-ticket");

games.each(function(index, element) {
    if (search.length != 0) {
        var matches = 0;

        // Check for matching name
        var name = $(element).find("h3").text().toLowerCase();
        for (var i = 0; i < search.length; i++) {
            if (search[i].trim() && name.includes(search[i].trim())) {
                matches++;
            }
        }

        // Check for matching tags
        var tags = $(element).find(".game-ticket-tag");
        tags.each(function(i, e) {
            for (var i = 0; i < search.length; i++) {
                if (search[i].trim() && $(e).text().toLowerCase().includes(search[0].trim())) {
                    matches++;
                }
            }
        });

        if (matches === search.length)
            $(element).show(100);
        else
            $(element).hide(150);
    } else {
        $(element).show(100);
    }
});
}

function showSearch() {
$("#search-bar").val(queries.join(", "));
}
