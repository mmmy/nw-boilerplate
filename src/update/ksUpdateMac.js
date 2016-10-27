//var gui = require('nw.gui');
var pkg = require('../../package.json');
var updater = require('./updaterMac.js');
var url = require('url');
var upd = new updater(pkg);

console.log("cwd", process.cwd());
//gui.Window.get().showDevTools();

//request.get(url.resolve(pkg.manifestUrl, '/version/'+ pkg.version));
console.log(url.resolve(pkg.manifestUrl, '/version/' + pkg.version));

upd.checkNewVersion(versionChecked);

function newAppInstalled(err) {
  if (err) {
    console.log(err);
    return;
  }
  upd.run(execPath, null);
  //gui.App.quit();
}

//download new version of app in tmp
//unpack
//run updater
//updater will copy itself to origin directory
//upd.install(copyPath, newAppInstalled);
//updater will run app


//document.getElementById('version').innerHTML = 'copying app';
//upd.install(copyPath, newAppInstalled);


function versionChecked(err, newVersionExists, manifest) {
  if (err) {
    console.log(err);
    return Error(err);
  } else if (!newVersionExists) {
    console.log('No new version exists');
    return;
  }
  console.log(manifest);
  
  upd.download(function(error, filename) {
    newVersionDownloaded(error, filename, manifest);
  }, manifest);
/*
  // if (window.confirm("new version! update or not?")) {
  var loaded = 0;
  var newVersion = upd.download(function(error, filename) {
    newVersionDownloaded(error, filename, manifest);
  }, manifest);

  newVersion.on('data', function(chunk) {
    loaded += chunk.length;
  });
  // }
*/
}

function newVersionDownloaded(err, filename, manifest) {
  if (err) {
    console.log(err)
    return Error(err);
  }
  console.log("newVersionDownloaded");
  upd.unpack(filename, newVersionUnpacked, manifest);
}

function newVersionUnpacked(err, newAppPath) {
  if (err) {
    console.log(err)
    return Error(err);
  }
  console.log("newVersionUnpacked");
  console.log("install", "from", newAppPath, "to", process.cwd());
  //upd.install(newAppPath, process.cwd(), function() {});
}