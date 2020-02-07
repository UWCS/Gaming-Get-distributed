$(document).ready(function() {
    $(".game-button.uninstalled").each(function() {
        checkIfInstalled($(this));
    });
    $(".game-button.uninstalled").click(function(event) {
        event.preventDefault();
        requestInstallation($(this));
    });
});

function checkIfInstalled(button) {
    const game = button[0].value;
    $.ajax({
        url: `check?game=${game}`,
        dataType: "text"
    }).done(raw => {
        var data = JSON.parse(raw);
        if (data.found) {
            button.text("");
            button.prop("disabled", false);
            button.addClass("installed");
            button.removeClass("uninstalled");
            button.append('<img src="img/play.png" class="play-symbol" draggable=false />');
            button.removeAttr("style");
            button.unbind('click').click(function(event) {
                event.preventDefault();
                requestLaunch($(this));
            });
        }
    });
}

function requestInstallation(button) {
    // Set button to loading
    button.off();
    button.prop("disabled", true);
    button.css("background-image", "linear-gradient(to right, var(--button_blue), var(--button_blue) 0, transparent 0, transparent), url('img/hash.png')");
    button.css("background-size", "100%, 16px");
    button.css("background-position", "right");
    button.css("background-color", "var(--warwickgg_dark_grey)");
    button.text("");

    const game = button[0].value;
    $.ajax({
            url: `install?game=${game}`,
            dataType: "text"
        })
        .done(data => {
            updateProgress();
        });

    // Animate the loading bar
    function updateProgress() {
        $.ajax({
                url: `status?game=${game}`,
                dataType: "json"
            })
            .done(data => {
                if (data.progress === 1) {
                    // Set the button to play
                    button.prop("disabled", false);
                    button.addClass("installed");
                    button.removeClass("uninstalled");
                    button.append('<img src="img/play.png" class="play-symbol" draggable=false />');
                    button.removeAttr("style");
                    button.unbind('click').click(function(event){
                        event.preventDefault();
                        requestLaunch($(this));
                    });
                } else {
                    const percentage = data.progress * 100;
                    button.css("background-image", "linear-gradient(to right, var(--button_blue), var(--button_blue) " + percentage + "%, transparent " + percentage + "%, transparent), url('img/hash.png')");
                    setTimeout(function() {
                        updateProgress();
                    }, 100);
                }
            });
    }
}

function requestLaunch(button) {
    const game = button[0].value;
    $.ajax({
            url: `launch?game=${game}`,
            dataType: "text"
        })
        .done(_ => {
            console.log(`attempting to launch: ${game}`);
        });
}
