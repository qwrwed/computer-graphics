// Manual definition of objects (push each child of the root node to objectsArray)
function defineObjects() {
  var objectsArray = []

  //clock
  var clockNode = createClock()
  clockNode.translate(0.5, 0.83+0.25, 0.05)
  clockNode.scale(0.3)
  clockNode.rotate(-20, 1, 0, 0)
  objectsArray.push(clockNode)

  // table and chairs
  var chairNode = createChair()
  chairNode.rotate(180, 0, 1, 0)
  var chairsNode = createRadialRepetition(chairNode, {n : 4, r: 1 })
  var tableNode = createTable()
  var tablesAndChairsNode = new Node({ noModel: true, children: { tableNode, chairsNode } })
  objectsArray.push(tablesAndChairsNode)

  //tv
  var tvNode = createTV()
  tvNode.translate(0, 0.845, 0)
  objectsArray.push(tvNode)

  //floor
  var floor = new Node({ color: [0.5, 0.5, 0.7] })
  floor.scale(10, 0.001, 10)
  objectsArray.push(floor)

  var objects = {}
  objectsArray.forEach((e, i) => { objects[e.opts.name] = e })
  return objects
}

//var rotationSpeeed = 360 //degrees per second
var then = 0
// Draw the scene repeatedly
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;
  
  refreshView(deltaTime)

  if (root.children.clockNode) {
    var date = new Date
    var secondHand = root.children.clockNode.children.clockSecondHand
    secondHand.setRotate((date.getSeconds() / 60) * 360, 0, -1, 0)
    var minuteHand = root.children.clockNode.children.clockMinuteHand
    minuteHand.setRotate((date.getMinutes() / 60) * 360, 0, -1, 0)
    var minuteHand = root.children.clockNode.children.clockHourHand
    minuteHand.setRotate((date.getHours() / 12) * 360, 0, -1, 0)
    
  }

  root.draw()

  requestAnimationFrame(render);
}