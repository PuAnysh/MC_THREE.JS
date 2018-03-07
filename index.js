var container , stats;
var camera , scene , renderer;
var control ;
var objects = [];
var functionList = [];
var raycaster;
var keydown;
var mouse;
var plane;
var isShiftDown;
var keycode;

var directionalLight, theta; // 方向光源及其角度
var direction;
var step = 10;
var sphereLightMesh;
window.onload = init();
//android小人控制参数
//var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var android;
//==================模式标志=======
var playmode = 1;
//==================android小人跳跃--参数（定时器等）===================
var jumpSpeed  = 15;					//跳跃速度，值越大越慢（控制timer的时间）
var jumpHeight = 15;					//跳跃高度
var androidSize = 0.8;					//android小人大小
//=======
var timer;								//定时器
var jumpOver = true;					//是否处于不在空中状态（在空中不能跳跃）
var jumpBoolean;						//判断是处于跳跃的上升期还是下降期（true为上升期）
var initHeight = 0;						//Android小人的初始高度

//==================camera跟随Android小人--参数=========================
var cameraHeightY = 50;					//camera相对android的高度
var cameradistance = -100;				//camera相对android的前后距离
var loolahead = 100;					//camera观察android的前方提前量

//===========================障碍物=======================================
var block = [];							//记录障碍物的位置
var blockLength = 10;					//障碍物边长


//===========================结束=======================================


// the following code is from
var animOffset  = 0,   					// starting frame of animation
    walking         = false,
    duration        = 1000, 				// milliseconds to complete animation
    keyframes       = 20,   				// total number of animation frames
    interpolation   = duration / keyframes, // milliseconds per frame
    lastKeyframe    = 0,    				// previous keyframe
    currentKeyframe = 0;

function init() {
    // 获得显示区域
    container = document.getElementById("WebGL-output");
    if(container === null){
        console.log("Error on get DIV element");
    }
    // 生成场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcce0ff);
    scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
    // 相机构建
    camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 1, 10000 );
    camera.position.set( 1000, 50, 1000 );
    camera.lookAt( new THREE.Vector3() );
    // 轨道控件
    control = new THREE.OrbitControls(camera);
    //control.keys = { LEFT: 65, UP: 87, RIGHT: 68, BOTTOM: 83 };
    control.maxPolarAngle = Math.PI * 0.4;
    control.maxDistance = 7500;
    control.addEventListener('change' ,render);
    // 场景网格
    // 平面初始化
    var geometry = new THREE.PlaneBufferGeometry( 1280, 1280);
    geometry.rotateX( - Math.PI / 2 );
    // 外部文件加载---android小人
    var jsonLoader = new THREE.JSONLoader();
    jsonLoader.load( "models/android-animations.js", addModelToScene );
    // 草坪纹理
    var loader = new THREE.TextureLoader();
    var groundTexture = loader.load( 'textures/earth.png' );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 10, 10 );
    groundTexture.anisotropy = 16;

    var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: groundTexture } );
    plane = new THREE.Mesh( geometry, groundMaterial );
	plane.castShadow = true;
    plane.receiveShadow = true;

    scene.add( plane );
    objects.push(plane);
    
    // 光照系统
    theta = 60;
    setDirectionalLight();
	
    //scene.add( light );
    //光源标识小球
        var sphereLight = new THREE.SphereGeometry(5);
        var sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xac6c25});
        sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
        sphereLightMesh.castShadow = true;

        sphereLightMesh.position = new THREE.Vector3(0, 20, 0);
        scene.add(sphereLightMesh);

    // 渲染器的初始化
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    renderer.shadowMapEnabled = true; // 启用阴影选项
    container.appendChild(renderer.domElement);
    //状态获取
    stats = new Stats();
    container.appendChild(stats.dom);
    // 鼠标获取物体
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    // 事件初始化
    initEventListener();
    animate();

	
}

function animate() {

    requestAnimationFrame( animate );
	var rad = (Math.PI / 180) * theta;
	var x = 10000 * Math.cos(rad);
	var y = 10000 * Math.sin(rad);
	if(playmode === 0)
        control.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

    stats.update();
    update();
    render();

}
// 改变方向光源
function changeDirectionalLight() {

		
		var rad = (Math.PI / 180) * theta;
		var x = 10000 * Math.cos(rad);
		var y = 10000 * Math.sin(rad);
		direction = new THREE.Vector3(x, y , 100);
		theta = (theta + 0.5) % 360;
		
	}

function render() {
    for(var i = 0 ; i<functionList.length ; i++){
        var func = functionList[i];
        func();
    }
	theta += 0.01;
	// 光照小球动态坐标计算
	sphereLightMesh.position.z = -8;
    sphereLightMesh.position.y = +(270 * (Math.sin(theta / 100)));
    sphereLightMesh.position.x = 10 + (260 * (Math.cos(theta / 100)));
    directionalLight.position.copy(sphereLightMesh.position);
    renderer.render( scene, camera );

}



function initEventListener() {
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.offsetWidth, container.offsetHeight );

    render();

}

function onDocumentMouseDown(event) {
    if(keydown === 1){
        event.preventDefault();

        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( objects );
        if ( intersects.length > 0 ) {
            var intersect = intersects[ 0 ];
            if ( isShiftDown === true ) {
                if ( intersect.object != plane ) {

                    scene.remove( intersect.object );
                    removeBlock(intersect.object);
                    objects.splice( objects.indexOf( intersect.object ), 1 );
                    functionList.splice( objects.indexOf( intersect.object ), 1 );
                    render();


                }

            } else {
                var cube;
                switch (keycode)
                {
                    case  49:
                        cube = newMagmaCube(intersect);
                        scene.add( cube.voxel );
                        objects.push( cube.voxel );
                        addBlock(cube.voxel);
                        functionList.push(cube.func);
                        break;
                    case 50:
                        cube = newWaterCube(intersect);
                        scene.add( cube.voxel );
                        objects.push( cube.voxel );
                        addBlock(cube.voxel);
                        functionList.push(cube.func);
                        break;
                    case 52:
                        cube = newWoodCube(intersect);
                        cube.voxel.receiveShadow = true;
                        scene.add( cube.voxel );
                        objects.push( cube.voxel );
                        addBlock(cube.voxel);
                        functionList.push(cube.func);
                        break;
                    case 51:
                        cube = newRedCube(intersect);
                        cube.voxel.receiveShadow = true;
                        scene.add( cube.voxel );
                        objects.push( cube.voxel );
                        addBlock(cube.voxel);
                        functionList.push(cube.func);
                        break;
					case 53:
                        cube = newGrass(intersect);
                        scene.add( cube.voxel );
                        console.log(cube.voxel.position);
                        objects.push( cube.voxel );
                        addBlock(cube.voxel);
                        functionList.push(cube.func);
                        break;
                }

                render();

            }
        }



    }
}

function onDocumentKeyDown(event) {
    keydown = 1;
    switch( event.keyCode ) {

        case 16:
            isShiftDown = true;
            break;

    }
    keycode = event.keyCode;
}

function onDocumentKeyUp(event) {
    keydown = 0;
    switch( event.keyCode ) {

        case 16: isShiftDown = false; break;

    }
}



// 设置方向光光源
function setDirectionalLight() {
    scene.add( new THREE.AmbientLight( 0x666666 ) );
    var rad = (Math.PI / 180) * theta;
    var x = 10000 * Math.cos(rad);
    var y = 10000 * Math.sin(rad);

    var pointColor = "#ffffff";
    directionalLight = new THREE.DirectionalLight(pointColor);
    directionalLight.distance = 0;
    directionalLight.intensity = 0.5;
    directionalLight.shadowMapHeight = 1024;
    directionalLight.shadowMapWidth = 1024;
    directionalLight.position.set(x, y, 1000);
    directionalLight.castShadow = true;
    var d = 300;

    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    directionalLight.shadow.camera.far = 1000;
    scene.add(directionalLight);
}

// android 小人
function addModelToScene( geometry, materials )
{
    // for preparing animation
    for (var i = 0; i < materials.length; i++)
        materials[i].morphTargets = true;

    var material = new THREE.MeshFaceMaterial( materials );
    android = new THREE.Mesh( geometry, material );
    android.scale.set(androidSize,androidSize,androidSize);							//android小人的规模比例大小
    scene.add( android );
}
//跳跃，前进，后退，左转，右转
function update()
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
    // delta = change in time since last call (seconds)
    delta = clock.getDelta();
    var moveDistance = 50 * delta;
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

    //跳跃，前进，后退，左转，右转
    if ( keyboard.pressed(" ") && jumpOver){
        jumpBoolean = true;								//记录、判断android小人是处于上升期间还是下降区间
        initHeight = android.position.y;				//记录跳跃前的android高度
        jumpOver = false;								//判断是否还处于空中，在空中时，不能跳跃
        timer=window.setInterval("jump()",jumpSpeed);	//timer，使android小人缓慢上升，缓慢下降
    }
    if ( keyboard.pressed("s") ){
        if(!backIsBlock()){								//判断后方是否有障碍物
            android.translateZ( -moveDistance );
        }
    }
    if ( keyboard.pressed("w") ){
        if(!frontIsBlock()){							//判断前方是否有障碍物
            android.translateZ( moveDistance );
        }
    }
    if ( keyboard.pressed("a") )
        android.rotation.y += delta;					//android绕着本本身的y坐标旋转
    if ( keyboard.pressed("d") )
        android.rotation.y -= delta;

    var walkingKeys = ["w", "s", "a", "d"," "];
    for (var i = 0; i < walkingKeys.length; i++)
    {
        if ( keyboard.pressed(walkingKeys[i] ) ){
            walking = true;

            /*
             * 更新camera的位置，以及视点
             *（controls.update()会强制设置视点为中心，此操作后不能调用controls.update()）
             */
            var angle = android.rotation.y;
            var tempX = android.position.x + cameradistance * Math.sin(angle);
            var tempZ = android.position.z + cameradistance * Math.cos(angle);
            if(playmode === 1){
                camera.position.set(tempX,android.position.y + cameraHeightY,tempZ);
                camera.lookAt(new THREE.Vector3(android.position.x,android.rotation.y,android.position.z));
            }



            //在空中下落的时候使用，检测是否下方有障碍物，有的话停止下落
            if(jumpOver && android.position.y!=0 && !downIsBlock()){
                jumpBoolean = false;
                jumpOver = false;
                timer=window.setInterval("jump()",5);
            }
        }
    }

    stats.update();
}


//4个函数检测前后上下是否有障碍物
function frontIsBlock(){
    var blockX = parseInt(((1.05 * android.position.x - 0.05 * camera.position.x ) + 640) / 10);
    var blockZ = parseInt(((1.05 * android.position.z - 0.05 * camera.position.z ) + 640) / 10);
    var blockY = parseInt((android.position.y + 5) / 10);

    if("undefined" == typeof block[blockX]){
        return false;
    }
    if("undefined" == typeof block[blockX][blockY]){
        return false;
    }
    if("undefined" == typeof block[blockX][blockY][blockZ]){
        return false;
    }
    if(block[blockX][blockY][blockZ] != 1){
        return false;
    }


    return true;
}
function backIsBlock(){
    var blockX = parseInt(((0.95 * android.position.x + 0.05 * camera.position.x ) + 640) / 10);
    var blockZ = parseInt(((0.95 * android.position.z + 0.05 * camera.position.z ) + 640) / 10);
    var blockY = parseInt((android.position.y + 5) / 10);

    if("undefined" == typeof block[blockX]){
        return false;
    }
    if("undefined" == typeof block[blockX][blockY]){
        return false;
    }
    if("undefined" == typeof block[blockX][blockY][blockZ]){
        return false;
    }
    if(block[blockX][blockY][blockZ] != 1){
        return false;
    }
    return true;
}
function downIsBlock(){
    var blockX = parseInt((android.position.x + 640) / 10);
    var blockZ = parseInt((android.position.z + 640) / 10);
    var blockY = parseInt((android.position.y - 1) / 10);

    /*
    console.log(android.position.y);
    console.log(blockY);
    console.log("pengpeng");*/

    if("undefined" == typeof block[blockX]){
        return false;
    }
    if("undefined" == typeof block[blockX][blockY]){
        return false;
    }
    if("undefined" == typeof block[blockX][blockY][blockZ]){
        return false;
    }
    if(block[blockX][blockY][blockZ] != 1){
        return false;
    }
    return true;
}
function upIsBlock(){
    var blockX = parseInt((android.position.x + 640) / 10);
    var blockZ = parseInt((android.position.z + 640) / 10);
    var blockY = parseInt((android.position.y + 11) / 10);

    if("undefined" == typeof block[blockX]){
        return false;
    }
    if("undefined" == typeof block[blockX][blockY]){
        return false;
    }
    if("undefined" == typeof block[blockX][blockY][blockZ]){
        return false;
    }
    if(block[blockX][blockY][blockZ] != 1){
        return false;
    }
    return true;
}
//跳跃函数
function jump(){

    //更新camera的位置，以及视点
    var angle = android.rotation.y;
    var tempX = android.position.x + cameradistance * Math.sin(angle);
    var tempZ = android.position.z + cameradistance * Math.cos(angle);
    if(playmode === 1){
        camera.position.set(tempX,android.position.y + cameraHeightY,tempZ);
        camera.lookAt(new THREE.Vector3(android.position.x,android.rotation.y,android.position.z));
    }



    if(jumpBoolean){									//跳跃上升期
        if(android.position.y < jumpHeight + initHeight && !upIsBlock()){
            android.position.y +=1;						//y坐标++，Android小人位置上升
        }
        else{
            jumpBoolean =! jumpBoolean;					//跳跃上升期结束，标记下个时期为跳跃下降期
        }
    }
    else{												//跳跃下降期
        if(android.position.y > 0 && !downIsBlock()){
            android.position.y -=1;						//y坐标++，Android小人位置下降
        }
        else{
            jumpOver = true;							//跳跃结束
            window.clearTimeout(timer);     			//定时器清除
        }
    }
}
// 障碍物添加
function addBlock(cube) {

    var x = cube.position.x;
    var y = cube.position.y;
    var z = cube.position.z;
    //console.log(x,y,z);
    i = parseInt((x + 640)/10);
    j = parseInt(y/10);
    k = parseInt((z + 640)/10);
    if("undefined" === typeof block[i]){
        block[i]=[];
    }
    if("undefined" === typeof block[i][j]){
        block[i][j]=[];
    }
    block[i][j][k]=1;
}

// 障碍物删除
function removeBlock(cube) {

    var x = cube.position.x;
    var y = cube.position.y;
    var z = cube.position.z;
    //console.log(x,y,z);
    i = parseInt((x + 640)/10);
    j = parseInt(y/10);
    k = parseInt((z + 640)/10);
    if("undefined" === typeof block[i]){
        block[i]=[];
    }
    if("undefined" === typeof block[i][j]){
        block[i][j]=[];
    }
    block[i][j][k]=0;
}