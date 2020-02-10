
const g_Colors = {
  chairLegColor: [0.5, 0.5, 0.5],
  chairSeatColor: [0.9, 0.9, 0.9],
  tableLegColor: [0.5, 0.5, 0.5],
  tableTopColor: [0.9, 0.9, 0.9],
  tvScreenColor: [0.0, 0.0, 0.0],
  tvBorderColor: [0.3, 0.3, 0.3],
  cabinetMainColor: [0.75, 0.5, 0],
  cabinetHandleColor: [0.5, 0.5, 0.5],
  reclinerSeatColor: [0.6, 0.5, 0.7]
}

const g_Sides = 32

function createCabinet() {
  var cabinetGroupArray = []

  var side = new Node({name: 'cabinetBorderSide', color: g_Colors.cabinetMainColor})
  side.scale(1, 1, 0.05)
  side.rotate(180, 0, 1, 0)
  var border = createBorder({model:side, n: 4, r: 0.5})
  border.translate(0, 0.005, 0)
  border.scale(1/1.05, 1, 1/1.05)
  cabinetGroupArray.push(border)

  var back = new Node({name: 'cabinetBack', color: g_Colors.cabinetMainColor})
  back.scale(1, 0.1, 1)
  back.translate(0, -0.5, 0)
  cabinetGroupArray.push(back)

  var shelf = new Node({name: 'cabinetShelf', color: g_Colors.cabinetMainColor})
  shelf.scale(0.9, 0.95, 0.05)
  cabinetGroupArray.push(shelf)
  
  var cabinetDoorBorderEdge = createQuarterPrism({color: g_Colors.cabinetMainColor})
  cabinetDoorBorderEdge.scale(1, 1, 0.05)
  cabinetDoorBorderEdge.rotate(180, 0, 1, 0)
  var cabinetDoorBorder = createBorder({model: cabinetDoorBorderEdge})
  cabinetDoorBorder.scale(1/1.05, 1, 1/1.05)
  cabinetDoorBorder.translate(0,0.5,0)

  var cabinetDoorHandle = new Node({color: g_Colors.cabinetHandleColor, sides: 4, offset: true})
  cabinetDoorHandle.scale(0.1, 2, 0.1)
  cabinetDoorHandle.translate(0.25, 1, 0)

  var cabinetDoor = new Node({color: g_Colors.cabinetMainColor, name: 'cabinetDoor'})
  //cabinetDoor.translate(0.025, 0.4825, 0)
  //cabinetDoor.opts.origin = [-0.55, 0.1, 0]
  //cabinetDoor.translate(0.5,0,0)
  var cabinetDoorNode = new Node({noModel: true, children: {cabinetDoor, cabinetDoorBorder, cabinetDoorHandle}})
  
  //cabinetDoor.opts.origin = [-0.55, 0.1, 0]
  cabinetDoorNode.opts.origin = [-0.5, 0, 0]
  cabinetDoorNode.scale(0.5, 0.05, 1)
  cabinetDoorNode.translate(0,0.5,0)
  cabinetDoorNode.translate(0,0.025,0)
  cabinetDoorNode.opts.origin = [-0.5, -0.025, 0]

  var doorLeft = new Node({noModel: true, children: {cabinetDoorNode}, name: 'cabinetDoorLeft'})
  var doorRight = new Node({noModel: true, children: {cabinetDoorNode}, name: 'cabinetDoorRight'})
  doorRight.rotate(180, 0, 1, 0)

  //cabinetDoor.rotate(90, 0, 0, 1)

  cabinetGroupArray.push(doorLeft, doorRight)

  cabinetNode = new Node({noModel: true, name: 'cabinetNode'})
  cabinetGroupArray.forEach((e, i) => {cabinetNode.children[e.opts.name] = e})
  cabinetNode.rotate(90, 1, 0, 0)

  return cabinetNode
}

function createClock() {

  var clockGroupArray = []
  var clockNode = new Node({
    noModel: true,
    name: "clockNode"
  })

  var clockFaceBorder = new Node({
    sides: g_Sides,
    name: "clockFaceBorder",
    color: [0.5,0.5,0.5]
  })
  clockFaceBorder.scale(1.1, 0.099, 1.1)
  clockGroupArray.push(clockFaceBorder)

  var clockBorderPart = createQuarterPrism({color: [0.5, 0.5, 0.5]})
  clockBorderPart.scale(1, 0.2, 0.2)
  clockBorderPart.rotate(180, 0, 1, 0)
  var clockBorder = createBorder({model: clockBorderPart, n: 32, unitCircleIs: 'inside', lMult: 1})
  //clockGroupArray.push(clockBorder)

  var clockFace = new Node({
    sides: g_Sides,
    name: "clockFace",
    color: [1,1,1]
  })
  clockFace.scale(1, 0.1, 1)
  clockGroupArray.push(clockFace)

  var clockHourHand = new Node({
    sides: 4,
    color: [0.5,0.5,0.5],
    name: "clockHourHand"
  })
  clockHourHand.opts.origin = [0., 0, 0.5]
  clockHourHand.translate(0, 0.05, -0.5)  
  clockHourHand.scale(0.04, 0.04, 0.4)
  clockGroupArray.push(clockHourHand)

  var clockMinuteHand = new Node({
    sides: 4,
    color: [0.5,0.5,0.5],
    name: "clockMinuteHand"
  })
  clockMinuteHand.opts.origin = [0, 0, 0.5]
  clockMinuteHand.translate(0, 0.05, -0.5)  
  clockMinuteHand.scale(0.03, 0.03, 0.6)
  clockGroupArray.push(clockMinuteHand)

  var clockSecondHand = new Node({
    sides: 4,
    color: [1, 0, 0],
    name: "clockSecondHand"
  })
  clockSecondHand.opts.origin = [0.0, 0, 0.5]
  clockSecondHand.translate(0, 0.05, -0.5)  
  clockSecondHand.scale(0.02, 0.02, 0.65)
  clockGroupArray.push(clockSecondHand)
  
  clockGroupArray.forEach((e, i) => {clockNode.children[e.opts.name] = e})
  clockNode.rotate(90, 1, 0, 0)

  return clockNode
}

function createTable(args) {

  // define defaults
  const defaults = {
    sides: g_Sides,
    name: "table"
  }

  var {sides, name} = Object.assign({}, defaults, args);

  var leg = new Node({sides: sides, color: g_Colors.tableLegColor, name: `${name}_tableLeg`, fitInCircle: true, offset: true})
  leg.scale(0.05, 0.8, 0.05)
  leg.translate(0, 0.4, 0)
  const squareRadius = 2 ** -0.5 // distance from centre to corner of 1x1 square
  var legs = createRadialRepetition(leg, { r: squareRadius * 1 - Math.sqrt(2 * 0.025 ** 2), n: 4, offset: true })

  var tableTop = new Node({sides:sides, color: g_Colors.tableTopColor, name: `${name}_tableTop`, offset: true})
  tableTop.scale(1.5, 0.05, 1.5)
  tableTop.translate(0, 0.825, 0)


  var tableNode = new Node({noModel: true, name: name, children: {legs, tableTop}})
  return tableNode

}

function createRecliner(args) {

  var reclinerGroupArray = []

  var reclinerSeatBase = createHalfPrism({color: [1, 0, 0], sides: g_Sides})
  reclinerSeatBase.rotate(90, 1, 0, 1)
  reclinerSeatBase.scale(0.5, 0.5, 0.05)
  reclinerSeatBase.translate(0, 0.525, 0)
  var reclinerArms = createHalfPrism({color: [0, 0, 1]})
  //reclinerGroupArray.push(reclinerSeatBase, reclinerArms)

  //var rightLeg = new Node({sides: 4, color: g_Colors.reclinerColor})
  var rightArm = createHalfPrism({sides: g_Sides, name: 'reclinerRightArm', color: g_Colors.reclinerSeatColor})
  rightArm.rotate(-90, 1, 0, 0)
  rightArm.scale(0.125, 0.5, 0.05)
  rightArm.translate(-0.315, 0.8, 0)
  reclinerGroupArray.push(rightArm)

  var rightLeg = new Node({name: 'reclinerRightLeg', color: g_Colors.reclinerSeatColor})
  rightLeg.rotate(-90, 1, 0, 0)
  rightLeg.scale(0.125, 0.5, 0.8)
  rightLeg.translate(-0.315, 0.4, 0)
  reclinerGroupArray.push(rightLeg)

  var leftArm = createHalfPrism({sides: g_Sides, name: 'reclinerLeftArm', color: g_Colors.reclinerSeatColor})
  leftArm.rotate(-90, 1, 0, 0)
  leftArm.scale(0.125, 0.5, 0.05)
  leftArm.translate(0.315, 0.8, 0)
  reclinerGroupArray.push(leftArm)

  var leftLeg = new Node({name: 'reclinerLeftLeg', color: g_Colors.reclinerSeatColor})
  leftLeg.rotate(-90, 1, 0, 0)
  leftLeg.scale(0.125, 0.5, 0.8)
  leftLeg.translate(0.315, 0.4, 0)
  reclinerGroupArray.push(leftLeg)

  var reclinerSeatBase = createHalfPrism({sides: g_Sides, color: g_Colors.reclinerSeatColor, name: 'reclinerSeatBase'})
  reclinerSeatBase.rotate(-90, 1, 0, 0)
  //seatBase.rotate(90, 0, 0, 1)
  reclinerSeatBase.scale(0.5, 0.5, 0.05)
  reclinerSeatBase.translate(0, 0.525, 0)

  var reclinerHead = createHalfPrism({sides: g_Sides, color: g_Colors.reclinerSeatColor, name: 'reclinerHead'})
  reclinerHead.scale(0.5, 0.5, 0.1)
  reclinerHead.opts.origin = [0, -0.25, 0]
  reclinerHead.scale(1, 1.5, 1)
  reclinerHead.translate(0, 0.75, -0.25)

  var reclinerFoot = createHalfPrism({sides: g_Sides, color: g_Colors.reclinerSeatColor, name: 'reclinerFoot'})
  reclinerFoot.scale(0.5, 0.5, 0.05)
  reclinerFoot.opts.origin = [0, 0.25, 0]  
  reclinerFoot.translate(0, 0.25, 0.25)

  var reclinerBack = new Node({color: g_Colors.reclinerSeatColor})
  reclinerBack.scale(0.5, 0.5, 0.5)
  reclinerBack.translate(0, 0.25, 0)
  
  
  reclinerGroupArray.push(reclinerSeatBase, reclinerHead, reclinerFoot, reclinerBack)

  reclinerNode = new Node({noModel: true, name: 'reclinerNode'})
  reclinerGroupArray.forEach((e, i) => {reclinerNode.children[e.opts.name] = e})

  return reclinerNode

}

function createTV(args) {

  var borderEdge = createQuarterPrism({color: [0.3, 0.3, 0.3]})
  borderEdge.scale(1, 0.01, 0.05)
  borderEdge.rotate(180, 0, 1, 0)
  var border = createBorder({model:borderEdge, n: 4, r: 0.5})
  border.translate(0, 0.005, 0)
  border.scale(1/1.05, 1, 1/1.05)
  var back = createHalfPrism({sides: g_Sides, color: [0.3,0.3,0.3]})
  back.scale(1, 1, 0.04)
  back.rotate(90, 1, 0, 0)
  back.translate(0, -0.02, 0)

  const screen = new Node({color: [0, 0, 0]})
  screen.scale(0.99, 0.001, 0.99)

  stand = new Node ({sides: g_Sides, offset: true, color: [0.3, 0.3, 0.3]})
  stand.scale(0.05, 1, 0.05)
  stand.translate(0, -0.04, 0.05)
  stand.rotate(90, 1, 0, 0)

  base = new Node({sides: 6, color: [0.3, 0.3, 0.3]})
  base.scale(0.3, 0.01, 0.2)
  base.rotate(90, 1, 0, 0)
  base.translate(0, -0.04, 0.55)
  var tvNode = new Node ({noModel: true, children: {border, screen, back, stand, base}})
  

  tvNode.rotate(90, 1, 0, 0)
  tvNode.scale(16/9, 1, 1)
  tvNode.translate(0, 0.56, -0.04)

  return tvNode

}

function createChair(args) {

  // define defaults
  const defaults = {
    sides: g_Sides,
    name: "chair"
  }

  var {sides, name} = Object.assign({}, defaults, args);

  var leg = new Node({sides: sides, color: g_Colors.chairLegColor, name: "chairLeg", fitInCircle: true, offset: true})
  leg.scale(0.05, 0.5, 0.05)
  leg.translate(0, 0.25, 0)
  const squareRadius = 2 ** -0.5 // distance from centre to corner of 1x1 square
  var legs = createRadialRepetition(leg, { r: squareRadius * 0.5 - Math.sqrt(2 * 0.025 ** 2), n: 4, offset: false })

  var seatBase = createQuarterPrism({sides: sides, color: g_Colors.chairSeatColor})
  seatBase.scale(0.5, 0.05, 0.5)
  seatBase.translate(0, 0.525, 0)

  var seatBack = createHalfPrism({sides: sides, color: g_Colors.chairSeatColor})
  seatBack.scale(0.6, 0.5, 0.1)
  seatBack.translate(0, 0.85, -0.2)
  seatBack.rotate(90, 0, 0, 1)
  

  var chairNode = new Node({noModel: true, name: name, children: {legs, seatBase, seatBack}})
  return chairNode

}

function createBorder(args) {
  const defaults = {
    n: 4,
    r: 0.5,
    lMult: 0.0475,
    model: createQuarterPrism(),
    offset: true,
    unitCircleIs: 'on'
  }

  const unitCircleDict = {inside: 1, on: Math.sqrt(2), outside: 2}
  var opts = Object.assign({}, defaults, args);

  var l = opts.r*Math.sqrt(2-2*Math.cos(2*Math.PI/opts.n)) //http://mathcentral.uregina.ca/QQ/database/QQ.09.06/s/dj1.html
  l *= unitCircleDict[opts.unitCircleIs]
  l *= (opts.lMult + 1)
  opts.model.scale(l, 1, 1)
  var border = createRadialRepetition(opts.model,{n: opts.n, r: opts.r, unitCircleIs: opts.unitCircleIs, offset: opts.offset})
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
    unitCircleIs: 'on'
  }
  var opts = Object.assign({}, defaults, args);
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
    radius = opts.r / 2**(2**-(opts.n-3))
  }

  const angle = 360 / opts.n
  model.translate(0, 0, radius)
  var repeated = new Node({noModel: true, name: `${model.opts.name}_rep_${opts.n}`})
  for (var i = 0; i < Math.min(opts.n, opts.m); i++) {
    repeated.children[`${model.opts.name}_${i+1}`] = new Node({noModel: true, children: {model}, name: `${model.opts.name}_${i+1}`})
    repeated.children[`${model.opts.name}_${i+1}`].rotate(angle * (i+!opts.offset/2), opts.axis[0], opts.axis[1], opts.axis[2])
  }
  return repeated
}

// functions for composited primitives:
function createHalfPrism(args) {

  // define defaults
  const defaults = {
    sides: 4,
    color: [0, 1, 0],
    name: "Half Prism"
  }

  var opts = Object.assign({}, defaults, args);
  var half = new Node({color: opts.color, name: `${opts.name}: half-cube`})
  var prism = new Node({color: opts.color, sides: opts.sides, fitInCircle: true, offset: true, name: `${opts.name}: prism`})
  //halfPrism = new Node({noModel: true, children: [half, prism]})
  var halfPrism = new Node({noModel: true, children: {half, prism}, name: opts.name})
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
    name: "Quarter Prism"
  }

  var opts = Object.assign({}, defaults, args);
  var half = new Node({color: opts.color, name: `${opts.name}: half-cube`})
  var quarter = new Node({color: opts.color, name: `${opts.name}: quarter-cube`})
  var prism = new Node({color: opts.color, sides: opts.sides, fitInCircle: true, offset: true, name: `${opts.name}: prism`})
  var quarterPrism = new Node({noModel: true, children: {half, prism, quarter}})

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
    name: "Corner Prism"
  }

  var opts = Object.assign({}, defaults, args);
  var half = new Node({color: opts.color, name: `${opts.name}: half-cube`})
  var quarter1 = new Node({color: opts.color, name: `${opts.name}: quarter-cube 1`})
  var quarter2 = new Node({color: opts.color, name: `${opts.name}: quarter-cube 1`})
  var prism1 = new Node({color: opts.color, sides: opts.sides, fitInCircle: true, offset: true, name: `${opts.name}: prism 1`})
  var prism2 = new Node({color: opts.color, sides: opts.sides, fitInCircle: true, offset: true, name: `${opts.name}: prism 2`})
  var cornerPrism = new Node({noModel: true, children: {quarter1, quarter2, half, prism1, prism2}})

  half.opts.origin = [0, -0.5, 0]
  half.scale(1, 0.5, 1)
  quarter1.opts.origin = [0, 0.5, -0.5]
  quarter1.scale(1, 0.5, 0.5)
  quarter2.opts.origin = [-0.5, 0.5, 0]
  quarter2.scale(0.5, 0.5, 1)
  prism2.rotate(90, 0, 0, 1)

  return cornerPrism
  
}