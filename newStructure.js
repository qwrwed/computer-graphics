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

var ANGLE_STEP = glMatrix.glMatrix.toRadian(3.0) // The increments of rotation angle (deg tp rad)

var g_hAngle = 0.0 // horizontal camera direction
var g_vAngle = 0.0 // vertical camera direction

var POS_STEP = 0.1
var g_xPos = 0.0
var g_yPos = 0.0
var g_zPos = 4.0

var gl
const uniforms = new Object
const attributes = new Object

class Cube {
  constructor(args) {
    const defaults = {
      angle: [0,0,0],
      color: [0,1,0],
      children: [],
      noModel: false,
      name: "unnamed node"
    }
    // define prism attributes by overwriting defaults with given args
    this.opts = Object.assign({}, defaults, args);
    // assign options to instance data (using only property names contained
    // in defaults object to avoid copying properties we don't want)
    Object.keys(defaults).forEach(prop => {
      this[prop] = this.opts[prop];
    });

    
    
    this.attributes = {
      aColor: {
        size: 3,
        bufferData: new Float32Array(
          Array(24).fill(this.opts.color).flat()
        ),
      },
      aNormal: {
        size:3,
        bufferData: new Float32Array([
          0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
          1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
          0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
         -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
          0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
          0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0
        ]),
      },
      aPosition: {
        size:3,
        bufferData: new Float32Array([
          1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,
          1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,
          1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,
         -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
         -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,
          1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0
       ]),
     },
    };
    //console.log(this.attributes.aColor)
    //console.log(this.opts.color)
    //console.log()
    this.indices = new Uint8Array([
      0, 1, 2,   0, 2, 3,
      4, 5, 6,   4, 6, 7,
      8, 9,10,   8,10,11,
      12,13,14,  12,14,15,
      16,17,18,  16,18,19,
      20,21,22,  20,22,23
    ]);
  this.modelMatrix = new Matrix4
  this.normalMatrix = new Matrix4

  }

  scale(x, y, z) {
    if ((typeof(z) === 'undefined') && (typeof(y) === 'undefined')) {
      z = x
      y = x
    }
    this.modelMatrix.scale(x, y, z)
    //this.children.forEach((child, i) => { child.scale(x, y, z) })
    //console.log("scaling", this.name, x, y, z)
  }

  translate(x, y, z) {
    this.modelMatrix.translate(x, y, z)
    //this.children.forEach((child, i) => child.translate(x, y, z))
  }

  rotate(theta, x, y, z) {
    this.modelMatrix.rotate(theta, x, y, z)
    //this.children.forEach((child, i) => child.rotate(theta, x, y, z))
  }

  draw(parentModelMatrix) {
  if (typeof(parentModelMatrix) === 'undefined') {
    parentModelMatrix = new Matrix4
  }
    // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer('a_Position', this.attributes.aPosition.bufferData, this.attributes.aPosition.size, gl.FLOAT)) return -1
  if (!initArrayBuffer('a_Color',    this.attributes.aColor.bufferData, this.attributes.aColor.size, gl.FLOAT)) return -1
  if (!initArrayBuffer('a_Normal',   this.attributes.aNormal.bufferData, this.attributes.aNormal.size, gl.FLOAT)) return -1

  var mm = new Matrix4;
  if (this.opts.translate) {
    mm.translate(...this.opts.translate);
  }
  if (this.opts.scale) {
    mm.scale(...this.opts.scale);
  }
  if (this.opts.angle[0] || this.opts.angle[1] || this.opts.angle[2]) {
    mm.rotate(this.opts.angle[0], 1, 0, 0)
    mm.rotate(this.opts.angle[1], 0, 1, 0)
    mm.rotate(this.opts .angle[2], 0, 0, 1)
  }

  var newModelMatrix = new Matrix4
  glMatrix.mat4.multiply(newModelMatrix.elements, parentModelMatrix.elements, this.modelMatrix.elements)
  //glMatrix.mat4.multiply(newModelMatrix, this.modelMatrix, parentModelMatrix)
  //console.log(this.noModel)
  //console.log(this.modelMatrix.elements)
  //console.log(parentModelMatrix.elements)
  //console.log(newModelMatrix.elements)
  //console.log()
  //newModelMatrix = this.modelMatrix

  var test2 = new Matrix4
  var test01 = new Matrix4
  var test3 = new Matrix4

  test2.scale(2,2,2)
  test01.scale(0.1, 0.1, 0.1)

  glMatrix.mat4.multiply(test3.elements, test2.elements, test01.elements)
  //console.log(test2)
  //console.log(test3)

  if (!this.noModel) {
  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
  
  //gl.uniformMatrix4fv(uniforms.ModelMatrix, false, this.modelMatrix.elements)
  gl.uniformMatrix4fv(uniforms.ModelMatrix, false, newModelMatrix.elements)
  //console.log(this.modelMatrix.elements)
  //console.log(mm.elements)
  //gl.uniformMatrix4fv(uniforms.ModelMatrix, false, mm.elements)
  
  // Calculate the normal transformation matrix and pass it to u_NormalMatrix
  this.normalMatrix.setInverseOf(this.modelMatrix)
  this.normalMatrix.transpose()
  gl.uniformMatrix4fv(uniforms.NormalMatrix, false, this.normalMatrix.elements)

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0)
  }
  this.children.forEach((child, i) => child.draw(newModelMatrix))


  }

}
/*
class Node {
  constructor(args) {

    // define defaults
    const defaults = {
      noModel: false,
      sides: 4,
      color: [0, 1, 0],
      offset: false,
      fitInCircle: false,
      children: [],
      name: "Unnamed Node"
    }

    // define prism attributes by overwriting defaults with given args
    const prismAttributes = Object.assign({}, defaults, args);

    // assign options to instance data (using only property names contained
    // in defaults object to avoid copying properties we don't want)
    Object.keys(defaults).forEach(prop => {
      this[prop] = prismAttributes[prop];
    });

    this.translationMatrix = new Matrix4
    this.rotationMatrix = new Matrix4
    this.scaleMatrix = new Matrix4

    this.modelMatrix = new Matrix4
    this.normalMatrix = new Matrix4
  }

  scale(x, y, z) {
    console.log("SCALING " + this.name)
    console.log(this.scaleMatrix.elements)
    this.scaleMatrix.scale(x, y, z)
    console.log(this.scaleMatrix.elements)
    this.children.forEach((child, i) => { child.scale(x, y, z) })
  }

  translate(x, y, z) {
    this.translationMatrix.translate(x, y, z)
    this.children.forEach((child, i) => child.translate(x, y, z))
  }

  rotate(theta, x, y, z) {
    this.rotationMatrix.rotate(theta, x, y, z)
    this.children.forEach((child, i) => child.rotate(theta, x, y, z))
  }

  draw() {
    if (!this.noModel) {

      // use gl-matrix as cuon-matrix's concat modifies the transformation vectors in place

      let matT = this.translationMatrix.elements
      let matTR = []
      let matTRS = []
      glMatrix.mat4.multiply(matTR, matT, this.rotationMatrix.elements)
      glMatrix.mat4.multiply(matTRS, matTR, this.scaleMatrix.elements)
      let matTS = []
      let matTSR = []
      glMatrix.mat4.multiply(matTS, matT, this.scaleMatrix.elements)
      glMatrix.mat4.multiply(matTSR, matTS, this.rotationMatrix.elements)

      let matR = this.rotationMatrix.elements
      let matRT = []
      let matRTS = []
      glMatrix.mat4.multiply(matRT, matR, this.translationMatrix.elements)
      glMatrix.mat4.multiply(matRTS, matRT, this.scaleMatrix.elements)
      let matRS = []
      let matRST = []
      glMatrix.mat4.multiply(matRS, matR, this.scaleMatrix.elements)
      glMatrix.mat4.multiply(matRST, matRS, this.translationMatrix.elements)

      let matS = this.scaleMatrix.elements
      let matST = []
      let matSTR = []
      glMatrix.mat4.multiply(matST, matS, this.translationMatrix.elements)
      glMatrix.mat4.multiply(matSTR, matST, this.rotationMatrix.elements)
      let matSR = []
      let matSRT = []
      glMatrix.mat4.multiply(matSR, matS, this.rotationMatrix.elements)
      glMatrix.mat4.multiply(matSRT, matSR, this.translationMatrix.elements)

      this.modelMatrix.elements = matTRS
      //this.modelMatrix.elements = matTSR
      //this.modelMatrix.elements = matRTS
      //this.modelMatrix.elements = matRST
      //this.modelMatrix.elements = matSTR
      //this.modelMatrix.elements = matSRT

      this.numIndices = initPrismVertexBuffers(this.sides, this.color, this.offset, this.fitInCircle)
      if (this.numIndices < 0) {
        console.log('Failed to set the vertex information')
        return
      }
      gl.uniformMatrix4fv(uniforms.ModelMatrix, false, this.modelMatrix.elements)

      // Calculate the normal transformation matrix and pass it to u_NormalMatrix
      this.normalMatrix.setInverseOf(this.modelMatrix)
      this.normalMatrix.transpose()
      gl.uniformMatrix4fv(uniforms.NormalMatrix, false, this.normalMatrix.elements)

      // Draw the cube
      gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_BYTE, 0)
      //gl.drawElements(gl.LINES, this.numIndices, gl.UNSIGNED_BYTE, 0);
      //gl.drawElements(gl.POINTS, this.numIndices, gl.UNSIGNED_BYTE, 0);
    }
    //modelMatrix = popMatrix()
    this.children.forEach((e, i) => e.draw())
  }
}
*/
const root = new Object({
  children: [],
  draw() { this.children.forEach((e, i) => e.draw(new Matrix4)) }
})

var canvas

function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl')
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas)

  // Initialize shaders
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.9, 0.9, 0.9, 1.0)
  gl.enable(gl.DEPTH_TEST)

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Get the storage locations of uniform attributes
  /*const uniformNames = [
    ModelMatrix,
    ViewMatrix,
    NormalMatrix,
    ProjMatrix,
    LightColor,
    LightDirection,
    isLighting,
  ]*/
  uniforms.ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  uniforms.ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
  uniforms.NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  uniforms.ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
  uniforms.LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
  uniforms.LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')
  uniforms.isLighting = gl.getUniformLocation(gl.program, 'u_isLighting')


  // Set the light color (white)
  gl.uniform3f(uniforms.LightColor, 1.0, 1.0, 1.0)
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0])
  lightDirection.normalize() // Normalize
  gl.uniform3fv(uniforms.LightDirection, lightDirection.elements)

  // Calculate the view matrix and the projection matrix
  //setLookAt: (fromX, fromY, fromZ,   toX, toY, toZ,   upVector)


  refreshView()
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(uniforms.ProjMatrix, false, projMatrix.elements)


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.uniform1i(uniforms.isLighting, true) // Will apply lighting

  document.onkeydown = function (ev) {
    keydown(ev)
  }

  defineObjects()

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  root.draw()
}

function refreshView() {
  const eyePos = [g_xPos, g_yPos, g_zPos]
  const eyeTargetRelative = [Math.sin(g_hAngle), Math.sin(g_vAngle), -Math.cos(g_hAngle) * Math.cos(g_vAngle)]
  var eyeTargetAbsolute = []
  glMatrix.vec3.add(eyeTargetAbsolute, eyePos, eyeTargetRelative)

  eyeTargetAbsolute2 = [g_xPos, g_yPos - 1, g_zPos - 3]
  //console.log(eyePos)
  //console.log(eyeTargetAbsolute)
  //console.log(eyeTargetAbsolute2)
  const upVector = [0, 1, 0]
  viewMatrix.setLookAt(...eyePos, ...eyeTargetAbsolute, ...upVector)
  gl.uniformMatrix4fv(uniforms.ViewMatrix, false, viewMatrix.elements)
}

function halfPrism(args) {
  const block = new Node({ noModel: true, name: "halfPrismBlock" })
  const half = new Node({ color: [1, 0, 0], name: "halfCube", sides: 5 })

  const prism = new Node({ color: [1, 1, 0], sides: 32, fitInCircle: true, name: "prism" })

  //make transformations local
  half.rotate(90, 1, 1, 0)
  half.scale(1, 0.5, 1) //local?
  //half.translate(0, -0.25, 0) //global?
  //prism.rotate(90, 0, 0, 1)
  //block.children.push(half)
  //block.children.push(prism)

  //half.rotate(90, -1, 1, 0)

  //block.scale(1,0.1,1)
  //block.rotate(90, -1, 1, 0)
  //return block
  root.children.push(half)
}

// ALL MANUAL DEFINITION OF OBJECTS GOES HERE
function defineObjects() {


  /*
  const pipe1 = new Node({
    sides: 4,
    color: [1, 0, 0],
    offset: true
  })

  const leg1 = new Node({
    sides: 3,
    color: [1, 0.5, 0],
    children: [pipe1],
  })

  const pipe2 = new Node({
    sides: 4,
    color: [0, 0, 1],
    offset: true
  })

  const leg2 = new Node({
    sides: 5,
    color: [0, 0.9, 1],
    children: [pipe2],
  })

  leg2.rotate(90, 0, 0, 1)
  leg2.translate(1, 0, 0)
  leg2.scale(0.05, 2, 0.05)

  root.children.push(leg1)
  root.children.push(leg2)

  */
  //var x = new Node({ sides: 32 })
  //root.children.push(x)
/*
  blu = new Cube({color:[0,0,1], translate:[3,0,0]}),
  gre = new Cube({color:[0,1,0], scale:[0.5,0.5,0.5]}),
  cya = new Cube({color:[0,1,1], scale:[0.5,0.5,0.5], translate:[-2, 2, 0]}),
  red = new Cube({
    color:[1,0,0],
    scale:[0.6,0.6,0.6],
    translate:[-2, -2, 2],
    angle: [0,35,0],
  }), 
  mag = new Cube({
    color:[1,0,1],
    scale:[0.2,0.2,0.2],
    translate:[2, 2, 2],
    angle: [75,0,0],
  }),
  cubs = [
    blu,
    gre,
    cya,
    red,
    mag  
  ]


  blu.translate(3, 0, 0)
  cya.translate(-2, 2, 0)
  red.translate(-2,-2,2)
  mag.translate(2,2,2)

  gre.scale(0.5, 0.5, 0.5)
  cya.scale(0.5, 0.5, 0.5)
  red.scale(0.6, 0.6, 0.6)
  mag.scale(0.2, 0.2, 0.2)

  red.rotate(35, 0, 1, 0)
  mag.rotate(65, 1, 0, 0)

  allCubes = new Cube({
    noModel: true,
    color: [0,0,0],
    children: [blu, gre, cya, red, mag]
  })

  allCubes.scale(0.1, 0.1, 0.1)
*/
  child = new Cube({
    name: "child"
  })
  parent = new Cube({
    noModel: true,
    children: [child],
    name: "parent"
  })

  child.rotate(45, 0, 0, 1)
  //child.scale(0.1, 1, 1)
  //child.scale(0.1)
  //child.scale(0.01)
  //child.translate(1, 0, 0)
  //parent.translate(0, 1, 0)
  parent.scale(1, 0.1, 1)
  //parent.scale(0.1, 1, 1)
  root.children.push(parent)

  //root.children.push(allCubes)
  //let block1 = halfPrism()
  //let block2 = halfPrism()
  //block1.translate(-1, 0, 0)
  //block2.scale(1, 0.1, 1)
  //root.children.push(block2)
}

function keydown(ev) {
  //console.log(ev.keyCode)
  switch (ev.keyCode) {
    case 38: // Up arrow key -> the positive rotation of arm1 around the x-axis
      //g_vAngle = Math.max((g_vAngle - ANGLE_STEP), -Math.PI/2)
      //g_vAngle = (g_vAngle + ANGLE_STEP)// % 2*Math.PI
      g_vAngle = Math.min((g_vAngle + ANGLE_STEP), Math.PI / 2)
      break
    case 40: // Down arrow key -> the negative rotation of arm1 around the x-axis
      //g_vAngle = Math.min((g_vAngle + ANGLE_STEP),  Math.PI/2)
      //g_vAngle = (g_vAngle - ANGLE_STEP)// % 2*Math.PI
      g_vAngle = Math.max((g_vAngle - ANGLE_STEP), -Math.PI / 2)
      break
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_hAngle = (g_hAngle + ANGLE_STEP)// % 2*Math.PI
      break
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_hAngle = (g_hAngle - ANGLE_STEP)// % 2*Math.PI
      break
    case 87: // W -> go forwards
      g_zPos = (g_zPos - POS_STEP)
      break
    case 83: // S -> go backwards
      g_zPos = (g_zPos + POS_STEP)
      break
    case 65: // A -> go left
      g_xPos = (g_xPos - POS_STEP)
      break
    case 68: // D -> go right
      g_xPos = (g_xPos + POS_STEP)
      break
    case 81: // Q -> go up
      g_yPos = (g_yPos + POS_STEP)
      break
    case 69: // E -> go down
      g_yPos = (g_yPos - POS_STEP)
      break
    default: return // Skip drawing at no effective action
  }

  refreshView()
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  root.draw()
}

/*
// modulo function from https://stackoverflow.com/a/42131603
function mod(x, N) {
  return (x % N + N) % N
}


function addVector3(a, b, c) {
  //return glMatrix.vec3.add([], glMatrix.vec3.add([], a, b), c)
  return c.map((e, i) => e + a[i] + b[i])
}

function initPrismVertexBuffers(sides = 4, color = [1, 0, 0], offset = false, fitInCircle = false) {
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
  if (!initArrayBuffer('a_Position', vertices, 3, gl.FLOAT)) return -1
  if (!initArrayBuffer('a_Color', colors, 3, gl.FLOAT)) return -1
  if (!initArrayBuffer('a_Normal', normals, 3, gl.FLOAT)) return -1

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer()
  if (!indexBuffer) {
    console.log('Failed to create the buffer object')
    return false
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  return indices.length
}*/

function initArrayBuffer(attribute, data, num, type, stride=0, offset=0) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  var a_attribute = gl.getAttribLocation(gl.program, attribute)
  gl.vertexAttribPointer(a_attribute, num, type, false, stride, offset)
  gl.enableVertexAttribArray(a_attribute)

  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return true
}