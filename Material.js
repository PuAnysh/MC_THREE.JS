// ==============================================方块的顶点着色器
var vertex_shader = "void main()\n" +
    "    {\n" +
    "    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n" +
    "    }";
//=============================================== 岩浆的着色器
var fragment_shader_Magma = "uniform float time;\n" +
    "uniform vec2 resolution;\n" +
    "vec2 random2( vec2 p ) {\n" +
    "    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);\n" +
    "}\n" +
    "\n" +
    "float noise(vec2 st) {\n" +
    "    vec2 i = floor(st);\n" +
    "    vec2 f = fract(st);\n" +
    "\n" +
    "    vec2 u = f*f*(3.0-2.0*f);\n" +
    "\n" +
    "    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), \n" +
    "                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),\n" +
    "                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), \n" +
    "                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);\n" +
    "}\n" +
    "\n" +
    "vec3 magmaFunc(vec3 color, vec2 uv, float detail, float power,\n" +
    "              float colorMul, float glowRate, bool animate, float noiseAmount)\n" +
    "{\n" +
    "    vec3 rockColor = vec3(0.09 + abs(sin(time * .75)) * .03, 0.02, .02);\n" +
    "    float minDistance = 1.;\n" +
    "    uv *= detail;\n" +
    "    \n" +
    "    vec2 cell = floor(uv);\n" +
    "    vec2 frac = fract(uv);\n" +
    "    \n" +
    "    for (int i = -1; i <= 1; i++) {\n" +
    "        for (int j = -1; j <= 1; j++) {\n" +
    "        \tvec2 cellDir = vec2(float(i), float(j));\n" +
    "            vec2 randPoint = random2(cell + cellDir);\n" +
    "            randPoint += noise(uv) * noiseAmount;\n" +
    "            randPoint = animate ? 0.5 + 0.5 * sin(time * .35 + 6.2831 * randPoint) : randPoint;\n" +
    "            minDistance = min(minDistance, length(cellDir + randPoint - frac));\n" +
    "        }\n" +
    "    }\n" +
    "    \t\n" +
    "    float powAdd = sin(uv.x * 2. + time * glowRate) + sin(uv.y * 2. + time * glowRate);\n" +
    "\tvec3 outColor = vec3(color * pow(abs(minDistance), power + powAdd * .95) * colorMul);\n" +
    "    outColor.rgb = mix(rockColor, outColor.rgb, minDistance);\n" +
    "    return outColor;\n" +
    "}\n" +
    "\n" +
    "void mainImage( out vec4 fragColor, in vec2 fragCoord )\n" +
    "{    \n" +
    "\tvec2 uv = fragCoord / resolution.xy;\n" +
    "    uv.x *= resolution.x / resolution.y;\n" +
    "    uv.x += time * .01;\n" +
    "    fragColor.rgb += magmaFunc(vec3(1.5, .45, 0.), uv, 3.,  2.5, 1.15, 1.5, false, 1.5);\n" +
    "    fragColor.rgb += magmaFunc(vec3(1.5, 0., 0.), uv, 6., 3., .4, 1., false, 0.);\n" +
    "    fragColor.rgb += magmaFunc(vec3(1.2, .4, 0.), uv, 8., 4., .2, 1.9, true, 0.5);\n" +
    "\tfragColor += vec4(0.0,0.0,0.0,1.0);\n" +
    "}\n" +
    "void main(void)\n" +
    "{\n" +
    "\tmainImage(gl_FragColor , gl_FragCoord.xy);\n" +
    "}";
//=============================================================================== 水纹的着色器
var fragment_shader_Water = "uniform float time;\n" +
    "uniform vec2 resolution;\n" +
    "\n" +
    "#define TAU 6.28318530718\n" +
    "#define MAX_ITER 5\n" +
    "\n" +
    "\n" +
    "void mainImage( out vec4 fragColor, in vec2 fragCoord ) \n" +
    "{\n" +
    "\tfloat ctime = time * 0.5+23.0;\n" +
    "    // uv should be the 0-1 uv of texture...\n" +
    "\tvec2 uv = fragCoord.xy / resolution.xy;\n" +
    "    \n" +
    "#ifdef SHOW_TILING\n" +
    "\tvec2 p = mod(uv*TAU*2.0, TAU)-250.0;\n" +
    "#else\n" +
    "    vec2 p = mod(uv*TAU, TAU)-250.0;\n" +
    "#endif\n" +
    "\tvec2 i = vec2(p);\n" +
    "\tfloat c = 1.0;\n" +
    "\tfloat inten = .005;\n" +
    "\n" +
    "\tfor (int n = 0; n < MAX_ITER; n++) \n" +
    "\t{\n" +
    "\t\tfloat t = ctime * (1.0 - (3.5 / float(n+1)));\n" +
    "\t\ti = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));\n" +
    "\t\tc += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));\n" +
    "\t}\n" +
    "\tc /= float(MAX_ITER);\n" +
    "\tc = 1.17-pow(abs(c), 1.4);\n" +
    "\tvec3 colour = vec3(pow(abs(c), 8.0));\n" +
    "    colour = clamp(colour + vec3(0.0, 0.35, 0.5), 0.0, 1.0);\n" +
    "    \n" +
    "\n" +
    "\t#ifdef SHOW_TILING\n" +
    "\t// Flash tile borders...\n" +
    "\tvec2 pixel = 2.0 / resolution.xy;\n" +
    "\tuv *= 2.0;\n" +
    "\n" +
    "\tfloat f = floor(mod(time*0.5, 2.0)); \t// Flash value.\n" +
    "\tvec2 first = step(pixel, uv) * f;\t\t   \t// Rule out first screen pixels and flash.\n" +
    "\tuv  = step(fract(uv), pixel);\t\t\t\t// Add one line of pixels per tile.\n" +
    "\tcolour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line\n" +
    "\t\n" +
    "\t#endif\n" +
    "\tfragColor = vec4(colour, 1.0);\n" +
    "}\n" +
    "void main(void)\n" +
    "{\n" +
    "\tmainImage(gl_FragColor , gl_FragCoord.xy);\n" +
    "}";
// ========================================================  围栏顶点着色器
var vertex_shader_Fence = "varying vec2 vUV;\n" +
    "\n" +
    "\t\t\tvoid main() {\n" +
    "\n" +
    "\t\t\t\tvUV = 0.75 * uv;\n" +
    "\n" +
    "\t\t\t\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n" +
    "\n" +
    "\t\t\t\tgl_Position = projectionMatrix * mvPosition;\n" +
    "\n" +
    "\t\t\t}";
// ======================================================== 围栏片源着色器
var fragment_shader_Fence = "#include <packing>\n" +
    "\n" +
    "uniform sampler2D texture;\n" +
    "varying vec2 vUV;\n" +
    "\n" +
    "void main() {\n" +
    "\n" +
    "vec4 pixel = texture2D( texture, vUV );\n" +
    "\n" +
    "if ( pixel.a < 0.5 ) discard;\n" +
    "\n" +
    "gl_FragData[ 0 ] = packDepthToRGBA( gl_FragCoord.z );\n" +
    "}";
/////////////////////////////////////////////
var Lightcnt = 0;

//////////////////////////////
function createMaterial(vertexShader, fragmentShader) {
    //var attributes = {};
    var uniforms = {
        time: {type: 'f', value: 0.2},
        scale: {type: 'f', value: 0.2},
        alpha: {type: 'f', value: 0.6},
        resolution: {type: "v2", value: new THREE.Vector2()}
    };

    uniforms.resolution.value.x = window.innerWidth;
    uniforms.resolution.value.y = window.innerHeight;

    var meshMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      //  transparent: true

    });


    return meshMaterial;
}
function newMagmaCube(intersect) {
    var cubeGeometry = new THREE.BoxGeometry( 10, 10, 10 );
    var cubeMaterial = createMaterial(vertex_shader,fragment_shader_Magma);
    var o = new Object();

    o.voxel = new THREE.Mesh( cubeGeometry, cubeMaterial );

    o.voxel.position.copy( intersect.point ).add( intersect.face.normal );
    o.voxel.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar(5);
    o.voxel.castShadow = true;
    o.voxel.reciveShadow = true;
    o.func = function () {
        o.voxel.material.uniforms.time.value+=0.05;
    };
    o.remove =function(scene) {
        scene.remove(o.voxel);
    };
    return o;
}
function newWaterCube(intersect) {
    var cubeGeometry = new THREE.BoxGeometry( 10, 10, 10 );
    var cubeMaterial = createMaterial(vertex_shader,fragment_shader_Water);
    //var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff80, overdraw: 0.5 } );
    var cubeMaterial_Lambert = new THREE.MeshLambertMaterial( { color: 0x00ff80, overdraw: 0.5 , blending: THREE.MultiplyBlending } );
    var o = new Object();
    o.voxel = new THREE.Mesh( cubeGeometry, cubeMaterial );
    //o.voxel.customLambertMaterial = cubeMaterial;
    //o.voxel = new THREE.SceneUtils.createMultiMaterialObject(cubeGeometry, [cubeMaterial , cubeMaterial_Lambert]);

    o.voxel.position.copy( intersect.point ).add( intersect.face.normal );
    o.voxel.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar(5);
    o.voxel.castShadow = true;
    o.voxel.reciveShadow = true;
    o.func = function () {
        o.voxel.material.uniforms.time.value+=0.01;
    };
    o.remove =function(scene) {
        scene.remove(o.voxel);
    };
    return o;
}

function newLight(intersect) {
    // Fence material
    if(Lightcnt > 10) return null;
    Lightcnt++;
    var loader = new THREE.TextureLoader();
    var lightTexture = loader.load( "textures\\FIL1696.png");
    lightTexture.wrapS = lightTexture.wrapT = THREE.RepeatWrapping;
    lightTexture.anisotropy = 16;

    var lightMaterial = new THREE.MeshPhongMaterial( {
        specular: 0x030303,
        map: lightTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5
    } );

    var lightGeometry = new THREE.SphereGeometry(5);
    lightGeometry.dynamic = true;

    var uniforms = {
        texture:  { value: lightTexture }
    };

    // fence mesh
    var o = new Object();
    o.voxel = new  THREE.Object3D();
    var sp = new THREE.Mesh( lightGeometry, lightMaterial );
    sp.castShadow = true;
    sp.customDepthMaterial = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertex_shader_Fence,
        fragmentShader: fragment_shader_Fence,
        side: THREE.DoubleSide
    } );
    sp.position.copy( intersect.point ).add( intersect.face.normal );
    sp.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar(5);
    o.voxel.add(sp);
    //
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.castShadow = true;
    spotLight.position.copy( intersect.point ).add( intersect.face.normal );
    spotLight.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar(5);
    o.voxel.add(spotLight);
    o.voxel.castShadow = true;
    o.remove = function (scene) {
        scene.remove(o.voxel.sp);
        scene.remove(o.voxel.spotLight);
        Lightcnt--;
        console.log(Lightcnt );
    };

    o.func = function () {
        o.voxel.rotateY = 0.1;
    };
    return o;
}


function newWoodCube(intersect) {
    var cubeGeometry = new THREE.BoxGeometry( 10, 10, 10 );
    var loader = new THREE.TextureLoader();
    var Texture = loader.load( "textures\\hardwood2_diffuse.jpg");
    Texture.wrapS = Texture.wrapT = THREE.RepeatWrapping;
    Texture.anisotropy = 16;
    var cubeMaterial = new THREE.MeshPhongMaterial( {
        overdraw: 0.5 ,
        map : Texture
    } );
    var o = new Object();
    o.voxel = new THREE.Mesh( cubeGeometry, cubeMaterial );
    o.voxel.position.copy( intersect.point ).add( intersect.face.normal );
    o.voxel.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar(5);
    o.voxel.castShadow = true;
    o.voxel.reciveShadow = true;
    o.func = function () {

    };
    return o;
}


function newRedCube(intersect) {
    var cubeGeometry = new THREE.BoxGeometry( 10, 10, 10 );
    var loader = new THREE.TextureLoader();
    var Texture = loader.load( "textures\\hongz.jpg");
    Texture.wrapS = Texture.wrapT = THREE.RepeatWrapping;
    Texture.anisotropy = 16;
    var cubeMaterial = new THREE.MeshPhongMaterial( {
        overdraw: 0.5 ,
        map : Texture
    } );
    var o = new Object();
    o.voxel = new THREE.Mesh( cubeGeometry, cubeMaterial );
    o.voxel.position.copy( intersect.point ).add( intersect.face.normal );
    o.voxel.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar(5);
    o.voxel.castShadow = true;
    o.voxel.reciveShadow = true;
    o.func = function () {

    };
    return o;
}

function newGrass(intersect) {
    var cubeGeometry = new THREE.BoxGeometry( 10, 10, 10 );
    var loader = new THREE.TextureLoader();
    var Texture1 = loader.load( "textures\\grasslight-big.jpg");
    var Texture2 = loader.load( "textures\\earth.png");
    Texture1.wrapS = Texture1.wrapT = THREE.RepeatWrapping;
    Texture1.anisotropy = 16;
    Texture2.wrapS = Texture2.wrapT = THREE.RepeatWrapping;
    Texture2.anisotropy = 16;
    var cubeMaterial1 = new THREE.MeshPhongMaterial( {
        overdraw: 0.5 ,
        map : Texture1
    } );
    var cubeMaterial2 = new THREE.MeshPhongMaterial( {
        overdraw: 0.5 ,
        map : Texture2
    } );
    var material = new THREE.MeshFaceMaterial(
        [cubeMaterial2,
            cubeMaterial2,
            cubeMaterial1,
            cubeMaterial2,
            cubeMaterial2,
            cubeMaterial2]);
    var o = new Object();
    o.voxel = new THREE.Mesh( cubeGeometry, material );
    o.voxel.position.copy( intersect.point ).add( intersect.face.normal );
    o.voxel.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar(5);
    o.voxel.castShadow = true;
    o.voxel.reciveShadow = true;
    o.func = function () {

    };
    return o;
}