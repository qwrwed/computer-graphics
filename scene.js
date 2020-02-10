// Manual definition of objects (push each child of the root node to objectsArray)
function defineObjects() {
  var objectsArray = []


  //cabinet
  var cabinetNode = createCabinet()
  //cabinetNode.scale(1.4, 0.7, 0.7)
  cabinetNode.scale(1, 0.85, 0.85)
  cabinetNode.translate(0, 0.5 * 0.85, 0)
  //objectsArray.push(cabinetNode)

  //tv
  var tvNode = createTV()
  tvNode.translate(0, 0.845, 0)
  //objectsArray.push(tvNode)
  var tvAndCabinetNode = new Node({ noModel: true, children: { cabinetNode, tvNode }, name: 'tvAndCabinetNode' })
  tvAndCabinetNode.translate(-1, 0, -1)
  objectsArray.push(tvAndCabinetNode)

  //clock
  var clockNode = createClock()
  clockNode.scale(0.5 / 1, 0.5 / 0.05, 0.5)
  clockNode.rotate(180, 1, 0, 0)
  clockNode.translate(0, 0, -1)
  //objectsArray.push(clockNode)
  cabinetNode.children.cabinetShelf.children.clockNode = clockNode

  // table and chairs
  var chairNode = createChair()
  chairNode.rotate(180, 0, 1, 0)
  var chairsNode = createRadialRepetition(chairNode, { n: 4, r: 1 })
  var tableNode = createTable()
  var tablesAndChairsNode = new Node({ noModel: true, children: { tableNode, chairsNode }, name: 'tablesAndChairsNode' })
  objectsArray.push(tablesAndChairsNode)
  tablesAndChairsNode.translate(1, 0, 0)

  //recliner
  var recliner = createRecliner()
  var reclinerNode1 = new Node({ noModel: true, children: { recliner }, name: 'reclinerNode1' })
  var reclinerNode2 = new Node({ noModel: true, children: { recliner }, name: 'reclinerNode2' })
  reclinerNode1.translate(0.5, 0, 0)
  reclinerNode2.translate(-0.5, 0, 0)
  var reclinersNode = new Node({ noModel: true, children: { reclinerNode1, reclinerNode2 }, name: 'reclinersNode' })
  reclinersNode.translate(-1, 0, 1)
  reclinersNode.rotate(180, 0, 1, 0)
  objectsArray.push(reclinersNode)


  //floor
  var floor = new Node({ color: [0.5, 0.5, 0.7] })
  floor.scale(10, 0.001, 10)
  objectsArray.push(floor)

  //ceiling
  var ceiling = new Node({ color: [0.5, 0.5, 0.7] })
  ceiling.translate(0,3,0)
  ceiling.scale(10, 0.001, 10)
  objectsArray.push(ceiling)

  var wall = new Node({ color: [0.5, 0.5, 0.7] })
  wall.scale(10, 3, 0.001)
  wall.translate(0, 1.5, -5)
  walls = createRadialRepetition(wall, {n:4, r:0, offset: true})
  objectsArray.push(walls)

  var objects = {}
  objectsArray.forEach((e, i) => { objects[e.opts.name] = e })
  return objects
}

var then = 0
var cabinetDoorAngle = 0
var cabinetShelfDisplacement = 0
var reclinerAngle = 0
// Draw the scene repeatedly
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  if (keysPressed.has('KeyV')) {
    g_hAngle = cameraDefaults.g_hAngle;
    g_vAngle = cameraDefaults.g_vAngle;
    g_Pos = cameraDefaults.g_Pos;
  }

  if (keysPressed.has('ShiftLeft')) {
    if (keysPressed.has('Digit1')) {
      root.children.tvAndCabinetNode.opts.hidden = false
    }
    if (keysPressed.has('Digit2')) {
      root.children.reclinersNode.opts.hidden = false
    }
    if (keysPressed.has('Digit3')) {
      root.children.tablesAndChairsNode.opts.hidden = false
    }
  } else {
    if (keysPressed.has('Digit1')) {
      root.children.tvAndCabinetNode.opts.hidden = true
    }
    if (keysPressed.has('Digit2')) {
      root.children.reclinersNode.opts.hidden = true
    }
    if (keysPressed.has('Digit3')) {
      root.children.tablesAndChairsNode.opts.hidden = true
    }
  }



  if (root.children.tvAndCabinetNode) {
    var cabinetNode = root.children.tvAndCabinetNode.children.cabinetNode
    var clockNode = cabinetNode.children.cabinetShelf.children.clockNode
  } else if (root.children.cabinetNode) {
    var cabinetNode = root.children.cabinetNode
    var clockNode = cabinetNode.children.cabinetShelf.children.clockNode
  }
  //var clockNode = root.children.clockNode


  if (clockNode) {
    var date = new Date
    var secondHand = clockNode.children.clockSecondHand
    secondHand.setRotate((date.getSeconds() / 60) * 360, 0, -1, 0)
    var minuteHand = clockNode.children.clockMinuteHand
    minuteHand.setRotate((date.getMinutes() / 60) * 360, 0, -1, 0)
    var minuteHand = clockNode.children.clockHourHand
    minuteHand.setRotate((date.getHours() / 12) * 360, 0, -1, 0)
  }

  //console.log(root.children)
  if (root.children.reclinersNode) {
    var reclinerNode = root.children.reclinersNode.children.reclinerNode1.children.recliner
    const rotationSpeed = 90 / 1.5
    if (keysPressed.has('KeyF')) {
      reclinerAngle -= rotationSpeed * deltaTime
      reclinerAngle = Math.max(reclinerAngle, -45)
      reclinerNode.children.reclinerHead.setRotate(reclinerAngle, 1, 0, 0)
      reclinerNode.children.reclinerFoot.setRotate(reclinerAngle, 1, 0, 0)
    }
    if (keysPressed.has('KeyG')) {
      reclinerAngle += rotationSpeed * deltaTime
      reclinerAngle = Math.min(reclinerAngle, 0)
      reclinerNode.children.reclinerHead.setRotate(reclinerAngle, 1, 0, 0)
      reclinerNode.children.reclinerFoot.setRotate(reclinerAngle, 1, 0, 0)
    }
  }

  if (cabinetNode) {
    var door = cabinetNode.children.cabinetDoorLeft.children.cabinetDoorNode
    var shelf = cabinetNode.children.cabinetShelf
    const rotationSpeeed = 90 / 1.5 //degrees per second
    const translationSpeed = 0.2 / 1.5 // m/s
    if (keysPressed.has('KeyR')) {
      cabinetDoorAngle += rotationSpeeed * deltaTime
      cabinetDoorAngle = Math.min(cabinetDoorAngle, 180)
      door.setRotate(cabinetDoorAngle, 0, 0, 1)
      cabinetShelfDisplacement += translationSpeed * deltaTime
      cabinetShelfDisplacement = Math.min(cabinetShelfDisplacement, 0.4)
      shelf.setTranslate(0, cabinetShelfDisplacement, 0)
    }
    if (keysPressed.has('KeyT')) {
      cabinetDoorAngle -= rotationSpeeed * deltaTime
      cabinetDoorAngle = Math.max(cabinetDoorAngle, 0)
      door.setRotate(cabinetDoorAngle, 0, 0, 1)
      cabinetShelfDisplacement -= translationSpeed * deltaTime
      cabinetShelfDisplacement = Math.max(cabinetShelfDisplacement, 0)
      shelf.setTranslate(0, cabinetShelfDisplacement, 0)
    }
  }

  refreshView(deltaTime)
  root.draw()

  requestAnimationFrame(render);
}

//set view matrix according to current position and camera angle
function refreshView(deltaTime) {
  const cameraTranslationSpeed = 1.2 // meters per second
  const cameraRotationSpeed = 0.5 // degrees per second

  if (keysPressed.has('ArrowUp')) {
    g_vAngle = Math.min((g_vAngle + cameraRotationSpeed * deltaTime), Math.PI / 2)
  }
  if (keysPressed.has('ArrowDown')) {
    g_vAngle = Math.max((g_vAngle - cameraRotationSpeed * deltaTime), -Math.PI / 2)
  }
  if (keysPressed.has('ArrowRight')) {
    g_hAngle = (g_hAngle + cameraRotationSpeed * deltaTime)
  }
  if (keysPressed.has('ArrowLeft')) {
    g_hAngle = (g_hAngle - cameraRotationSpeed * deltaTime)
  }

  const at = [Math.sin(g_hAngle), Math.sin(g_vAngle), -Math.cos(g_hAngle) * Math.cos(g_vAngle)]

  if (keysPressed.has('KeyW')) {
    glMatrix.vec3.add(g_Pos, g_Pos, at.map(e => e * cameraTranslationSpeed * deltaTime))
  }
  if (keysPressed.has('KeyS')) {
    glMatrix.vec3.sub(g_Pos, g_Pos, at.map(e => e * cameraTranslationSpeed * deltaTime))
  }
  if (keysPressed.has('KeyA')) {
    glMatrix.vec3.sub(g_Pos, g_Pos, [-at[2], at[1], at[0]].map(e => e * cameraTranslationSpeed * deltaTime))
  }
  if (keysPressed.has('KeyD')) {
    glMatrix.vec3.add(g_Pos, g_Pos, [-at[2], at[1], at[0]].map(e => e * cameraTranslationSpeed * deltaTime))
  }

  if (keysPressed.has('KeyQ')) {
    glMatrix.vec3.add(g_Pos, g_Pos, [0, 1, 0].map(e => e * cameraTranslationSpeed * deltaTime))
  }

  if (keysPressed.has('KeyE')) {
    glMatrix.vec3.sub(g_Pos, g_Pos, [0, 1, 0].map(e => e * cameraTranslationSpeed * deltaTime))
  }

  const eyePos = g_Pos
  const eyeTargetRelative = [Math.sin(g_hAngle), Math.sin(g_vAngle), -Math.cos(g_hAngle) * Math.cos(g_vAngle)]
  var eyeTargetAbsolute = []
  glMatrix.vec3.add(eyeTargetAbsolute, eyePos, eyeTargetRelative)
  const upVector = [0, 1, 0]
  viewMatrix.setLookAt(...eyePos, ...eyeTargetAbsolute, ...upVector)
  gl.uniformMatrix4fv(uniforms.ViewMatrix, false, viewMatrix.elements)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}