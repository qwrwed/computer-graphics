/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
// Original code from "Directional lighting demo: By Frederick Li"
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' + // Normal
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform vec3 u_LightColor;\n' + // Light color
  'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
  'varying vec4 v_Color;\n' +
  'uniform bool u_isLighting;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  if(u_isLighting)\n' +
  '  {\n' +
  '     vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '     float nDotL = max(dot(normal, u_LightDirection), 0.0);\n' +
  // Calculate the color due to diffuse reflection
  '     vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
  '     v_Color = vec4(diffuse, a_Color.a);\n' + '  }\n' +
  '  else\n' +
  '  {\n' +
  '     v_Color = a_Color;\n' +
  '  }\n' +
  '}\n'

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  // '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n'

var modelMatrix = new Matrix4() // The model matrix
var viewMatrix = new Matrix4() // The view matrix
var projMatrix = new Matrix4() // The projection matrix
var g_normalMatrix = new Matrix4() // Coordinate transformation matrix for normals

var ANGLE_STEP = 3.0 // The increments of rotation angle (degrees)
var g_xAngle = 0.0 // The rotation x angle (degrees)
var g_yAngle = 0.0 // The rotation y angle (degrees)

var POS_STEP = 0.1
var g_xPos = 0.0
var g_yPos = 0.0
var g_zPos = 0.0

function main () {
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl')
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight

  // Get the rendering context for WebGL
  const gl = getWebGLContext(canvas)
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.')
    return
  }

  // Set clear color and enable hidden surface removal
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearColor(0.9, 0.9, 0.9, 1.0)
  gl.enable(gl.DEPTH_TEST)

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Get the storage locations of uniform attributes
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')

  // Trigger using lighting or not
  var u_isLighting = gl.getUniformLocation(gl.program, 'u_isLighting')

  if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
    !u_ProjMatrix || !u_LightColor || !u_LightDirection ||
    !u_isLighting) {
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix')
    return
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0])
  lightDirection.normalize() // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements)

  // Calculate the view matrix and the projection matrix
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0)
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements)

  document.onkeydown = function (ev) {
    //keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting)
  }

  //draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting)
  drawPrism({gl, u_ModelMatrix, u_NormalMatrix, u_isLighting}, {})
}

/*
function keydown (ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {
  console.log(ev.keyCode)
  switch (ev.keyCode) {
    case 40: // Up arrow key -> the positive rotation of arm1 around the x-axis
      g_xAngle = (g_xAngle + ANGLE_STEP) % 360
      break
    case 38: // Down arrow key -> the negative rotation of arm1 around the x-axis
      g_xAngle = (g_xAngle - ANGLE_STEP) % 360
      break
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle + ANGLE_STEP) % 360
      break
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle - ANGLE_STEP) % 360
      break
    case 87: // W -> go forwards
      g_zPos = (g_zPos + POS_STEP)
      break
    case 83: // S -> go backwards
      g_zPos = (g_zPos - POS_STEP)
      break
    case 65: // A -> go left
      g_xPos = (g_xPos + POS_STEP)
      break
    case 68: // D -> go right
      g_xPos = (g_xPos - POS_STEP)
      break
    case 81: // Q -> go up
      g_yPos = (g_yPos - POS_STEP)
      break
    case 69: // E -> go down
      g_yPos = (g_yPos + POS_STEP)
      break
    default: return // Skip drawing at no effective action
  }

  // Draw the scene
  draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting)
}*/

function normal3 (A, B, C) { // normal vector from three points
  var AB = subvector2(B, A)
  var AC = subvector2(C, A)
  return normal2(AB, AC)
}

function normal2 (AB, AC) { // normal vector from two lines
  const nx = AB[1] * AC[2] - AB[2] * AC[1]
  const ny = AB[2] * AC[0] - AB[0] * AC[2]
  const nz = AB[0] * AC[1] - AB[1] * AC[0]
  return [nx, ny, nz]
}

// modulo function from https://stackoverflow.com/a/42131603
function mod (x, N) {
  return (x % N + N) % N
}

function subvector2 (b, a) {
  return b.map((e, i) => e - a[i])
}

function addVector3 (a, b, c) {
  return c.map((e, i) => e + a[i] + b[i])
}

function initPrismVertexBuffers (gl, sides = 4, color = [1, 0, 0], offset = false, fitInCircle = false) {
  // sides = 4

  const csIndices = [...Array(sides).keys()] // array of top vertex indices
  const radius = !fitInCircle
    // at least a metre(by default) in diameter
    ? Math.sqrt(2) / 2 // xz-distance magnitude from origin to vertex
    // at most a metre (by default) in diameter to fit in a 1-diameter circle
    : 0.5

  const radAngles = csIndices.map(i => (i * (2 * Math.PI) / sides + !offset * Math.PI / sides)) // array of angles between current vertex/origin and first vertex/origin (radians)
  const dispX = radAngles.map(t => +Math.sin(t).toFixed(10)) // x displacement of each vertex calculated by angle
  const dispZ = radAngles.map(t => +Math.cos(t).toFixed(10)) // z displacement of each vertex calculated by angle
  const dispYAbs = 0.5 // y-distance magnitude from origin to top and bottom vertices/faces

  const vTop = csIndices.map(i => [radius * dispX[i % sides], dispYAbs, radius * dispZ[i % sides]]) // array of vertex coordinates (2D: [[x,y,z], [x,y,z], ...])
  const nTop = vTop.map((e, i) => [0, 1, 0])

  const vBottom = csIndices.map(i => [radius * dispX[i % sides], -dispYAbs, radius * dispZ[i % sides]]) // array of vertex coordinates (2D: [[x,y,z], [x,y,z], ...])
  const nBottom = vBottom.map((e, i) => [0, -1, 0])

  eTop = csIndices.map(i => [i, mod(i + 1, sides)]) // top edges
  eBottom = csIndices.map(i => [i + sides, mod(i + 1, sides) + sides]) // bottom edges
  eSides = eTop.map((e, i) => [...eTop[i], ...eBottom[i]]) // side edges

  const vTopBottom = [...vTop, ...vBottom]
  vSides = eSides.flat().map((e, i) => vTopBottom[e])
  nSides = csIndices.map((e, i) => Array(4).fill(addVector3([dispX[i], 0, dispZ[i]], [0, 0, 0], [dispX[mod(i + 1, sides)], 0, dispZ[mod(i + 1, sides)]])))

  v = [vTop, vBottom, vSides]
  n = [nTop, nBottom, nSides]

  var vertices = new Float32Array(v.flat(Infinity)) // vertex coordinates in WebGL-compatible format
  var normals = new Float32Array(n.flat(Infinity))

  colorsJS = []
  colorsJS.push(v.flat().map(i => color))
  colors = new Float32Array(colorsJS.flat(Infinity))

  topVertTriangulationOrder = csIndices.map(i => {
    if ((i % 2) === 0) {
      return -(i / 2)
    } else {
      return (Math.trunc((i + 1) / 2))
    }
  }) // order in which to draw the vertices such that the top/bottom faces will be triangulated; ccw +ve, cw -ve

  topTriIndices = [...Array(sides - 2).keys()] // array with one index per cross-section triangle (e.g. square => [0,1])
  topTriVertIndices = topTriIndices.map(i => topVertTriangulationOrder.slice(i + 3 - 3, i + 3)) // indices of individual vertices of the top triangles
  topTriVertPositions = topTriVertIndices.flat().map(i => sides * 0 + mod(i, sides)) // indices of top face made positive
  bottomTriVertPositions = topTriVertIndices.flat().map(i => sides * 1 + mod(i, sides)) // indices of bottom face made positive

  sideTriVertIndices = csIndices.map(i => [mod(i, sides), mod(i + 1, sides), mod(i, sides) + sides, mod(i + 1, sides), mod(i, sides) + sides, mod(i + 1, sides) + sides])
  sideTriVertPositions = csIndices.map(i => [i * 4 + 0, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 2, i * 4 + 3])
  sideTriVertPositions = sideTriVertPositions.flat().map((e, i) => e + 2 * sides)

  var indicesJS = [topTriVertPositions, bottomTriVertPositions, sideTriVertPositions]

  var indices = new Uint8Array(
    indicesJS.flat(Infinity)
  )

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer()
  if (!indexBuffer) {
    console.log('Failed to create the buffer object')
    return false
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  return indices.length
}

class Prism {
  constructor(){
    console.log("made a prism!")
  }
}

function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer()
  if (!buffer) {
    console.log('Failed to create the buffer object')
    return false
  }
  // Write data into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute)
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute)
    return false
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute)

  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return true
}

function initAxesVertexBuffers (gl) {
  const gridLim = 2.0

  var verticesColors = new Float32Array([
    // Vertex coordinates and color (for axes)
    -gridLim, 0.0, 0.0, 1.0, 1.0, 1.0, // (x,y,z), (r,g,b)
    gridLim, 0.0, 0.0, 1.0, 1.0, 1.0,
    0.0, gridLim, 0.0, 1.0, 1.0, 1.0,
    0.0, -gridLim, 0.0, 1.0, 1.0, 1.0,
    0.0, 0.0, -gridLim, 1.0, 1.0, 1.0,
    0.0, 0.0, gridLim, 1.0, 1.0, 1.0
  ])
  var n = 6

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer()
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object')
    return false
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

  var FSIZE = verticesColors.BYTES_PER_ELEMENT
  // Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position')
    return -1
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  gl.enableVertexAttribArray(a_Position) // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color')
    return -1
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  gl.enableVertexAttribArray(a_Color) // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return n
}

var g_matrixStack = [] // Array for storing a matrix
function pushMatrix (m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m)
  g_matrixStack.push(m2)
}

function popMatrix () { // Retrieve the matrix from the array
  return g_matrixStack.pop()
}

function repeatRadial (args, fn) {
  var { r = 0.5, n = 4, offset = false } = args
  const angle = 360 / n
  modelMatrix.rotate(!offset * angle / 2, 0, 1, 0)
  modelMatrix.translate(0, 0, r)
  for (var i = 0; i < n; i++) {
    modelMatrix.translate(0, 0, -r)
    modelMatrix.rotate(angle, 0, 1, 0)
    modelMatrix.translate(0, 0, r)
    fn(modelMatrix)
  }
}

function drawShape (gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix)

  // Pass the model matrix to the uniform variable
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  // Calculate the normal transformation matrix and pass it to u_NormalMatrix
  g_normalMatrix.setInverseOf(modelMatrix)
  g_normalMatrix.transpose()
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements)

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
  // gl.drawElements(gl.LINES, n, gl.UNSIGNED_BYTE, 0);
  // gl.drawElements(gl.POINTS, n, gl.UNSIGNED_BYTE, 0);

  modelMatrix = popMatrix()
}

function drawPrism (data, args) {
  var { gl, u_ModelMatrix, u_NormalMatrix } = data
  const { sides = 4, color = [0, 1, 0], scale = [1, 1, 1], offset = false, fitInCircle = false } = args
  var n = initPrismVertexBuffers(gl, sides, color, offset, fitInCircle)
  if (n < 0) {
    console.log('Failed to set the vertex information')
    return
  }

  // Model the prism
  pushMatrix(modelMatrix)
  modelMatrix.scale(...scale) // Scale
  drawShape(gl, u_ModelMatrix, u_NormalMatrix, n)
  modelMatrix = popMatrix()
}

function drawPrismHalfCube (data, args) {
  var { gl, u_ModelMatrix, u_NormalMatrix } = data
  const { sides = 4, color = [0, 1, 0], scale = [1, 1, 1], offset = false, fitInCircle = false } = args
  args = { sides, color, scale, offset, fitInCircle }
  args.fitInCircle = true
  args.offset = true
  pushMatrix(modelMatrix)
  drawPrism(data, args)
  modelMatrix.scale(...args.scale)
  modelMatrix.translate(0, 0, -0.25)
  drawPrism(data, { color: args.color, scale: [1, 1, 0.5] })
  modelMatrix = popMatrix()
}

function drawPrism3QuarterCube (data, args) {
  var { gl, u_ModelMatrix, u_NormalMatrix } = data
  var { sides = 4, color = [0, 1, 0], scale = [1, 1, 1], offset = false, fitInCircle = false } = args
  args = { sides, color, scale, offset, fitInCircle }
  args.fitInCircle = true
  args.offset = true

  args.scale = [args.scale[1], args.scale[0], args.scale[2]]
  pushMatrix(modelMatrix)
  modelMatrix.rotate(-90, 0, 0, 1)
  drawPrism(data, args)
  modelMatrix.scale(...args.scale)
  modelMatrix.translate(0, 0, -0.25)
  drawPrism(data, { color: args.color, scale: [1, 1, 0.5] })
  modelMatrix.translate(0.25, 0, 0.5)
  drawPrism(data, { color: args.color, scale: [0.5, 1, 0.5] })
  modelMatrix = popMatrix()
}

function drawTable (data, args) {
  var { gl, u_ModelMatrix, u_NormalMatrix } = data
  const { tableLegColor = [0.5, 0.5, 0.5], tableTopColor = [0.9, 0.9, 0.9], sides = 32 } = args

  pushMatrix(modelMatrix)
  modelMatrix.rotate(180, 0, 1, 0)
  // draw 4 chair legs
  modelMatrix.translate(0, 0.4, 0)
  // modelMatrix.scale(...[1.5,1.5,1.5])

  const squareRadius = 2 ** -0.5 // distance from centre to corner of 1x1 square
  pushMatrix(modelMatrix)
  repeatRadial({ r: squareRadius * 1 - Math.sqrt(2 * 0.025 ** 2), n: 4, offset: true }, () => {
    drawPrism(data, {
      sides: sides,
      color: tableLegColor,
      scale: [0.05, 0.8, 0.05],
      offset: true,
      fitInCircle: true
    })
  })

  modelMatrix = popMatrix()

  pushMatrix(modelMatrix)
  modelMatrix.translate(0, 0.4, 0)
  drawPrism(data, {
    scale: [1.5, 0.05, 1.5],
    offset: false,
    sides: sides,
    color: tableTopColor
  })
  modelMatrix = popMatrix()

  modelMatrix = popMatrix()
}


function drawChair (data, args) {
  var { gl, u_ModelMatrix, u_NormalMatrix } = data
  const { chairLegColor = [0.5, 0.5, 0.5], chairSeatColor = [0.9, 0.9, 0.9], sides = 32 } = args

  pushMatrix(modelMatrix)
  modelMatrix.rotate(180, 0, 1, 0)
  // draw 4 chair legs
  modelMatrix.translate(0, 0.25, 0)
  // modelMatrix.scale(...[1.5,1.5,1.5])

  const squareRadius = 2 ** -0.5 // distance from centre to corner of 1x1 square
  pushMatrix(modelMatrix)
  repeatRadial({ r: squareRadius * 0.5 - Math.sqrt(2 * 0.025 ** 2), n: 4, offset: false }, () => {
    drawPrism(data, {
      sides: sides,
      color: chairLegColor,
      scale: [0.05, 0.5, 0.05],
      offset: true,
      fitInCircle: true
    })
  })

  modelMatrix = popMatrix()

  pushMatrix(modelMatrix)
  modelMatrix.translate(0, 0.275, 0)
  drawPrism3QuarterCube(data, {
    scale: [0.5, 0.05, 0.5],
    offset: true,
    sides: sides,
    color: chairSeatColor
  })
  modelMatrix = popMatrix()

  pushMatrix(modelMatrix)
  modelMatrix.translate(0, 0.6, -0.2)
  drawPrismHalfCube(data, {
    sides: sides,
    color: chairSeatColor,
    scale: [0.5, 0.6, 0.1],
    fitInCircle: true,
    offset: true
  })
  modelMatrix = popMatrix()
  modelMatrix = popMatrix()
}

function drawTableAndChairs (data) {
  
  const chairLegColor = [0.6, 0.5, 0.4].map(e => e * 1.5)
  const chairSeatColor = [0.7, 0.7, 0.7]

  const tableLegColor = [0.6, 0.5, 0.4].map(e => e * 1.5)
  const tableTopColor = [0.7, 0.7, 0.7]

  const sides = 32

  pushMatrix(modelMatrix)
    repeatRadial({ n: 4, r: 1 }, () => {
      drawChair(data, { chairLegColor, chairSeatColor, sides })
    })
  modelMatrix = popMatrix()

  drawTable(data, { tableLegColor, tableTopColor, sides })
}

function drawCorner(data, args) {
  pushMatrix(modelMatrix)
    drawPrism3QuarterCube(data, {sides: 4, offset: true})
    modelMatrix.rotate(90, 0, 0, 1)
    drawPrism3QuarterCube(data, {sides: 4, offset: true})
  modelMatrix = popMatrix()
}
function drawTV(data) {
  
  //modelMatrix.scale(1, 1, 0.01)
  modelMatrix.rotate(-90, 0, 0, 1)
  modelMatrix.scale(0.5, 0.1, 0.1)
  drawPrism3QuarterCube(data, {offset: true})
  modelMatrix.rotate(-90, 0, 0, 1)
  modelMatrix.translate(0, 2, 0)
  drawPrism3QuarterCube(data, {offset: true})
  
}

function draw (gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {
  // draw everything
  var data = { gl, u_ModelMatrix, u_NormalMatrix, u_isLighting }

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  /*

  gl.uniform1i(u_isLighting, false); // Will not apply lighting

  // Set the vertex coordinates and color (for the x, y axes)

  var n = initAxesVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Calculate the view matrix and the projection matrix
  modelMatrix.setTranslate(0, 0, 0);  // No Translation
  // Pass the model matrix to the uniform variable
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Draw x and y axes
  gl.drawArrays(gl.LINES, 0, n);
  draw
  */
  gl.uniform1i(u_isLighting, true) // Will apply lighting

  // Rotate, and then translate
  //modelMatrix.setTranslate(0, -0.5, -1) // Translation (No translation is supported here)
  modelMatrix.setTranslate(g_xPos, g_yPos, g_zPos) // Translation (No translation is supported here)
  modelMatrix.rotate(g_yAngle, 0, 1, 0) // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0) // Rotate along x axis

  //let box = new Prism
  //drawTableAndChairs(data)
  
  //modelMatrix.scale(1, 1, 0.1)
  
  //drawPrismHalfCube(data, {sides: 32, offset: true})
  //drawPrism(data, {color: [1, 0, 0]})
  
  //drawTV(data)
}