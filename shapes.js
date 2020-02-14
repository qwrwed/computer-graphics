
const g_Colors = {
  chairLegColor: [0.6, 0.6, 0.6],
  chairSeatColor: [0.95, 0.9, 0.95],
  chairBackColor: [0.95, 0.9, 0.95],
  tableLegColor: [0.5, 0.5, 0.5],
  tableTopColor: [0.85, 0.8, 0.85],
  tvScreenColor: [0.0, 0.0, 0.0],
  tvBorderColor: [0.3, 0.3, 0.3],
  cabinetMainColor: [0.75, 0.5, 0],
  cabinetHandleColor: [0.5, 0.5, 0.5],
  reclinerSeatColor: [0.5, 0.7, 0.6]
}

// how many sides each prism should have, by default
var g_Sides = [32]

function createCabinet(args) {
  var cabinetGroupArray = []

  // define defaults
  const defaults = {
    imageSrc: undefined,
  }
  var { imageSrc } = Object.assign({}, defaults, args)

  // one frame side
  var side = new sceneNode({ name: 'cabinetBorderSide', color: g_Colors.cabinetMainColor, textureMode: 'repeat', imageSrc: imageSrc })
  side.scale(1, 1, 0.05)
  side.rotate(180, 0, 1, 0)
  // all four frame sides (top, bottom, left, right)
  var border = createBorder({ model: side, n: 4, r: 0.5 })
  border.translate(0, 0.005, 0)
  border.scale(1 / 1.05, 1, 1 / 1.05)
  cabinetGroupArray.push(border)

  // fifth frame side (rear)
  var back = new sceneNode({ name: 'cabinetBack', color: g_Colors.cabinetMainColor, textureMode: 'repeat', imageSrc: imageSrc })
  back.scale(1, 0.1, 1)
  back.translate(0, -0.5, 0)
  cabinetGroupArray.push(back)

  // inner shelf
  var shelf = new sceneNode({ name: 'cabinetShelf', color: g_Colors.cabinetMainColor, textureMode: 'repeat', imageSrc: imageSrc })
  shelf.scale(0.9, 0.95, 0.05)
  cabinetGroupArray.push(shelf)

  // one bevel for the door
  var cabinetDoorBorderEdge = createQuarterPrism({ name: 'cabinetDoorBorderEdge', color: g_Colors.cabinetMainColor, textureMode: 'repeat', imageSrc: imageSrc })
  cabinetDoorBorderEdge.scale(1, 1, 0.05)
  cabinetDoorBorderEdge.rotate(180, 0, 1, 0)

  // all four bevels for the door
  var cabinetDoorBorder = createBorder({ name: 'cabinetDoorBorder', model: cabinetDoorBorderEdge, textureMode: 'repeat', imageSrc: imageSrc })
  cabinetDoorBorder.scale(1 / 1.05, 1, 1 / 1.05)
  cabinetDoorBorder.translate(0, 0.5, 0)

  // door handle
  var cabinetDoorHandle = new sceneNode({ name: 'cabinetDoorHandle', color: g_Colors.cabinetHandleColor, sides: 4, offset: true, textureMode: 'stretch', imageSrc: './resources/metal.png' })
  cabinetDoorHandle.scale(0.1, 2, 0.1)
  cabinetDoorHandle.translate(0.25, 1, 0)

  // the door itself
  var cabinetDoor = new sceneNode({ color: g_Colors.cabinetMainColor, name: 'cabinetDoor', textureMode: 'repeat', imageSrc: imageSrc })
  
  // full door aseembly
  var cabinetDoorNode = new sceneNode({ name: 'cabinetDoorNode', noModel: true, children: { cabinetDoor, cabinetDoorBorder, cabinetDoorHandle } })

  // transform the door and set rotation origin\
  cabinetDoorNode.opts.origin = [-0.5, 0, 0]
  cabinetDoorNode.scale(0.5, 0.05, 1)
  cabinetDoorNode.translate(0, 0.5, 0)
  cabinetDoorNode.translate(0, 0.025, 0)
  cabinetDoorNode.opts.origin = [-0.5, -0.025, 0]

  // create parent nodes so that transformations to one door will apply to both
  var doorLeft = new sceneNode({ noModel: true, children: { cabinetDoorNode }, name: 'cabinetDoorLeft' })
  var doorRight = new sceneNode({ noModel: true, children: { cabinetDoorNode }, name: 'cabinetDoorRight' })
  doorRight.rotate(180, 0, 1, 0)
  cabinetGroupArray.push(doorLeft, doorRight)

  // full cabinet assembly
  var cabinetNode = new sceneNode({ noModel: true, name: 'cabinetNode' })
  cabinetGroupArray.forEach((e, i) => { cabinetNode.children[e.opts.name] = e })
  cabinetNode.rotate(90, 1, 0, 0)

  return cabinetNode
}

function createClock( args ) {

  // define defaults
  const defaults = {
    imageSrc: undefined,
  }
  var { imageSrc } = Object.assign({}, defaults, args)
  
  // full clock assembly
  var clockNode = new sceneNode({
    noModel: true,
    name: 'clockNode'
  })

  // holds all children of main clock node
  var clockGroupArray = []

  // flat border (outer disc)
  var clockFaceBorder = new sceneNode({
    sides: g_Sides,
    name: 'clockFaceBorder',
    color: [0.5, 0.5, 0.5]
  })
  clockFaceBorder.scale(1.1, 0.099, 1.1)
  clockGroupArray.push(clockFaceBorder)

  // beveled border (massive performance drop, so not actually pushed to node)
  var clockBorderPart = createQuarterPrism({ color: [0.5, 0.5, 0.5] })
  clockBorderPart.scale(1, 0.2, 0.2)
  clockBorderPart.rotate(180, 0, 1, 0)
  var clockBorder = createBorder({ model: clockBorderPart, n: g_Sides, unitCircleIs: 'inside', lMult: 1 })
  //clockGroupArray.push(clockBorder)
  
  // flat face (inner disc)
  var clockFace = new sceneNode({
    sides: g_Sides,
    name: 'clockFace',
    color: [1, 1, 1],
    imageSrc: imageSrc,
    textureMode: 'repeat'
  })
  clockFace.scale(1, 0.1, 1)
  clockGroupArray.push(clockFace)

  var clockHourHand = new sceneNode({
    sides: 4,
    color: [0.5, 0.5, 0.5],
    name: 'clockHourHand'
  })
  clockHourHand.opts.origin = [0, 0, 0.5]
  clockHourHand.translate(0, 0.05, -0.5)
  clockHourHand.scale(0.04, 0.04, 0.4)
  clockGroupArray.push(clockHourHand)

  var clockMinuteHand = new sceneNode({
    sides: 4,
    color: [0.5, 0.5, 0.5],
    name: 'clockMinuteHand'
  })
  clockMinuteHand.opts.origin = [0, 0, 0.5]
  clockMinuteHand.translate(0, 0.05, -0.5)
  clockMinuteHand.scale(0.03, 0.03, 0.6)
  clockGroupArray.push(clockMinuteHand)

  var clockSecondHand = new sceneNode({
    sides: 4,
    color: [1, 0, 0],
    name: 'clockSecondHand'
  })
  clockSecondHand.opts.origin = [0.0, 0, 0.5]
  clockSecondHand.translate(0, 0.05, -0.5)
  clockSecondHand.scale(0.02, 0.02, 0.65)
  clockGroupArray.push(clockSecondHand)

  clockGroupArray.forEach((e, i) => { clockNode.children[e.opts.name] = e })
  clockNode.rotate(90, 1, 0, 0)

  return clockNode
}

function createTable(args) {

  // define defaults
  const defaults = {
    sides: g_Sides,
    name: 'table'
  }

  var { sides, name } = Object.assign({}, defaults, args)

  var leg = new sceneNode({ sides: sides, color: g_Colors.tableLegColor, name: `${name}_tableLeg`, fitInCircle: true, offset: true })
  leg.scale(0.05, 0.8, 0.05)
  leg.translate(0, 0.4, 0)
  const squareRadius = 2 ** -0.5 // distance from centre to corner of 1x1 square
  var legs = createRadialRepetition(leg, { r: squareRadius * 1 - Math.sqrt(2 * 0.025 ** 2), n: 4, offset: true })

  var tableTop = new sceneNode({ sides: sides, color: g_Colors.tableTopColor, name: `${name}_tableTop`, offset: true })
  tableTop.scale(1.5, 0.05, 1.5)
  tableTop.translate(0, 0.825, 0)

  var tableNode = new sceneNode({ noModel: true, name: name, children: { legs, tableTop } })
  return tableNode

}


function createLight(args) {

  var lightGroupArray = []
  // define defaults
  const defaults = {
    sides: g_Sides,
    name: 'light'
  }
    
  const wireLength = 0.4
  var wireSegmentModel = new sceneNode({color: [0.3, 0.3, 0.3], sides: 8})
  wireSegmentModel.translate(0, -wireLength/2, 0)
  wireSegmentModel.scale(0.01, wireLength, 0.01)
  var light = new sceneNode({origin: [0, -0, 0], color: [1,1,1], name: 'light', sides: 16, offset: true, isLightSource: true})
  var wireSegment4 = new sceneNode({origin: [0, -0, 0], noModel: true, children: {wireSegmentModel, light}, name: 'wireSegment4'})
  var wireSegment3 = new sceneNode({origin: [0, -0, 0], noModel: true, children: {wireSegmentModel, wireSegment4}, name: 'wireSegment3'})
  var wireSegment2 = new sceneNode({origin: [0, -0, 0], noModel: true, children: {wireSegmentModel, wireSegment3}, name: 'wireSegment2'})
  var wireSegment1 = new sceneNode({origin: [0, -0, 0], noModel: true, children: {wireSegmentModel, wireSegment2}, name: 'wireSegment1'})

  light.translate(0, -wireLength, 0)
  light.scale(0.2, wireLength, 0.2)


  wireSegment1.translate(0, -0, 0)
  wireSegment2.translate(0, -wireLength, 0)
  wireSegment3.translate(0, -wireLength, 0)
  wireSegment4.translate(0, -wireLength, 0)
  
  lightGroupArray.push(wireSegment1)


  var lightNode = new sceneNode({ noModel: true, name: 'lightNode' })
  lightGroupArray.forEach((e, i) => { lightNode.children[e.opts.name] = e })

  return lightNode  

}

function createRecliner(args) {

  var reclinerGroupArray = []

  // var rightLeg = new sceneNode({sides: 4, color: g_Colors.reclinerColor})
  var rightArm = createHalfPrism({ sides: g_Sides, name: 'reclinerRightArm', color: g_Colors.reclinerSeatColor })
  rightArm.rotate(-90, 1, 0, 0)
  rightArm.scale(0.125, 0.5, 0.05)
  rightArm.translate(-0.315, 0.8, 0)
  reclinerGroupArray.push(rightArm)

  var rightLeg = new sceneNode({ name: 'reclinerRightLeg', color: g_Colors.reclinerSeatColor })
  rightLeg.rotate(-90, 1, 0, 0)
  rightLeg.scale(0.125, 0.5, 0.8)
  rightLeg.translate(-0.315, 0.4, 0)
  reclinerGroupArray.push(rightLeg)

  var leftArm = createHalfPrism({ sides: g_Sides, name: 'reclinerLeftArm', color: g_Colors.reclinerSeatColor })
  leftArm.rotate(-90, 1, 0, 0)
  leftArm.scale(0.125, 0.5, 0.05)
  leftArm.translate(0.315, 0.8, 0)
  reclinerGroupArray.push(leftArm)

  var leftLeg = new sceneNode({ name: 'reclinerLeftLeg', color: g_Colors.reclinerSeatColor })
  leftLeg.rotate(-90, 1, 0, 0)
  leftLeg.scale(0.125, 0.5, 0.8)
  leftLeg.translate(0.315, 0.4, 0)
  reclinerGroupArray.push(leftLeg)

  var reclinerSeatBase = createHalfPrism({ sides: g_Sides, color: g_Colors.reclinerSeatColor, name: 'reclinerSeatBase' })
  reclinerSeatBase.rotate(-90, 1, 0, 0)
  // seatBase.rotate(90, 0, 0, 1)
  reclinerSeatBase.scale(0.5, 0.5, 0.05)
  reclinerSeatBase.translate(0, 0.525, 0)

  var reclinerHead = createHalfPrism({ sides: g_Sides, color: g_Colors.reclinerSeatColor, name: 'reclinerHead' })
  reclinerHead.scale(0.5, 0.5, 0.1)
  reclinerHead.opts.origin = [0, -0.25, 0]
  reclinerHead.scale(1, 1.5, 1)
  reclinerHead.translate(0, 0.75, -0.2)

  var reclinerFoot = createHalfPrism({ sides: g_Sides, color: g_Colors.reclinerSeatColor, name: 'reclinerFoot' })
  reclinerFoot.scale(0.5, 0.5, 0.05)
  reclinerFoot.opts.origin = [0, 0.25, 0]
  reclinerFoot.translate(0, 0.25, 0.25)

  var reclinerBack = new sceneNode({ color: g_Colors.reclinerSeatColor })
  reclinerBack.scale(0.5, 0.5, 0.5)
  reclinerBack.translate(0, 0.25, 0)

  reclinerGroupArray.push(reclinerSeatBase, reclinerHead, reclinerFoot, reclinerBack)

  var reclinerNode = new sceneNode({ noModel: true, name: 'reclinerNode' })
  reclinerGroupArray.forEach((e, i) => { reclinerNode.children[e.opts.name] = e })

  return reclinerNode

}

function createTV(args) {

  var borderEdge = createQuarterPrism({ color: [0.3, 0.3, 0.3] })
  borderEdge.scale(1, 0.01, 0.05)
  borderEdge.rotate(180, 0, 1, 0)
  var border = createBorder({ model: borderEdge, n: 4, r: 0.5 })
  border.translate(0, 0.005, 0)
  border.scale(1 / 1.05, 1, 1 / 1.05)
  var back = createHalfPrism({ sides: g_Sides, color: [0.3, 0.3, 0.3] })
  back.scale(1, 1, 0.04)
  back.rotate(90, 1, 0, 0)
  back.translate(0, -0.02, 0)

  const screen = new sceneNode({ color: [0, 0, 0] })
  screen.scale(0.99, 0.001, 0.99)

  var stand = new sceneNode({ sides: g_Sides, offset: true, color: [0.3, 0.3, 0.3] })
  stand.scale(0.05, 1, 0.05)
  stand.translate(0, -0.04, 0.05)
  stand.rotate(90, 1, 0, 0)

  var base = new sceneNode({ sides: 6, color: [0.3, 0.3, 0.3] })
  base.scale(0.3, 0.01, 0.2)
  base.rotate(90, 1, 0, 0)
  base.translate(0, -0.04, 0.55)
  var tvNode = new sceneNode({ noModel: true, children: { border, screen, back, stand, base } })

  tvNode.rotate(90, 1, 0, 0)
  tvNode.scale(16 / 9, 1, 1)
  tvNode.translate(0, 0.56, -0.04)

  return tvNode

}

function createChair(args) {

  // define defaults
  const defaults = {
    sides: g_Sides,
    name: 'chair'
  }

  var { sides, name } = Object.assign({}, defaults, args)

  var leg = new sceneNode({ sides: sides, color: g_Colors.chairLegColor, name: 'chairLeg', fitInCircle: true, offset: true })
  leg.scale(0.05, 0.5, 0.05)
  leg.translate(0, 0.25, 0)
  const squareRadius = 2 ** -0.5 // distance from centre to corner of 1x1 square
  var legs = createRadialRepetition(leg, { r: squareRadius * 0.5 - Math.sqrt(2 * 0.025 ** 2), n: 4, offset: false })

  var seatBase = createQuarterPrism({ sides: sides, color: g_Colors.chairSeatColor })
  seatBase.scale(0.5, 0.05, 0.5)
  seatBase.translate(0, 0.525, 0)

  var seatBack = createHalfPrism({ sides: sides, color: g_Colors.chairBackColor })
  seatBack.scale(0.6, 0.5, 0.1)
  seatBack.translate(0, 0.85, -0.2)
  seatBack.rotate(90, 0, 0, 1)

  var chairNode = new sceneNode({ noModel: true, name: name, children: { legs, seatBase, seatBack } })
  return chairNode

}

function createBorder(args) {
  const defaults = {
    n: 4,
    r: 0.5,
    lMult: 0.0475,
    model: createQuarterPrism(),
    offset: true,
    unitCircleIs: 'on',
    imageSrc: undefined,
    name: 'Border'
  }

  const unitCircleDict = { inside: 1, on: Math.sqrt(2), outside: 2 }
  var opts = Object.assign({}, defaults, args)

  var l = opts.r * Math.sqrt(2 - 2 * Math.cos(2 * Math.PI / opts.n)) // http://mathcentral.uregina.ca/QQ/database/QQ.09.06/s/dj1.html
  l *= unitCircleDict[opts.unitCircleIs]
  l *= (opts.lMult + 1)
  opts.model.scale(l, 1, 1)
  var border = createRadialRepetition(opts.model, { n: opts.n, r: opts.r, unitCircleIs: opts.unitCircleIs, offset: opts.offset, name: opts.name })
  return border
}
function createRadialRepetition(model, args) {
  // define defaults
  const defaults = {
    n: 4,
    r: 0.5,
    m: Infinity,
    offset: false,
    axis: [0, 1, 0],
    unitCircleIs: 'on',
    name: 'Radial Repetition'
  }

  var opts = Object.assign({}, defaults, args)
  var radius

  if (opts.unitCircleIs === 'on') {
    // furthest points are r meters from center
    // i.e. all origins are on the r-radius circle
    radius = opts.r
  } else if (opts.unitCircleIs === 'inside') {
    // closest points are r metres from center
    // i.e. midpoints between all origins are on the r-radius circle
    radius = opts.r * Math.sqrt(2)
  } else if (opts.unitCircleIs === 'outside') {
    // tangent interception points are r metres from centre
    // useful for e.g. borders; model origin is centre of border, interception points are border corners
    // all border corners are on the r-radius circle
    radius = opts.r / 2 ** (2 ** -(opts.n - 3))
  }

  const angle = 360 / opts.n
  model.translate(0, 0, radius)
  var repeated = new sceneNode({ noModel: true, name: `${model.opts.name}_rep_${opts.n}` })
  for (var i = 0; i < Math.min(opts.n, opts.m); i++) {
    repeated.children[`${model.opts.name}_${i + 1}`] = new sceneNode({ noModel: true, children: { model }, name: `${model.opts.name}_${i + 1}` })
    repeated.children[`${model.opts.name}_${i + 1}`].rotate(angle * (i + !opts.offset / 2), opts.axis[0], opts.axis[1], opts.axis[2])
  }
  return repeated
}

// functions for composited primitives:
function createHalfPrism(args) {

  // define defaults
  const defaults = {
    sides: 4,
    color: [0, 1, 0],
    name: 'Half Prism',
    imageSrc: undefined
  }

  var opts = Object.assign({}, defaults, args)
  var half = new sceneNode({ color: opts.color, name: `${opts.name}: half-cube`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var prism = new sceneNode({ color: opts.color, sides: opts.sides, fitInCircle: true, offset: true, name: `${opts.name}: prism`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  // halfPrism = new sceneNode({noModel: true, children: [half, prism]})
  var halfPrism = new sceneNode({ noModel: true, children: { half, prism }, name: opts.name })
  half.opts.origin = [0, 0, -0.5]
  half.scale(1, 1, 0.5)
  prism.rotate(90, 0, 0, 1)
  return halfPrism

}

function createQuarterPrism(args) {

  // define defaults
  const defaults = {
    sides: 4,
    color: [0, 1, 0],
    name: 'Quarter Prism',
    imageSrc: undefined
  }

  var opts = Object.assign({}, defaults, args)
  var half = new sceneNode({ color: opts.color, name: `${opts.name}: half-cube`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var quarter = new sceneNode({ color: opts.color, name: `${opts.name}: quarter-cube`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var prism = new sceneNode({ color: opts.color, sides: opts.sides, fitInCircle: true, offset: true, name: `${opts.name}: prism`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var quarterPrism = new sceneNode({ noModel: true, children: { half, prism, quarter } })

  quarter.opts.origin = [0, 0.5, -0.5]
  quarter.scale(1, 0.5, 0.5)
  half.opts.origin = [0, -0.5, 0]
  half.scale(1, 0.5, 1)
  prism.rotate(90, 0, 0, 1)
  return quarterPrism

}

function createCornerPrism(args) {

  // define defaults
  const defaults = {
    sides: 4,
    color: [0, 1, 0],
    name: 'Corner Prism',
    imageSrc: undefined
  }

  var opts = Object.assign({}, defaults, args)
  var half = new sceneNode({ color: opts.color, name: `${opts.name}: half-cube`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var quarter1 = new sceneNode({ color: opts.color, name: `${opts.name}: quarter-cube 1`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var quarter2 = new sceneNode({ color: opts.color, name: `${opts.name}: quarter-cube 1`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var prism1 = new sceneNode({ color: opts.color, sides: opts.sides, fitInCircle: true, offset: true, name: `${opts.name}: prism 1`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var prism2 = new sceneNode({ color: opts.color, sides: opts.sides, fitInCircle: true, offset: true, name: `${opts.name}: prism 2`, textureMode: 'repeat', imageSrc: opts.imageSrc })
  var cornerPrism = new sceneNode({ noModel: true, children: { quarter1, quarter2, half, prism1, prism2 } })

  half.opts.origin = [0, -0.5, 0]
  half.scale(1, 0.5, 1)
  quarter1.opts.origin = [0, 0.5, -0.5]
  quarter1.scale(1, 0.5, 0.5)
  quarter2.opts.origin = [-0.5, 0.5, 0]
  quarter2.scale(0.5, 0.5, 1)
  prism2.rotate(90, 0, 0, 1)

  return cornerPrism

}
