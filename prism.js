// Original code from "Directional lighting demo: By Frederick Li"
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +        // Normal
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
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
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  //'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

var modelMatrix = new Matrix4(); // The model matrix
var viewMatrix = new Matrix4();  // The view matrix
var projMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

var ANGLE_STEP = 3.0;  // The increments of rotation angle (degrees)
var g_xAngle = 0.0;    // The rotation x angle (degrees)
var g_yAngle = 0.0;    // The rotation y angle (degrees)

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Get the storage locations of uniform attributes
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');

  // Trigger using lighting or not
  var u_isLighting = gl.getUniformLocation(gl.program, 'u_isLighting');

  if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
    !u_ProjMatrix || !u_LightColor || !u_LightDirection ||
    !u_isLighting) {
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // Calculate the view matrix and the projection matrix
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);


  document.onkeydown = function (ev) {
    keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
  };

  draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
}

function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {
  switch (ev.keyCode) {
    case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
      g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
      break;
    case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
      g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
      break;
    default: return; // Skip drawing at no effective action
  }

  // Draw the scene
  draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
}

function normal3(A, B, C) { // normal vector from three points
  var AB = subvector2(B, A)
  var AC = subvector2(C, A)
  return normal2(AB, AC)
}

function normal2(AB, AC) { //normal vector from two lines
  const nx = AB[1] * AC[2] - AB[2] * AC[1];
  const ny = AB[2] * AC[0] - AB[0] * AC[2];
  const nz = AB[0] * AC[1] - AB[1] * AC[0];
  return [nx, ny, nz]
}

//modulo function from https://stackoverflow.com/a/42131603
function mod(x, N) {
  return (x % N + N) % N;
}

function subvector2(b, a) {
  return b.map((e, i) => e - a[i]);
}

function addVector3(a, b, c) {
  return c.map((e, i) => e + a[i] + b[i]);
}

function initVertexBuffers(gl) {
  // Original: Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  // Adaptation: Create a prism
  //    v2----- v1
  //   /|      /|
  //  v3------v0|
  //  | |     | |
  //  | |v6---|-|v5
  //  |/      |/
  //  v7------v4


  //const csSides = 40 // number of top (or bottom) vertices on prism
  const csSides = 40 // number of top (or bottom) vertices on prism
  const csIndices = [...Array(csSides).keys()] // array of top vertex indices
  //const vIndices = [...Array(csSides * 2).keys()] // array of top and bottom vertex indices
  const radius = Math.sqrt(2) / 2 // xz-distance magnitude from origin to vertex
  //const radius = 1

  const radAngles = csIndices.map(i => (i * (2 * Math.PI) / csSides)); // array of angles between current vertex/origin and first vertex/origin (radians)
  const dispX = radAngles.map(t => +Math.sin(t).toFixed(10)); // x displacement of each vertex calculated by angle
  const dispZ = radAngles.map(t => +Math.cos(t).toFixed(10)); // z displacement of each vertex calculated by angle
  const dispYAbs = 0.5 // y-distance magnitude from origin to top and bottom vertices/faces
  //const dispYAbs = 1
  //const v = vIndices.map(i => [radius * dispX[i % csSides], dispYAbs * ((-1) ** (i >= csSides)), radius * dispZ[i % csSides]]); // array of vertex coordinates (2D: [[x,y,z], [x,y,z], ...])

  const vTop = csIndices.map(i => [radius * dispX[i % csSides], dispYAbs, radius * dispZ[i % csSides]]); // array of vertex coordinates (2D: [[x,y,z], [x,y,z], ...])
  const nTop = vTop.map((e, i) => [0, 1, 0]);

  const vBottom = csIndices.map(i => [radius * dispX[i % csSides], -dispYAbs, radius * dispZ[i % csSides]]); // array of vertex coordinates (2D: [[x,y,z], [x,y,z], ...])
  const nBottom = vBottom.map((e, i) => [0, -1, 0]);

  const vTopBottom = [...vTop, ...vBottom]

  const COLOR = [1,1,1]
  //v = [vTop]
  //console.log(vTop)
  //console.log(nTop)

  //console.log(vBottom)
  //console.log(nBottom)

  //const vSide = 0, 1, 3, 4,    1, 2, 5, 6,    2, 3, 6, 7,    3, 4, 7, 8

  //console.log(mod(7+1, 2*csSides))
  eTop = csIndices.map(i => [i, mod(i + 1, csSides)]) // top edges
  eBottom = csIndices.map(i => [i + csSides, mod(i + 1, csSides) + csSides]) // bottomedges

  eSides = eTop.map((e, i) => [...eTop[i], ...eBottom[i]])

  //console.log(eSides)
  //console.log(vTopBottom)

  vSides = eSides.flat().map((e, i) => vTopBottom[e])
  //nSides = csIndices.map((e, i) => Array(4).fill([dispX[i], 0, dispZ[i]])).flat()
  //nSides = csIndices.map((e, i) => [dispX[i], 0, dispZ[i]])
  nSides = csIndices.map((e, i) => [dispX[i], 0, dispZ[i]])

  //console.log(vSides)

  //console.log(dispX)
  //console.log(dispZ)
  //console.log(nSides)

  for (j=0;j<csSides;j++){
    //console.log([dispX[j], 0, dispZ[j]])  
    //console.log()
  }
  nSides = csIndices.map((e, i) => Array(4).fill(addVector3([dispX[i], 0, dispZ[i]], [0, 0, 0], [dispX[mod(i + 1, csSides)], 0,  dispZ[mod(i + 1, csSides)]])))
  //console.log(nSides)
  //console.log(nSides.flat())

  //console.log(eSides.map((e, i)=> vTopBottom[e]))

  //console.log(vSides)

  //v = [vSides.slice(0,3+1)]
  topVertTriangulationOrder = csIndices.map(i => {
    if ((i % 2) === 0) {
      return -(i / 2)
    } else {
      return (Math.trunc((i + 1) / 2))
    }
  }); // order in which to draw the vertices such that the top/bottom faces will be triangulated; ccw +ve, cw -ve

  topTriIndices = [...Array(csSides - 2).keys()] // array with one index per cross-section triangle (e.g. square => [0,1])
  topTriVertIndices = topTriIndices.map(i => topVertTriangulationOrder.slice(i + 3 - 3, i + 3)) // indices of individual vertices of the top triangles
  topTriVertPositions = topTriVertIndices.flat().map(i => csSides * 0 + mod(i, csSides)) // indices of top face made positive
  bottomTriVertPositions = topTriVertIndices.flat().map(i => csSides * 1 + mod(i, csSides)) //indices of bottom face made positive

  sideTriVertIndices = csIndices.map(i => [mod(i, csSides), mod(i + 1, csSides), mod(i, csSides) + csSides, mod(i + 1, csSides), mod(i, csSides) + csSides, mod(i + 1, csSides) + csSides])
  // indices of side faces (2D; one 6-element array per rectangular face)
  //console.log(sideTriVertIndices)

  // Indices of the vertices
  /*
  var indicesJS = [
    topTriVertPositions,
    bottomTriVertPositions,
    sideTriVertIndices.flat()
  ]*/

  //v = [vTop, vBottom, vSides]
  //v = [vTop]
  //console.log(vSides)
  //console.log(abcd)
  //v = [vTop, vBottom, vSides]


  v = [vTop, vBottom, vSides]
  //n = [nTop]

  //v = [vBottom]
  //n = [nBottom]

  //v = [vSides]
  //n = [nSides]

  //v = [vTop, vBottom, vSides]
  //v = [vSides]
  n = [nTop, nBottom, nSides]

  //n = [nTop, nBottom, nSides.flat()]


  


  //s1 = 1
  //s2 = 4

  //v = [vSides]//.slice(s1,s2)]//.slice(0, 7)]
  //n = [nSides]
  //console.log(v)
  //n = vSides.map(()=>[1,1,1])
  /*
  n = [
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 
    1, 0, -1, 1, 0, -1, 1, 0, -1, 1, 0, -1, 
    -1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1, 
    -1, 0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, 
    
  ]*/
  //n = [nBottom]
  
  const verticesJS = v // vertex coordinates flattened to 1d
  var vertices = new Float32Array(verticesJS.flat(Infinity)); // vertex coordinates in WebGL-compatible format

  //const normalsJS = n // vertex coordinates flattened to 1d
  //var normals = new Float32Array(normalsJS.flat(Infinity)); // vertex coordinates in WebGL-compatible format

  //console.log(verticesJS)
  //console.log(normalsJS)

  //console.log(v)
  //console.log(v.map((e, i) => [i, i+1, i+2]))
  //console.log(v.length)
  //var indicesJS = v.flat().map((e, i) => [mod(i+0, v.flat().length), mod(i+1, v.flat().length), mod(i+2, v.flat().length)])

  //sideTriVertPositions = v.flat().map((e, i) => [mod(i + 0, v.flat().length), mod(i + 1, v.flat().length), mod(i + 2, v.flat().length)])
  sideTriVertPositions = csIndices.map(i=>[i*4+0, i*4+1, i*4+2, i*4+1, i*4+2, i*4+3])
  //indicesJS = [...topTriVertPositions, ...bottomTriVertPositions, ...sideTriVertPositions]
  //console.log(sideTriVertPositions)
  //indicesJS = [...topTriVertPositions, ...bottomTriVertPositions]
  indicesJS = []
  //indicesJS = [topTriVertPositions, bottomTriVertPositions, ...sideTriVertPositions].flat(Infinity)
  //indicesJS = [...sideTriVertPositions]
  //console.log(v.map())

  /*
  var indicesJS = [
    0, 1, 2, 1, 2, 3,
  ]*/
  //var indicesJS = topTriVertPositions
  //var indicesJS = topTriVertPositions
  //var indicesJS = [...topTriVertPositions, ...bottomTriVertPositions, ...sideTriVertPositions]
  //var indicesJS = [...(sideTriVertPositions.slice(s1,s2))]
  //console.log(n)

  //console.log([...topTriVertPositions, ...bottomTriVertPositions])
  sideTriVertPositions = sideTriVertPositions.flat().map((e, i)=>e+2*csSides)
  //console.log(sideTriVertPositions)

  var indicesJS = [topTriVertPositions, bottomTriVertPositions, sideTriVertPositions]
  /*
  var indicesJS = [
     0,  1,  2,   1,  2,  3,
     4,  5,  6,   5,  6,  7,
     8,  9, 10,   9, 10, 11,
    12, 13, 14,  13, 14, 15,
    
  ]*/
  //console.log(indicesJS)
  var indices = new Uint8Array(
    indicesJS.flat(Infinity)
  );

  //console.log(verticesJS)
  //console.log(normalsJS)
  //console.log(indicesJS)
  colorsJS = new Array();
  colorsJS.push(verticesJS.flat().map(i => COLOR))

  //console.log(colorsJS)
  /*
  colorsJS = [
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
    0,1,1, 0,1,1, 0,1,1, 0,1,1, 
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 
  ]*/
  colors = new Float32Array(colorsJS.flat(Infinity))
/*
  normalsJS = [
     1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1, //prism face 1
     1, 0,-1,   1, 0,-1,   1, 0,-1,   1, 0,-1, //prism face 2
    -1, 0,-1,  -1, 0,-1,  -1, 0,-1,  -1, 0,-1, //prism face 3
    -1, 0, 1,  -1, 0, 1,  -1, 0, 1,  -1, 0, 1, //prism face 4
                                               //...
  ]*/

  //normals = colors

  //normalsJS = new Array();
  normals = new Float32Array(n.flat(Infinity))

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

function initAxesVertexBuffers(gl) {

  const gridLim = 2.0;

  var verticesColors = new Float32Array([
    // Vertex coordinates and color (for axes)
    -gridLim, 0.0, 0.0, 1.0, 1.0, 1.0,  // (x,y,z), (r,g,b) 
    gridLim, 0.0, 0.0, 1.0, 1.0, 1.0,
    0.0, gridLim, 0.0, 1.0, 1.0, 1.0,
    0.0, -gridLim, 0.0, 1.0, 1.0, 1.0,
    0.0, 0.0, -gridLim, 1.0, 1.0, 1.0,
    0.0, 0.0, gridLim, 1.0, 1.0, 1.0
  ]);
  var n = 6;

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
  //gl.drawArrays(gl.LINES, 0, n);

  gl.uniform1i(u_isLighting, true); // Will apply lighting

  // Set the vertex coordinates and color (for the cube)
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Rotate, and then translate
  modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)
  modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

  /*
  // Model the chair seat
  pushMatrix(modelMatrix);
    modelMatrix.scale(2.0, 0.5, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Model the chair back
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 1.25, -0.75);  // Translation
    modelMatrix.scale(2.0, 2.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  */

  // model the prism
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n)
}

function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix);

  // Pass the model matrix to the uniform variable
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Calculate the normal transformation matrix and pass it to u_NormalMatrix
  g_normalMatrix.setInverseOf(modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  //gl.drawElements(gl.LINES, n, gl.UNSIGNED_BYTE, 0);
  //gl.drawElements(gl.POINTS, n, gl.UNSIGNED_BYTE, 0);

  modelMatrix = popMatrix();
}
