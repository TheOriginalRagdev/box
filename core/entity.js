export class Entity {
  constructor(data = {}) {
    this.components = [];
    this.body;
    this.mesh;
    this.id = this.generateId();
    //this.noaEntityId = data.noaEntityId;
    this.type = undefined;
    this.lifeSpan = undefined;
    this.createdAt = Date.now();

    console.log("running entity constructor");
  }

  createBody(data) {
    // Creating a player mesh
    const mesh = BOX.Mesh[data.type](
      data.unitName,
      data.roundShap[0],
      data.roundShap[1]
    );

    return mesh;
  }

  addComponent(componentName) {
    /*this.components = {
      [componentName]: new loader.loadedComponents[componentName](1),
      id: this.id,
    };*/
    this.components.push({
      [componentName]: new loader.loadedComponents[componentName](1),
      id: this.id,
    });
    if (componentName === "DeveloperMode")
      this.components[1].DeveloperMode.developerModeButton(
        this.components[0].ControlComponent
      );
  }

  destroy() {
    BOX.Engine.removeEntity(this.id, this.noaEntityId);
  }

  removeComponent(componentName) {}

  setState(stateId) {}

  generateId() {
    return Math.random()
      .toString(36)
      .split("")
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      })
      .join("")
      .substr(2, 8);
  }

  setStreamMode(mode) {}

  tick() {
    // console.log(this.lifeSpan);
    if (this.lifeSpan != undefined && this.lifeSpan <= BOX.Engine.engineTime) {
      this.destroy();
    }

    // console.log("testing entity tick")

    //let pos = this.body.getPosition();

    // gradually slow down the body to stop using linearDamping
    // console.log(this.body.velocity)

    // this.body.velocity[0] = Math.max(0, this.body.velocity[0] - this.body.linearDamping);

    /**
      this.body.setPosition([
      Math.max(1, Math.min(pos[0], 19)),
      pos[1],
      Math.max(1, Math.min(pos[2], 19)),
    ]);
     */

    //BOX.Engine.noa.setBlock(0, 1, 1);

    // console.log(pos, this.body.getPosition());
  }

  //
  // } else {
}
