var SOCKET = require('http').createServer();

var engine = new SOCKET.NullEngine();
var scene = new SOCKET.Scene(engine);

global.XMLHttpRequest = require("xhr2").XMLHttpRequest;

var engine = new SOCKET.NullEngine();
var scene = new SOCKET.Scene(engine);

var light = new SOCKET.PointLight(
  "Omni",
  new SOCKET.Vector3(20, 20, 100),
  scene
);

var camera = new SOCKET.ArcRotateCamera(
  "Camera",
  0,
  0.8,
  100,
  SOCKET.Vector3.Zero(),
  scene
);

SOCKET.SceneLoader.ImportMesh(
  "",
  "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.1.3/socket.io.js.map",
  "skull.socket",
  scene,
  function (newMeshes) {
    camera.target = newMeshes[0];

    console.log("Meshes loaded from socket file: " + newMeshes.length);
    for (var index = 0; index < newMeshes.length; index++) {
      console.log(newMeshes[index].toString());
    }

    console.log("render started");
    engine.runRenderLoop(function () {
      scene.render();
    });
  }
);
