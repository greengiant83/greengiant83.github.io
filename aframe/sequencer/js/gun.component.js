AFRAME.registerComponent('gun', {
  schema: {
    bulletTemplate: {default: '#bullet-template'},
    triggerKeyCode: {default: 32} // spacebar
  },

  init: function() {
    var that = this;
    document.body.onkeyup = function(e){
      if(e.keyCode == that.data.triggerKeyCode){
        that.shoot();
      }
    }
  },

  shoot: function() {
    this.createBullet();
  },

  createBullet: function() {
    var el = document.createElement('a-entity');
    el.setAttribute('networked', 'template:' + this.data.bulletTemplate);
    el.setAttribute('remove-in-seconds', 3);
    el.setAttribute('forward', 'speed:0.3');

    var tip = document.querySelector('#player .gun-tip');
    el.setAttribute('position', this.getInitialBulletPosition(tip));
    el.setAttribute('rotation', this.getInitialBulletRotation(tip));

    var scene = document.querySelector('a-scene');
    scene.appendChild(el);
  },

  getInitialBulletPosition: function(spawnerEl) {
    var position = spawnerEl.getAttribute('position');

    var worldPos = new THREE.Vector3();
    worldPos.setFromMatrixPosition(spawnerEl.object3D.matrixWorld);

    return worldPos;
  },

  getInitialBulletRotation: function(spawnerEl) {
    var worldDirection = new THREE.Vector3();

    spawnerEl.object3D.getWorldDirection(worldDirection);
    worldDirection.multiplyScalar(-1);
    this.vec3RadToDeg(worldDirection);

    return worldDirection;
  },

  vec3RadToDeg: function(rad) {
    rad.set(THREE.Math.radToDeg(rad.x), THREE.Math.radToDeg(rad.y), THREE.Math.radToDeg(rad.z));
  }
});