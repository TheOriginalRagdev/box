const state = {
  initPlayerPos: true,
  playerMovingFaster: false,
  jumpping: false,
  maxVelocity: 7,
};
var checker = 0;
for (let i = 0; i <= 18; i++) timer.push("rot");
const system = (dt, states) => {
  var bodyPlayer = box.Engine.noa.entities.getPhysicsBody(1);
  var meshData = box.Engine.noa.entities.getMeshData(1);
  var playerPos = box.Engine.noa.entities.getPosition(1);
  for (let elem in states) {
    bodyPlayer.friction = 2;
    bodyPlayer.gravityMultiplier = 2;
    Math.abs(bodyPlayer.velocity[0]) > states[elem]["maxVelocity"] ||
    Math.abs(bodyPlayer.velocity[1]) > states[elem]["maxVelocity"] ||
    Math.abs(bodyPlayer.velocity[2]) > states[elem]["maxVelocity"]
      ? (states[elem]["faster"] = true)
      : (states[elem]["faster"] = false);

    states[elem]["jumpping"] = bodyPlayer.atRestY() < 0 ? true : false;

    /**
        states[elem]["jumpping"]
      ? (states[elem]["maxVelocity"] = 7)
      : (states[elem]["maxVelocity"] = 0.5);
     */

    if (states[elem]["initPlayerPos"]) {
      bodyPlayer.setPosition([10, 10, 10]);
      states[elem]["initPlayerPos"] = false;
    }

    if (states[elem]["__id"] === 1) {
      bodyPlayer.gravityMultiplier = 2;
      if (box.inputs.state["shoot-ball"]) {
        /*
        this.shootProjectile();
        **/
      }

      let current = box.Engine.noa.camera.heading;
      // console.log("logging state ", box.Engine.noa.entities);

      if (checker > current) {
        // ------------- rotation LOG ---------------------
        console.log("log the issue", checker - current);
        meshData.mesh.rotatePOV(0, (checker - current) * -1, 0);
        // meshData.mesh.rotation.y = current;
      }
      if (checker < current) {
        // ------------- rotation LOG ---------------------
        console.log("log the issue", checker - current);
        meshData.mesh.rotatePOV(0, (checker - current) * -1, 0);
        // meshData.mesh.rotation.y = current;
      }
      checker = current;

      //idex--;

      // handle physics boundary

      let angle = box.Engine.noa.camera.heading;
      let force = 2;
      let y = force * Math.cos(angle);
      let x = force * Math.sin(angle);

      //console.log("player position", meshData.mesh.rotatePOV(0, current, 0));
      if (playerPos[0] <= 0.9 && states[elem]["velocity"] > 3) {
        bodyPlayer.friction = 1000;
        bodyPlayer.gravityMultiplier = 1000;
      }
      if (playerPos[0] >= 19.1 && states[elem]["velocity"] > 3) {
        bodyPlayer.friction = 1000;
        bodyPlayer.gravityMultiplier = 1000;
      }
      if (playerPos[2] <= 0.9 && states[elem]["velocity"] > 3) {
        bodyPlayer.friction = 1000;
        bodyPlayer.gravityMultiplier = 1000;
      }
      //
      if (playerPos[2] >= 19.1 && states[elem]["velocity"] > 3) {
        bodyPlayer.friction = 1000;
        bodyPlayer.gravityMultiplier = 1000;
      }

      bodyPlayer.friction = 2;
      bodyPlayer.gravityMultiplier = 2;
      if (
        box.inputs.state["jump"] &&
        playerPos[1] <= 7 &&
        !states[elem]["faster"]
      ) {
        bodyPlayer.applyImpulse([0, 7, 0]);
      }

      if (
        box.inputs.state["move-left"] &&
        playerPos[0] >= 1 &&
        !states[elem]["faster"]
      ) {
        bodyPlayer.applyImpulse([-y, 0, x]);
      }
      if (
        box.inputs.state["move-right"] &&
        playerPos[0] <= 19 &&
        !states[elem]["faster"]
      ) {
        bodyPlayer.applyImpulse([y, 0, -x]);
      }
      if (
        box.inputs.state["move-up"] &&
        playerPos[2] <= 19 &&
        !states[elem]["faster"]
      ) {
        bodyPlayer.applyImpulse([x, 0, y]);
      }
      if (
        box.inputs.state["move-down"] &&
        playerPos[2] >= 1 &&
        !states[elem]["faster"]
      ) {
        bodyPlayer.applyImpulse([-x, 0, -y]);
      }
      box.inputs.state.dy = 0;
      box.inputs.state.dx = 0;
    }
  }
};

export const movementComp = {
  name: "entityMovement",
  state: state,
  system: system,
};