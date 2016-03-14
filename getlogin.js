/* jshint laxbreak:true, laxcomma:true */

if (process.argv.length != 2){
  console.log('Usage: electron getlogin.js');
  process.exit();
}

var BrowserWindow = require('browser-window')
  , readline = require('readline')
  , config = {};
  
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('close', function() {
  process.exit(0);
});

try {
  config = require('./config.js');
} catch(e){
  console.log('Couldn\'t load config.js.');
}

var app = require('app')
  , win = null
  , web = null;

var urls = {
  inital : 'http://google.com',
  login : 'https://guestportal.ssa.gov:8443/guestportal/Login.action'
};

// Login page
app.on('ready', function(){
  win = new BrowserWindow({width: 800, height: 600, show: false});
  web = win.webContents;
  win.loadUrl(urls.inital);

  web.once('did-finish-load', function(){
    setTimeout(credentials, 2000);
  });
});

function credentials(){
  
  // Prompt for login credentials
  if (!config.username){
    rl.question("Please enter your network username: ", function(answer){
      config.username = answer;
      credentials();
    }); 
  } else if (!config.password){

    // Hide output on stdout via http://stackoverflow.com/questions/24037545
    var query = "Please enter your password: "
      , stdin = process.openStdin();

    process.stdin.on("data", function(char) {
      char = char + "";
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.pause();
          break;
        default:
          process.stdout.write("\033[2K\033[200D" + query + Array(rl.line.length+1).join("*"));
          break;
      }
    });

    rl.question(query, function(answer){
      rl.history = rl.history.slice(1);
      config.password = answer;
      credentials();
    }); 

  } else {
    login();
  }
}

function login(){

  var js = ""
   + "document.querySelector('input[name=\"guestUser.name\"]').value = '" + config.username + "';"
   + "document.querySelector('input[name=\"guestUser.password\"]').value = '" + config.password + "';" 
   + "document.querySelector('button[type=\"submit\"]').click()";

  web.on('did-finish-load', function callback(){

    var title = win.getTitle();

    console.log(title);
    if (title === 'Google'){
      app.quit();
    }
  });
  
  web.executeJavaScript(js);
}
