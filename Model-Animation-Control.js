var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var android;

var directionalLight, theta;    // 方向光源

//=================android小人跳跃（定时器等）===================
var timer;								//定时器
var jumpOver = true;					//是否处于不在空中状态（在空中不能跳跃）
var jumpBoolean;						//判断是处于跳跃的上升期还是下降期（true为上升期）
var initHeight;							//Android小人的初始高度
//================================================================

// the following code is from
var animOffset  = 0,   					// starting frame of animation
	walking         = false,
	duration        = 1000, 				// milliseconds to complete animation
	keyframes       = 20,   				// total number of animation frames
	interpolation   = duration / keyframes, // milliseconds per frame
	lastKeyframe    = 0,    				// previous keyframe
	currentKeyframe = 0;

// FUNCTIONS 		
function init()
{
	// SCENE
	scene = new THREE.Scene();

	// ========================================================================================照相机
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);

	// ========================================================================================渲染器
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );


	// =========================================================================================
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });


	// =========================================================================================控制类（鼠标等）
	controls = new THREE.OrbitControls( camera, renderer.domElement );


	// =========================================================================================性能插件
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	// ==========================================================================================光照
	// var light = new THREE.PointLight(0xFFFFFF);
	// light.position.set(-500,200,100);
	// scene.add(light);

    /*方向光光源*/
    theta = 0;
	//scene.add( new THREE.AmbientLight( 0x666666 ) );
    //setDirectionalLight();


    // ==========================================================================================地面
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
    floor.castShadow = true;
	floor.receiveShadow = true;
	scene.add(floor);


	// ===========================================================================================天空盒，雾气效果
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	// scene.add(skyBox);
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

	////////////
	// CUSTOM //
	////////////
	//=============================================================================================外部模型加载
	var jsonLoader = new THREE.JSONLoader();
	jsonLoader.load( "models/android-animations.js", addModelToScene );
	// addModelToScene function is called back after model has loaded

	//==============================================================================================环境光源
	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

	animate();

    setInterval("changeDirectionalLight()","1000");//定时执行
}

function addModelToScene( geometry, materials )
{
	// for preparing animation
	for (var i = 0; i < materials.length; i++)
		materials[i].morphTargets = true;

	var material = new THREE.MeshFaceMaterial( materials );
	android = new THREE.Mesh( geometry, material );
	android.scale.set(10,10,10);							//android小人的规模比例大小
	android.castShadow = true;
	android.receiveShadow = true;
	scene.add( android );
}

function animate()
{
	requestAnimationFrame( animate );
	render();
	update();
}

function update()
{
	// delta = change in time since last call (seconds)
	delta = clock.getDelta();
	var moveDistance = 100 * delta;
	walking = false;

	if (Gamepad.supported)
	{
		var pads = Gamepad.getStates();
		var pad = pads[0]; // assume only 1 player.
		if (pad)
		{
			// adjust for deadzone.
			if (Math.abs(pad.leftStickX + pad.rightStickX) > 0.3)
			{
				android.rotation.y -= delta * (pad.leftStickX + pad.rightStickX);
				walking = true;
			}
			if (Math.abs(pad.leftStickY + pad.rightStickY) > 0.2)
			{
				android.translateZ( -moveDistance * (pad.leftStickY + pad.rightStickY) );
				walking = true;
			}
			if ( pad.faceButton0 || pad.faceButton1 || pad.faceButton2 || pad.faceButton3 || pad.select || pad.start )
			{
				android.position.set(0,0,0);
				android.rotation.set(0,0,0);
			}
		}
	}

	// move forwards / backwards
	if ( keyboard.pressed("s") )
		android.translateZ( -moveDistance );
	if ( keyboard.pressed("w") )
		android.translateZ(  moveDistance );
	if ( keyboard.pressed("a") )
		android.rotation.y += delta;
	if ( keyboard.pressed("d") )
		android.rotation.y -= delta;
	if ( keyboard.pressed(" ") && jumpOver){
		jumpBoolean = true;
		initHeight = android.position.y;
		jumpOver = false;
		timer=window.setInterval("jump()",5);
	}

	var walkingKeys = ["w", "s", "a", "d", " "];
	for (var i = 0; i < walkingKeys.length; i++)
	{
		if ( keyboard.pressed(walkingKeys[i]) )
			walking = true;
	}

	controls.update();
	stats.update();
}
function jump(){
	var jumpHeight = 50;								//跳跃高度
	if(jumpBoolean){									//跳跃上升期
		if(android.position.y < jumpHeight + initHeight){
			android.position.y +=2;						//y坐标++，Android小人位置上升
		}
		else{
			jumpBoolean =! jumpBoolean;
		}
	}
	else{												//跳跃下降期
		if(android.position.y > initHeight){
			android.position.y -=2;						//y坐标++，Android小人位置下降
		}
		else{
			jumpOver = true;							//跳跃结束
			window.clearTimeout(timer);     			//定时器清除
		}
	}
}




function render()
{
	if ( android && walking ) // exists / is loaded 
	{
		// Alternate morph targets
		time = new Date().getTime() % duration;
		keyframe = Math.floor( time / interpolation ) + animOffset;
		if ( keyframe != currentKeyframe )
		{
			android.morphTargetInfluences[ lastKeyframe ] = 0;
			android.morphTargetInfluences[ currentKeyframe ] = 1;
			android.morphTargetInfluences[ keyframe ] = 0;
			lastKeyframe = currentKeyframe;
			currentKeyframe = keyframe;
		}
		android.morphTargetInfluences[ keyframe ] =
			( time % interpolation ) / interpolation;
		android.morphTargetInfluences[ lastKeyframe ] =
			1 - android.morphTargetInfluences[ keyframe ];
	}
    //var t2 = window.setInterval("changeDirectionalLight()",3000);
	renderer.render( scene, camera );
}

// 改变方向光源
function changeDirectionalLight() {
    
    //scene.remove(directionalLight);
    var rad = (Math.PI / 180) * theta;
    if(theta === 0) setDirectionalLight();
    if(theta === 180) scene.remove(directionalLight);
    var x = 10000 * Math.cos(rad);
    var y = 10000 * Math.sin(rad);
    directionalLight.position.set(x, y , 0);
    //directionalLight.update();
    theta+=5;
    theta %= 360;
    render();
    //setDirectionalLight();
}

// 设置方向光光源
function setDirectionalLight() {
    // if (0 <= theta && theta <= 180) {
    //     var rad = (Math.PI / 180) * theta;
    //     var x = 10000 * Math.cos(rad);
    //     var y = 10000 * Math.sin(rad);
		/*
        directionalLight = new THREE.DirectionalLight(0xff0000, 1.75);
        directionalLight.position.set(x, y, 0);
        directionalLight.castShadow = true;
        directionalLight.shadowCameraNear = 2;
        directionalLight.shadowCameraFar = 200;
        directionalLight.shadowCameraLeft = -50;
        directionalLight.shadowCameraRight = 50;
        directionalLight.shadowCameraTop = 50;
        directionalLight.shadowCameraBottom = -50;

        directionalLight.distance = 0;
        directionalLight.intensity = 0.5;
        directionalLight.shadowMapHeight = 1024;
        directionalLight.shadowMapWidth = 1024;

        scene.add(directionalLight);*/

        directionalLight = new THREE.DirectionalLight( 0xdfebff, 1.75 );
        directionalLight.position.set( 10000, 0, 0 );
        directionalLight.position.multiplyScalar( 1.3 );

        directionalLight.castShadow = true;

        directionalLight.shadow.shadowMapHeight = 1024;
        directionalLight.shadow.shadowMapWidth = 1024;

		var d = 300;

        directionalLight.shadow.camera.left = - d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = - d;

        directionalLight.shadow.camera.far = 1000;

		scene.add( directionalLight );
    // }
    // theta = (theta + 5) % 360;
}
