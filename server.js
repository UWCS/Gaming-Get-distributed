const fs = require("fs");
const express = require ("express");
const jsonfile = require("jsonfile");
const childProcess = require("child_process");
const cors = require('cors');

const port = 8000;
const saveDir = "/var/tmp/dcs-get/saves";
const packagesJsonPath = "/var/tmp/dcs-get/packages.json";
const installations = [];

const app = express();

app.use(cors());
app.use(express.static(`${__dirname}/static`));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

app.enable('trust proxy');
app.set('trust proxy','loopback');

const server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server listening at http://"+host+":"+port);
});

app.get('/', function(req,res) {
  let homePage = buildHTML();
  res.status(200).send(homePage);
});

app.get('/steam', function(req,res) {
  steam();
  res.status(200).end();
});

app.get('/mouse', function(req,res) {
  mouse();
  res.status(200).end();
});

app.get('/volume', function(req,res) {
  volume();
  res.status(200).end();
});

app.get('/resolution', function(req,res) {
  fixResolution();
  res.status(200).end();
});

app.get('/install', function(req,res) {
  let game = req.query.game;
  console.log(`install request for: ${game}`);
  installGame(game);
  res.status(200).end();
});

app.get('/status', function(req,res) {
  let game = req.query.game;
  let gameInfo = status(game);
  res.status(200).send(gameInfo);
});

app.get('/launch', function(req,res) {
  let game = req.query.game;
  let success = launchGame(game);
  if(success)
  {
    res.status(200).send(`Launching ${game}`);
  } else {
    res.status(400).end();
  }
});

app.get('/check', function(req,res) {
  let game = req.query.game;
  let check = checkGameInstall(game);
  res.status(200).send({found:check});
});

function buildHTML() {
    // Load html templates
    //Nicely instead of hard coded?
    let htmlTemplate = fs.readFileSync(`${__dirname}/templates/index.tmpl`, "utf8");
    let gameTemplate = fs.readFileSync(`${__dirname}/templates/game.tmpl`, "utf8");
    let tagTemplate = fs.readFileSync(`${__dirname}/templates/tag.tmpl`, "utf8");

    // Load list of game directories
    //Replace with the use of JSONfile
    let packagesPath = packagesJsonPath;
    let packageList = "";
    if(fs.existsSync(packagesPath))
    {
      packageList = jsonfile.readFileSync(packagesPath);
    } else
    {
      console.log("dcs-get broken, sad times");
    }
    const games = {};
    for (const package of Object.keys(packageList)) {
        if (packageList[package].type === "game")
            games[package] = packageList[package];
    }

    // Stitch together the html source
    let gameHTML = "";
    for (const gameName of Object.keys(games).sort((a,b) => {
      var compA = a.toLowerCase();
      var compB = b.toLowerCase();

      if(compA < compB)
      {
        return -1;
      }

      if(compA > compB)
      {
        return 1;
      }

      return 0;
    })) {
        const game = games[gameName];
        let tags = "";
        game.tags.forEach(function(tag) {
            tags += tagTemplate.replace(/@tag/g, tag);
        });

        let gameTitle = game["title"] || gameName;
        let gameString = gameTemplate.replace(/@img/g, game["image-url"]);
        gameString = gameString.replace(/@title/g, gameTitle);
        gameString = gameString.replace(/@description/g, game.description);
        gameString = gameString.replace(/@tags/g, tags);
        gameString = gameString.replace(/@name/g, gameName);
        gameHTML += gameString
    }

    // Paste the list of game divs into the full html template
    return htmlTemplate.replace("@games", gameHTML)
}

function steam() {
    console.log("Launching Steam");
    const process = childProcess.exec("HOME=/var/tmp/steam-tmp /var/tmp/steam-tmp/steam/steam &", function(err, stdout, stderr) {
        if (err)
            console.log(err);
    });
    process.on('close', code => {
      console.log("Steam closed with code: " + code);
    });
}


function volume() {
    console.log("Launching gnome-control-center sound");
    childProcess.exec("gnome-control-center sound", function(err, stdout, stderr) {
        if (err)
            console.log(err);
    });
}


function mouse() {
    console.log("Launching gnome-control-center mouse");
    childProcess.exec("gnome-control-center mouse", function(err, stdout, stderr) {
        if (err)
            console.log(err);
    });
}


function fixResolution() {
    console.log("Fixing resolution");
    childProcess.exec("xrandr -s 0", function(err, stdout, stderr) {
        if (err)
            console.log(err);
    });
}

function status(game) {
    const gameInfo = installations[game] || {
        progress: 0
    };

    return gameInfo;
}

function installGame(game) {
    installations[game] = {
        progress: 0
    };
    const process = childProcess.spawn("dcs-get", ["install", game]);
    process.stdout.on('data', data => {
        const progress = data.toString().match(/(\d+)\/(\d+)/)
        if (progress !== null)
            installations[game].progress = progress[1] / progress[2];
    });
    process.stderr.on('data', data => {
        console.log('stderr', data.toString());
    });
    process.on('close', code => {
        console.log(`Installing ${game} finished with code ${code}`);
        if (code === 0)
            installations[game].progress = 1;
    });
}

function getLaunchStatus() {

}

function launchGame(game) {
    if (!game) {
        console.err("gameName not found");
    }
    let enviro = process.env; //Calling variables in this function 'process' will result in breaking the GLOBAL variable process
    enviro.HOME = saveDir; //Set home directory for games, such that they save there
    const proc = childProcess.spawn(game,[],{env:enviro});

    proc.on('error', code => {
      console.log(`Game: ${game} exited with error: ${code}`);
    });

    proc.on('close', code => {
        console.log(`Game: ${game} finished with code ${code}`);
    });
    return true;
}

function checkGameInstall(game) {
    const symLinkLoc = "/var/tmp/dcs-get/bin/" + game;
    var check = fs.existsSync(symLinkLoc);
    return check;
}
