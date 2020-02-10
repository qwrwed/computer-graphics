
// Code massively adapted from "Directional lighting demo: By Frederick Li"
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal; // Normal
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjMatrix;
  uniform vec3 u_LightColor; // Light color
  uniform vec3 u_LightPosition;
  uniform vec3 u_AmbientLightColor;
  varying vec4 v_Color;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  uniform bool u_isLighting;
  void main() {
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    gl_PointSize = 10.0;
    if(u_isLighting)
    {
       v_Position = vec3(u_ModelMatrix * a_Position); // vertex position in world coordinates
       vec3 lightDirection = normalize(u_LightPosition - v_Position);
       v_Normal = normalize((u_NormalMatrix * a_Normal).xyz);
       v_Color = a_Color;
    }
  }
`
// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec4 v_Color;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  uniform vec3 u_LightPosition;
  uniform vec3 u_LightColor;
  uniform vec3 u_AmbientLightColor;

  void main() {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
    vec3 ambient = u_AmbientLightColor * v_Color.rgb;
    gl_FragColor = vec4(diffuse + ambient, v_Color.a);
  //  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
  `

var modelMatrix = new Matrix4() // The model matrix
var viewMatrix = new Matrix4() // The view matrix
var projMatrix = new Matrix4() // The projection matrix
var g_normalMatrix = new Matrix4() // Coordinate transformation matrix for normals

const cameraDefaults = {
  g_hAngle: glMatrix.glMatrix.toRadian(75.0),
  g_vAngle: glMatrix.glMatrix.toRadian(-10.0),
  g_Pos: [-5, 1.5, 1]
}

// camera angle
var ANGLE_STEP = glMatrix.glMatrix.toRadian(3.0) // The increments of rotation angle (deg to rad)
var g_hAngle = cameraDefaults.g_hAngle // horizontal camera direction
var g_vAngle = cameraDefaults.g_vAngle // vertical camera direction

// eye position (coordinates follow left-hand rule)
var POS_STEP = 0.1
var g_Pos = [...cameraDefaults.g_Pos]
var POS_SPEED = 1.4 // meters per second


// global GL/canvas-related objects
var canvas
var gl
const uniforms = new Object
const attributes = new Object

var uniqueId = (() => {
  var counter = 0
  return function () {
    return counter++
  }
})()


// Node class definition
// each Node represents a node in the scene graph
// all Nodes can have any combination of the following:
// -vertex buffers (prism shape)
// -array of child Nodes
// all Nodes also have their own transformation (model matrix), which is applied to all children as well as itself

class Node {
  constructor(args) {

    var uid = uniqueId()

    // define defaults
    const defaults = {
      uid: uid,
      noModel: false, // if true, don't draw model (node is for grouping)
      sides: 4, // number of side faces or top edges the prism has (4 for cuboid)
      color: [0, 1, 0], // prism colour
      offset: false, // rotate prism about length by 1/2*sides rotations (e.g. rotate square 45 degrees, rotate triangle 60 degrees)
      fitInCircle: false, // true: contain top face within a 1-diameter circle. false: contain 1-diameter circle within top face
      name: `Unnamed Node (${uid})`, // node name
      origin: [0, 0, 0], // scale/rotation origin
      hidden: false,
    }

    // define prism attributes by overwriting defaults with given args
    this.opts = Object.assign({}, defaults, args);
    this.matrices = {}
    if (typeof (args) === 'undefined') {
      this.children = {}
    } else {
      this.children = Object.assign({}, {}, args.children)
    }

    // initialise model and normal matrices
    this.matrices.scale = new Matrix4
    this.matrices.rotation = new Matrix4
    this.matrices.translation = new Matrix4

    //if the model is to be drawn, initialise vertex buffers
    if (!this.opts.noModel) {
      this.buffers = initPrismVertexBuffers(this.opts.sides, this.opts.color, this.opts.offset, this.opts.fitInCircle)
    }
  }

  // scale operation: takes 1 or 3 arguments
  scale(x, y, z) {
    if ((typeof (z) === 'undefined') && (typeof (y) === 'undefined')) {
      z = x
      y = x
    }
    // scale from specified origin
    this.matrices.scale.translate(this.opts.origin[0], this.opts.origin[1], this.opts.origin[2])
    this.matrices.scale.scale(x, y, z)
    this.matrices.scale.translate(-this.opts.origin[0], -this.opts.origin[1], -this.opts.origin[2])
  }

  // relative translation operation
  translate(x, y, z) {
    this.matrices.translation.translate(x, y, z)
  }

  // absolute translation operation
  setTranslate(x, y, z) {
    this.matrices.translation.setTranslate(x, y, z)
  }

  // relative rotation
  rotate(theta, x, y, z) {
    // rotate about specified origin
    this.matrices.rotation.translate(this.opts.origin[0], this.opts.origin[1], this.opts.origin[2])
    this.matrices.rotation.rotate(theta, x, y, z)
    this.matrices.rotation.translate(-this.opts.origin[0], -this.opts.origin[1], -this.opts.origin[2])
  }

  // absolute rotation
  setRotate(theta, x, y, z) {
    this.matrices.rotation.setRotate(0, x, y, z)
    this.rotate(theta, x, y, z)
    //this.matrices.rotation.translate(-this.opts.origin[0], -this.opts.origin[1], -this.opts.origin[2])    
  }

  // Node.draw() function
  draw(parentModelMatrix) {
    this.matrices.model = new Matrix4
    glMatrix.mat4.multiply(this.matrices.model.elements, (new Matrix4).elements, this.matrices.translation.elements)
    glMatrix.mat4.multiply(this.matrices.model.elements, this.matrices.model.elements, this.matrices.rotation.elements)
    glMatrix.mat4.multiply(this.matrices.model.elements, this.matrices.model.elements, this.matrices.scale.elements)

    // multiply model matrix by parent's model matrix to propagate transformations down the scene graph
    if (typeof (parentModelMatrix) === 'undefined') {
      parentModelMatrix = new Matrix4 // identity matrix
    }
    var newModelMatrix = new Matrix4
    glMatrix.mat4.multiply(newModelMatrix.elements, parentModelMatrix.elements, this.matrices.model.elements)

    // only self if needed    
    if (!this.opts.hidden) {
      if (!this.opts.noModel) {

        // Write the vertex property to buffers (coordinates, colors and normals)
        if (!initArrayBuffer('a_Position', this.buffers.vertices, 3, gl.FLOAT)) return -1
        if (!initArrayBuffer('a_Color', this.buffers.colors, 3, gl.FLOAT)) return -1
        if (!initArrayBuffer('a_Normal', this.buffers.normals, 3, gl.FLOAT)) return -1

        // Write the indices to the buffer object
        var indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices, gl.STATIC_DRAW)
        gl.uniformMatrix4fv(uniforms.ModelMatrix, false, newModelMatrix.elements)

        this.matrices.normal = new Matrix4
        // Calculate the normal transformation matrix and pass it to u_NormalMatrix
        this.matrices.normal.setInverseOf(newModelMatrix)
        this.matrices.normal.transpose()
        gl.uniformMatrix4fv(uniforms.NormalMatrix, false, this.matrices.normal.elements)

        // Draw the prism
        gl.drawElements(gl.TRIANGLES, this.buffers.indices.length, gl.UNSIGNED_BYTE, 0)
      }
      // draw all children
      //this.children.forEach((child, i) => child.draw(newModelMatrix))
      Object.keys(this.children).forEach((key) => this.children[key].draw(newModelMatrix))
    } else {
    }
  }
}

// scene root: cannot have transformations or model data
const root = new Object({
  children: [],
  draw() { Object.keys(this.children).forEach((key) => this.children[key].draw(new Matrix4)) },
})


var keysPressed = new Set()

function main() {

  // Retrieve <canvas> element
  canvas = document.getElementById('webgl')
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight * 0.9

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas)

  // Initialize shaders
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

  // Set clear color and enable hidden surface removal
  //gl.clearColor(0.9, 0.9, 0.9, 1.0)
  gl.clearColor(0, 0, 0, 1.0)
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
  //uniforms.LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')
  uniforms.LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition')
  uniforms.isLighting = gl.getUniformLocation(gl.program, 'u_isLighting')

  uniforms.AmbientLightColor = gl.getUniformLocation(gl.program, 'u_AmbientLightColor')

  // Set the light color (white)
  gl.uniform3f(uniforms.LightColor, 1.0, 1.0, 1.0)
  //gl.uniform3f(uniforms.LightColor, 0.5, 0.5, 0.5)
  // Set the light direction (in the world coordinate)
  //var lightDirection = new Vector3([0.5, 3.0, 4.0])
  //lightDirection.normalize() // Normalize
  var lightPosition = new Vector3([0, 2, 0])
  gl.uniform3fv(uniforms.LightPosition, lightPosition.elements)

  //gl.uniform3fv(uniforms.LightDirection, lightDirection.elements)
  //set the ambient light color
  gl.uniform3f(uniforms.AmbientLightColor, 0.3, 0.3, 0.3);

  // calculate the view matrix and pass to uniform variable, and clear the canvas
  //refreshView()
  // calculate the projection matrix and pass to uniform variable
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
  gl.uniformMatrix4fv(uniforms.ProjMatrix, false, projMatrix.elements)

  gl.uniform1i(uniforms.isLighting, true) // Will apply lighting


  document.onkeydown = function (ev) {
    keysPressed.add(ev.code)
  }

  document.onkeyup = function (ev) {
    keysPressed.delete(ev.code)
  }

  root.children = defineObjects()

  requestAnimationFrame(render);
}


// modulo function from https://stackoverflow.com/a/42131603
function mod(x, N) {
  return (x % N + N) % N
}

function add3Vectors(a, b, c) {
  //return glMatrix.vec3.add([], glMatrix.vec3.add([], a, b), c)
  return c.map((e, i) => e + a[i] + b[i])
}

// create vertex buffers for prism
function initPrismVertexBuffers(sides = 4, color = [1, 0, 0], offset = false, fitInCircle = false) {
  // sides = 4

  const csIndices = [...Array(sides).keys()] // array of top vertex indices

  const radius = !fitInCircle
    // closest points on perimeter are 0.5 meters from center
    ? Math.sqrt(2) * 0.5 // xz-distance magnitude from origin to vertex
    // furthest points on perimeter are 0.5 meters from center
    : 0.5
  //closest points are side midpoints
  //furthest points are vertices

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
  nSides = csIndices.map((e, i) => Array(4).fill(add3Vectors([dispX[i], 0, dispZ[i]], [0, 0, 0], [dispX[mod(i + 1, sides)], 0, dispZ[mod(i + 1, sides)]])))

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

  return { indices, vertices, colors, normals }
}

// create array buffer for prism
function initArrayBuffer(attribute, data, num, type, stride = 0, offset = 0) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  var a_attribute = gl.getAttribLocation(gl.program, attribute)
  gl.vertexAttribPointer(a_attribute, num, type, false, stride, offset)
  gl.enableVertexAttribArray(a_attribute)

  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return true
}
