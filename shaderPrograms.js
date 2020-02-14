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
  attribute vec2 a_TexCoords;
  varying vec4 v_Color;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  varying vec2 v_TexCoords;
  uniform bool u_isLighting;
  void main() {
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    gl_PointSize = 10.0;
    v_TexCoords = a_TexCoords;
    if(u_isLighting)
    {
       v_Position = vec3(u_ModelMatrix * a_Position); // vertex position in world coordinates
       vec3 lightDirection = normalize(u_LightPosition - v_Position);
       v_Normal = normalize((u_NormalMatrix * a_Normal).xyz);
    }
    v_Color = a_Color;
  }
`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_Color;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  uniform vec3 u_LightPosition;
  uniform vec3 u_LightColor;
  uniform vec3 u_AmbientLightColor;
  varying vec2 v_TexCoords;
  uniform sampler2D u_Sampler;
  uniform bool u_UseTextures;
  uniform bool u_modelIsLightSource;

  void main() {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse;
    if (u_modelIsLightSource) {
      nDotL = 1.0;
    }
    if (u_UseTextures) {
      vec4 TexColor = texture2D(u_Sampler, v_TexCoords);
      //diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;
      diffuse = u_LightColor * TexColor.rgb * (nDotL+0.3) * 1.2;
    } else {
      diffuse = u_LightColor * v_Color.rgb * (nDotL+0.3);
    }
    vec3 ambient = u_AmbientLightColor * v_Color.rgb;
    gl_FragColor = vec4(diffuse *(0.5+ambient), v_Color.a);
    //gl_FragColor = vec4(diffuse, v_Color.a);
  }
  `