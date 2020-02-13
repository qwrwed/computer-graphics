// scene root: cannot have transformations or model data
const root = new Object({
    children: [],
    draw() { Object.keys(this.children).forEach((key) => this.children[key].draw(new Matrix4)) },
})

// sceneNode class definition
// each sceneNode represents a node in the scene graph
// all sceneNodes can have any combination of the following:
//  -vertex buffers (prism shape)
//  -array of child sceneNodes
// all sceneNodes also have their own transformation (model matrix), which is applied to all children as well as itself

class sceneNode {
    constructor(args) {

        // unique id
        var uid = uniqueId()

        // define defaults
        const defaults = {
            uid: uid,
            noModel: false, // if true, has no model (so this sceneNode is for hierarchical grouping/transformations)
            sides: 4, // number of side faces or top edges the prism has (4 for cuboid)
            color: [0, 1, 0], // prism colour
            offset: false, // rotate prism about length by 1/2*sides rotations (e.g. rotate square 45 degrees, rotate triangle 60 degrees)
            fitInCircle: false, // true: contain top face within a 1-diameter circle. false: contain 1-diameter circle within top face
            name: `Unnamed sceneNode (${uid})`, // node name
            origin: [0, 0, 0], // scale/rotation origin
            hidden: false, // if true do not render model (for hiding)
            textureMode: 'none', // 'repeat' to show same texture on all side faces, 'stretch' to stretch single texture along faces
            imageSrc: undefined // path to image
        }

        // define prism attributes by overwriting defaults with given args
        this.opts = Object.assign({}, defaults, args);
        this.matrices = {}
        if (typeof (args) === 'undefined') {
            this.children = {}
        } else {
            this.children = Object.assign({}, {}, args.children)
        }

        // initialise matrices
        this.matrices.model = new Matrix4
        this.matrices.scale = new Matrix4
        this.matrices.rotation = new Matrix4
        this.matrices.translation = new Matrix4
        this.matrices.augmentedModelMatrix = new Matrix4

        //if the model is to be drawn, initialise vertex buffers
        if (!this.opts.noModel) {
            this.buffers = initPrismVertexBuffers(this.opts.sides, this.opts.color, this.opts.offset, this.opts.fitInCircle, this.opts.textureMode)
        }

        // if image source and image mode are given, init texture
        if ((typeof (this.opts.imageSrc) !== 'undefined') && ((new Set(['stretch', 'repeat'])).has(this.opts.textureMode))) {

            const [uniqueTexId, textureExists] = uniqueTexQuery(this.opts.imageSrc);
            this.texId = uniqueTexId;

            if (!textureExists) {
                var texture = gl.createTexture();   // Create a texture object
                texture.image = new Image();  // Create the image object
                var texId = this.texId; // create copy of variable detached from this context, to pass to onload callback
                texture.image.src = this.opts.imageSrc;
                texture.image.onload = function () {
                    // Flip the image's y axis
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

                    // Enable corresponding texture unit
                    gl.activeTexture(gl.TEXTURE0 + texId);

                    // Bind the texture object to the target
                    gl.bindTexture(gl.TEXTURE_2D, texture);

                    // Set the texture image
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);

                    // Generate mip maps (all textures are powers of 2)
                    gl.generateMipmap(gl.TEXTURE_2D)

                    // Set 'loaded' flag to true
                    image_sources[texId].loaded = true;

                };
            }
        }
    }

    // scale operation (takes 1 or 3 arguments)
    scale(x, y, z) {
        if ((typeof (z) === 'undefined') && (typeof (y) === 'undefined')) {
            z = x
            y = x
        }
        // scale from specified origin
        this.matrices.scale.translate(this.opts.origin[0], this.opts.origin[1], this.opts.origin[2])
        this.matrices.scale.scale(x, y, z)
        this.matrices.scale.translate(-this.opts.origin[0], -this.opts.origin[1], -this.opts.origin[2])
        this.updateModelMatrix()
    }

    // relative translation operation
    translate(x, y, z) {
        this.matrices.translation.translate(x, y, z)
        this.updateModelMatrix()
    }

    // absolute translation operation
    setTranslate(x, y, z) {
        this.matrices.translation.setTranslate(x, y, z)
    }

    // relative rotation operation
    rotate(theta, x, y, z) {
        // rotate about specified origin
        this.matrices.rotation.translate(this.opts.origin[0], this.opts.origin[1], this.opts.origin[2])
        this.matrices.rotation.rotate(theta, x, y, z)
        this.matrices.rotation.translate(-this.opts.origin[0], -this.opts.origin[1], -this.opts.origin[2])
        this.updateModelMatrix()
    }

    // absolute rotation operation
    setRotate(theta, x, y, z) {
        this.matrices.rotation.setRotate(0, x, y, z)
        this.rotate(theta, x, y, z)
        //this.matrices.rotation.translate(-this.opts.origin[0], -this.opts.origin[1], -this.opts.origin[2])    
    }

    // update model matrix after a transformation
    updateModelMatrix() {
        this.matrices.model = new Matrix4
        glMatrix.mat4.multiply(this.matrices.model.elements, (new Matrix4).elements, this.matrices.translation.elements)
        glMatrix.mat4.multiply(this.matrices.model.elements, this.matrices.model.elements, this.matrices.rotation.elements)
        glMatrix.mat4.multiply(this.matrices.model.elements, this.matrices.model.elements, this.matrices.scale.elements)
    }

    // draw function to be called on every render
    draw(parentModelMatrix) {

        // if texture is loaded, init texCoords array buffer, set sampler to this node's texture, and enable textures
        if ((typeof (this.texId) !== 'undefined') && (image_sources[this.texId].loaded)) {
            if (!initArrayBuffer('a_TexCoords', this.buffers.texCoords, 2, gl.FLOAT)) return -1;
            gl.uniform1i(uniforms.Sampler, this.texId);
            gl.uniform1i(uniforms.UseTextures, true);
        } else {
            gl.uniform1i(uniforms.UseTextures, false);
        }

        // multiply model matrix by parent's model matrix to propagate transformations down the scene graph
        if (typeof (parentModelMatrix) === 'undefined') {
            parentModelMatrix = new Matrix4 // identity matrix
        }
        this.matrices.augmentedModelMatrix = new Matrix4
        glMatrix.mat4.multiply(this.matrices.augmentedModelMatrix.elements, parentModelMatrix.elements, this.matrices.model.elements)

        // only draw self if needed    
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
                gl.uniformMatrix4fv(uniforms.ModelMatrix, false, this.matrices.augmentedModelMatrix.elements)

                // Calculate the normal transformation matrix and pass it to u_NormalMatrix
                this.matrices.normal = new Matrix4
                this.matrices.normal.setInverseOf(this.matrices.augmentedModelMatrix)
                this.matrices.normal.transpose()
                gl.uniformMatrix4fv(uniforms.NormalMatrix, false, this.matrices.normal.elements)

                // Draw the prism
                gl.drawElements(gl.TRIANGLES, this.buffers.indices.length, gl.UNSIGNED_BYTE, 0)
            }

            // draw all children
            Object.keys(this.children).forEach((key) => this.children[key].draw(this.matrices.augmentedModelMatrix))
        }
    }
}

// create vertex buffers for prism
function initPrismVertexBuffers(sides = 4, color = [1, 0, 0], offset = false, fitInCircle = false, textureMode = 'repeat') {
    // sides = 4

    const csIndices = [...Array(sides).keys()] // array of top vertex indices

    const radius = !fitInCircle
        // closest points on perimeter are 0.5 meters from center
        ? Math.sqrt(2) * 0.5 // xz-distance magnitude from origin to vertex
        // furthest points on perimeter are 0.5 meters from center
        : 0.5
    //closest points are side midpoints
    //furthest points are vertices

    const texRadius = radius / (Math.sqrt(2) ** !fitInCircle)

    const radAngles = csIndices.map(i => (i * (2 * Math.PI) / sides + !offset * Math.PI / sides)) // array of angles between current vertex/origin and first vertex/origin (radians)
    const dispX = radAngles.map(t => +Math.sin(t).toFixed(10)) // x displacement of each vertex calculated by angle
    const dispZ = radAngles.map(t => +Math.cos(t).toFixed(10)) // z displacement of each vertex calculated by angle
    const dispYAbs = 0.5 // y-distance magnitude from origin to top and bottom vertices/faces



    const texRadAngles = mod(sides, 2) ?
        csIndices.map(i => ((i) * (2 * Math.PI) / sides + offset * Math.PI / sides)) :
        csIndices.map(i => ((i - 1 + offset) * (2 * Math.PI) / sides + !offset * Math.PI / sides))

    const texDispU = texRadAngles.map(t => +Math.sin(t).toFixed(10))
    const texDispV = texRadAngles.map(t => +Math.cos(t).toFixed(10))

    const vTop = csIndices.map(i => [radius * dispX[i % sides], dispYAbs, radius * dispZ[i % sides]]) // array of vertex coordinates (2D: [[x,y,z], [x,y,z], ...])
    const nTop = vTop.map((e, i) => [0, 1, 0])
    const tTop = csIndices.map(i => [texRadius * texDispU[i % sides], texRadius * texDispV[i % sides]].map(e => e + 0.5)).reverse()
    for (var i = 1; i < sides / 2; i++) {
        tTop.push(tTop.shift())
    }

    const vBottom = csIndices.map(i => [radius * dispX[i % sides], -dispYAbs, radius * dispZ[i % sides]]) // array of vertex coordinates (2D: [[x,y,z], [x,y,z], ...])
    const nBottom = vBottom.map((e, i) => [0, -1, 0])
    const tBottom = csIndices.map(i => [texRadius * texDispU[i % sides], texRadius * texDispV[i % sides]].map(e => e + 0.5)).reverse()
    for (var i = 1; i < sides / 2; i++) {
        tBottom.push(tBottom.shift())
    }

    eTop = csIndices.map(i => [i, mod(i + 1, sides)]) // top edges
    eBottom = csIndices.map(i => [i + sides, mod(i + 1, sides) + sides]) // bottom edges
    eSides = eTop.map((e, i) => [...eTop[i], ...eBottom[i]]) // side edges

    const vTopBottom = [...vTop, ...vBottom]
    vSides = eSides.flat().map((e, i) => vTopBottom[e])
    nSides = csIndices.map((e, i) => Array(4).fill(add3Vectors([dispX[i], 0, dispZ[i]], [0, 0, 0], [dispX[mod(i + 1, sides)], 0, dispZ[mod(i + 1, sides)]])))

    var tSides
    if (textureMode === 'repeat') {
        tSides = csIndices.map(() => [[0, 1], [1, 1], [0, 0], [1, 0]])
    } else if (textureMode === 'stretch') {
        var addAmount = -offset*0.5
        tSides = csIndices.map((e) => [[(e-0.5+addAmount) / sides, 1], [(e + 0.5+addAmount) / sides, 1], [(e-0.5+addAmount) / sides, 0], [(e + 0.5+addAmount) / sides, 0]])
        tSides.push(tSides.shift())
    }



    v = [vTop, vBottom, vSides]
    n = [nTop, nBottom, nSides]
    t = [tTop, tTop, tSides]

    var vertices = new Float32Array(v.flat(Infinity)) // vertex coordinates in WebGL-compatible format
    var normals = new Float32Array(n.flat(Infinity))
    var texCoords = new Float32Array(t.flat(Infinity))

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

    return { indices, vertices, colors, normals, texCoords }
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
