// Manual definition of objects (push each child of the root node to objectsArray)
function defineObjects() {
  var objectsArray = []

  
  //cabinet
  var cabinetNode = createCabinet()
  //cabinetNode.scale(1.4, 0.7, 0.7)
  cabinetNode.scale(1, 0.85, 0.85)
  cabinetNode.translate(0, 0.5*0.85, 0)
  //objectsArray.push(cabinetNode)

  //tv
  var tvNode = createTV()
  tvNode.translate(0, 0.845, 0)
  //objectsArray.push(tvNode)
  var tvAndCabinetNode = new Node ({noModel: true, children: {cabinetNode, tvNode}, name: 'tvAndCabinetNode'})
  tvAndCabinetNode.translate(-1, 0, -2)
  //objectsArray.push(tvAndCabinetNode)
  
  //clock
  var clockNode = createClock()
  clockNode.scale(0.5/1, 0.5/0.05, 0.5)
  clockNode.rotate(180, 1, 0, 0)
  clockNode.translate(0, 0, -1)
  //objectsArray.push(clockNode)
  cabinetNode.children.cabinetShelf.children.clockNode = clockNode

  // table and chairs
  var chairNode = createChair()
  chairNode.rotate(180, 0, 1, 0)
  var chairsNode = createRadialRepetition(chairNode, {n : 4, r: 1 })
  var tableNode = createTable()
  var tablesAndChairsNode = new Node({ noModel: true, children: { tableNode, chairsNode } })
  //objectsArray.push(tablesAndChairsNode)
  tablesAndChairsNode.translate(1, 0, 0)

  //recliner
  var reclinerNode = createRecliner()
  objectsArray.push(reclinerNode)

  

  //floor
  var floor = new Node({ color: [0.5, 0.5, 0.7] })
  floor.scale(10, 0.001, 10)
  //objectsArray.push(floor)

  var objects = {}
  objectsArray.forEach((e, i) => { objects[e.opts.name] = e })
  return objects
}

//var rotationSpeeed = 360 //degrees per second
var then = 0
var cabinetDoorAngle = 0
var cabinetShelfDisplacement = 0
var reclinerAngle = 0
// Draw the scene repeatedly
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;
  
  refreshView(deltaTime)
  
  if (root.children.tvAndCabinetNode) {
    var cabinetNode = root.children.tvAndCabinetNode.children.cabinetNode
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

  const rotationSpeed = 90
  if (keysPressed.has('g')) {
    reclinerAngle += rotationSpeed*deltaTime
    root.children.reclinerNode.children.reclinerHead.setRotate(reclinerAngle, 0, 1, 0)
    //root.children.reclinerNode.children.reclinerHead.setRotate(90, 0, 0, 1)
    //root.children.reclinerNode.children.reclinerHead.rotate(reclinerAngle, 0, 1, 0)
  }

  
  if (cabinetNode) {
    var door = cabinetNode.children.cabinetDoorLeft.children.cabinetDoorNode
    var shelf = cabinetNode.children.cabinetShelf
    const rotationSpeeed = 90 //degrees per second
    const translationSpeed = 0.2 // m/s
    if (keysPressed.has('r')) {
      cabinetDoorAngle += rotationSpeeed*deltaTime
      cabinetDoorAngle = Math.min(cabinetDoorAngle, 180)
      door.setRotate(cabinetDoorAngle, 0, 0, 1)
      cabinetShelfDisplacement += translationSpeed*deltaTime
      cabinetShelfDisplacement = Math.min(cabinetShelfDisplacement, 0.4)
      shelf.setTranslate(0, cabinetShelfDisplacement, 0)
    }
    if (keysPressed.has('t')) {
      cabinetDoorAngle -= rotationSpeeed*deltaTime
      cabinetDoorAngle = Math.max(cabinetDoorAngle, 0)
      door.setRotate(cabinetDoorAngle, 0, 0, 1)
      cabinetShelfDisplacement -= translationSpeed*deltaTime
      cabinetShelfDisplacement = Math.max(cabinetShelfDisplacement, 0)
      shelf.setTranslate(0, cabinetShelfDisplacement, 0)
    }
  }
  //if root.children.cabinet
  //if (keysPressed.has('r')) {
  //}

  root.draw()

  requestAnimationFrame(render);
}