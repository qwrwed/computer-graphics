
// globals for camera angle and position
var g_viewMatrix = new Matrix4() // The view matrix
var g_projMatrix = new Matrix4() // The projection matrix

const cameraDefaults = {
  g_hAngle: glMatrix.glMatrix.toRadian(75.0),
  g_vAngle: glMatrix.glMatrix.toRadian(-9.0),
  g_Pos: [-5, 1.75, 1]
}
var ANGLE_STEP = glMatrix.glMatrix.toRadian(3.0) // The increments of rotation angle (converted to radians)
var g_hAngle = cameraDefaults.g_hAngle // horizontal camera direction
var g_vAngle = cameraDefaults.g_vAngle // vertical camera direction
var g_Pos = [...cameraDefaults.g_Pos]

// initial light position
var g_lightPosition = new Vector3([0, 3, 0])

// global GL/canvas-related objects
var canvas
var gl
var uniforms = {}
var attributes = {}
var keysPressed = new Set()

// IIFE for generating unique node IDs
var uniqueId = (() => {
  var counter = 0
  return function () {
    return counter++
  }
})()

// IIFE for generating texture IDs without duplication
var uniqueTexQuery = (() => {
  var texCounter = 0;
  return function (imageSrc) {
    const index = image_sources.findIndex(element => element.imageSrc == imageSrc);
    var textureExists;
    if (index === -1) {
      image_sources.push({ imageSrc: imageSrc, loaded: false });
      textureExists = false;
      return [texCounter++, textureExists]
    } else {
      textureExists = true;
      return [index, textureExists]
    }
  }
})()

// global array of image source names (for checking uniqueness) and states (for checking if loaded)
var image_sources = []

function main() {

  // Retrieve <canvas> element and set size
  canvas = document.getElementById('webgl')
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  window.addEventListener('resize', function() {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
  });

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas, false)

  // Initialize shaders
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.9, 0.9, 0.9, 1.0)
  gl.enable(gl.DEPTH_TEST)

  // Get the storage locations of uniform attributes
  const uniformNames = [
    'ModelMatrix',
    'ViewMatrix',
    'NormalMatrix',
    'ProjMatrix',
    'LightColor',
    'LightPosition',
    'isLighting',
    'AmbientLightColor',
    'UseTextures',
    'Sampler',
    'modelIsLightSource'
  ]
  uniformNames.forEach(name => { uniforms[name] = gl.getUniformLocation(gl.program, `u_${name}`) })

  // Set the light color
  gl.uniform3f(uniforms.LightColor, ...[0.9, 0.9, 0.9])

  //set the ambient light color
  gl.uniform3f(uniforms.AmbientLightColor, 0.3, 0.3, 0.3);

  // calculate the projection matrix and pass to uniform variable
  g_projMatrix.setPerspective(32, canvas.width / canvas.height, 1, 100)
  gl.uniformMatrix4fv(uniforms.ProjMatrix, false, g_projMatrix.elements)

  // enable lighting
  gl.uniform1i(uniforms.isLighting, true)

  // by default, is not light source
  gl.uniform1i(uniforms.modelIsLightSource, false)

  // add listeners for keypress/release (use global list of keys currently pressed)
  document.onkeydown = function (ev) {
    keysPressed.add(ev.code)
  }
  document.onkeyup = function (ev) {
    keysPressed.delete(ev.code)
  }

  // add children to root
  root.children = defineObjects()

  // start rendering
  requestAnimationFrame(render);
}

// utility function: modulo (supports negative numbers)
function mod(x, N) {
  return (x % N + N) % N
}
// utility function: add 3 vectors
function add3Vectors(a, b, c) {
  return c.map((e, i) => e + a[i] + b[i])
}
