$(document).ready(function() {

    // Immediately hide all pop-ups
    $(".pop-up-background").hide(100);
    $(".pop-up-window").hide(200);

    // Function for closing the current pop-up
    function closePopUps() {
        $(".pop-up-background").fadeOut(100);
        $(".pop-up-window").fadeOut(200);
    };



    /* Button events */
    $("#button-steam").click(function() {
        $.get("steam", {});
    });

    $("#button-volume").click(function() {
        $.get("volume", {});
    });

    $("#button-mouse").click(function() {
        $.get("mouse", {});
    });

    $("#button-resolution").click(function() {
        $.get("resolution", {});
    });

    $("#button-food").click(function() {
        $(".pop-up-background").fadeIn(100);
        $("#food-redirect").fadeIn(200);
    });
    $("#button-discord").click(function() {
        window.open("https://discord.gg/uwcs", "window name", "window settings");
        window.setTimeout(closePopUps, 500);
    });

    $("#button-vive").click(function() {
        $(".pop-up-background").fadeIn(100);
        $("#vive-list").fadeIn(200);
    });



    // Pop-up windows
    $(".pop-up-window").on("click", function(e) {
        e.stopPropagation();
    });

    $(".close-pop-up").click(closePopUps);
    /* Button events END */

});
