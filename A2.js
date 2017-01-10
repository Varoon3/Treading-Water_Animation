THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}


var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x0f2851); // blue background colour
document.body.appendChild(renderer.domElement);


var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(-28,10,28);
camera.lookAt(scene.position);
scene.add(camera);


var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;


function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();


var floorTexture = new THREE.ImageUtils.loadTexture('images/seafloor.jpeg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1, 1);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(30, 30);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = 0;
floor.rotation.x = Math.PI / 2;
scene.add(floor);




var normalMaterial = new THREE.MeshNormalMaterial();


var squidMatrix = {type: 'm4', value: new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,3.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  )};
var octopusMaterial = new THREE.ShaderMaterial({
  uniforms:{
    squidMatrix: squidMatrix,
  },
});

var shaderFiles = [
  'glsl/octopus.vs.glsl',
  'glsl/octopus.fs.glsl'
];
new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  octopusMaterial.vertexShader = shaders['glsl/octopus.vs.glsl'];
  octopusMaterial.fragmentShader = shaders['glsl/octopus.fs.glsl'];
})


function loadOBJ(file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
  var onProgress = function(query) {
    if ( query.lengthComputable ) {
      var percentComplete = query.loaded / query.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
  };

  var onError = function() {
    console.log('This shit will not load ' + file);
  };

  var loader = new THREE.OBJLoader();
  loader.load(file, function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
    object.position.set(xOff,yOff,zOff);
    object.rotation.x = xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale,scale,scale);
    scene.add(object);
  }, onProgress, onError);
  
}


loadOBJ('obj/octopus_08_A.obj',octopusMaterial,1.0,0,0,0,0,0,0);


//Eyes
var eyeGeometry = new THREE.SphereGeometry(1.0,64,64);
var eye_R = new THREE.Mesh(eyeGeometry,normalMaterial);
//This Matrix for the right eye includes translation and scale
var eyeTSMatrix_R = new THREE.Matrix4().set(
  0.5,0.0,0.0,-0.2, 
  0.0,0.5,0.0,4.1, 
  0.0,0.0,0.5,-0.92, 
  0.0,0.0,0.0,1.0
  );
//Here we relate the eye with the octopus by multiplying their matrices
var octopusEye_RMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, eyeTSMatrix_R);
eye_R.setMatrix(octopusEye_RMatrix);
scene.add(eye_R);
//Right eye pupil translation and scale matrix
var pupilMatrix_R = new THREE.Matrix4().set(
  0.35,0.0,0.0,0.0, 
  0.0,0.35,0.0,0.0, 
  0.0,0.0,0.15,-0.9, 
  0.0,0.0,0.0,1.0
  );
var cosTheta = Math.cos(Math.PI * (-50 /180.0));
var sinTheta = Math.sin(Math.PI * (-50 /180.0));
//This is a rotation matrix for the right pupil
var pupilRotMatrix_R = new THREE.Matrix4().set(
  cosTheta,0.0,-sinTheta,0.0, 
  0.0,1.0,0.0,0.0, 
  sinTheta,0.0,cosTheta,0.0, 
  0.0,0.0,0.0,1.0
  );
var pupilTSRMatrix_R = new THREE.Matrix4().multiplyMatrices(pupilRotMatrix_R, pupilMatrix_R);
var eyePupilMatrix_R = new THREE.Matrix4().multiplyMatrices(octopusEye_RMatrix, pupilTSRMatrix_R);
var pupil_R = new THREE.Mesh(eyeGeometry,normalMaterial);
pupil_R.setMatrix(eyePupilMatrix_R);
scene.add(pupil_R);

var eye_L = new THREE.Mesh(eyeGeometry,normalMaterial);
//Left eye translation and scale matrix
var eyeTSMatrix_L = new THREE.Matrix4().set(
  0.5,0.0,0.0,-0.2, 
  0.0,0.5,0.0,4.1, 
  0.0,0.0,0.5,0.92, 
  0.0,0.0,0.0,1.0
  );
var octopusEye_LMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, eyeTSMatrix_L);
eye_L.setMatrix(octopusEye_LMatrix);
scene.add(eye_L);
//Left eye pupil translation and scale matrix
var pupilMatrix_L = new THREE.Matrix4().set(
  0.35,0.0,0.0,0.0, 
  0.0,0.35,0.0,0.0, 
  0.0,0.0,0.15,-0.9, 
  0.0,0.0,0.0,1.0
  );
cosTheta = Math.cos(Math.PI * (-130 /180.0));
sinTheta = Math.sin(Math.PI * (-130 /180.0));
var pupilRotMatrix_L = new THREE.Matrix4().set(
  cosTheta,0.0,-sinTheta,0.0, 
  0.0,1.0,0.0,0.0, 
  sinTheta,0.0,cosTheta,0.0, 
  0.0,0.0,0.0,1.0
  );
var pupilTSRMatrix_L = new THREE.Matrix4().multiplyMatrices(pupilRotMatrix_L, pupilMatrix_L);
var eyePupilMatrix_L = new THREE.Matrix4().multiplyMatrices(octopusEye_LMatrix, pupilTSRMatrix_L);
var pupil_L = new THREE.Mesh(eyeGeometry,normalMaterial);
pupil_L.setMatrix(eyePupilMatrix_L);
scene.add(pupil_L);


//Tentacle socket
var tentacleSocketMatrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,-2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,2.4, 
  0.0,0.0,0.0,1.0
  );
cosThetaSocket = Math.cos(Math.PI * (-22.5/180.0));
sinThetaSocket = Math.sin(Math.PI * (-22.5/180.0));
var tentacleSocketRotMatrix = new THREE.Matrix4().set(
  cosThetaSocket,0.0,-sinThetaSocket,0.0, 
  0.0,1.0,0.0,0.0, 
  sinThetaSocket,0.0,cosThetaSocket,0.0, 
  0.0,0.0,0.0,1.0
  );
var tentacleSRM = new THREE.Matrix4().multiplyMatrices(tentacleSocketRotMatrix, tentacleSocketMatrix);
var octopusSocketMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, tentacleSRM);
var tentacleSocketGeometry = new THREE.Geometry();
tentacleSocketGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
var tentacleSocketMaterial = new THREE.PointCloudMaterial( { size: 10, sizeAttenuation: false, color :0xff0000} );
var tentacleSocket = new THREE.PointCloud( tentacleSocketGeometry, tentacleSocketMaterial );
tentacleSocket.setMatrix(octopusSocketMatrix);
scene.add(tentacleSocket);


//--------------------------------------------------------------------------



//Create Array of Tentacles
var tentacleFirstSet = [];
var tentacleSecondSet = [];
var tentacleThirdSet = [];

var jointsFirstSet = [];
var jointsSecondSet = [];
var jointsThirdSet = [];

//Tentacle Object
var NumberofJoints = 8;

//Identity Matrix
var identityMatrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0);



//Add Set of Tenctacles to the Array
function addSet(arr, radiusTop, radiusBottom, height, segmentsRadius){
   var i = 0;

   for (; i < NumberofJoints; i++){

    var newTentacle = new THREE.CylinderGeometry(radiusTop,radiusBottom,height,segmentsRadius);
    var tentacle01_Link01Matrix = new THREE.Matrix4().set(
      1.0,0.0,0.0,0.0, 
      0.0,1.0,0.0,0.0, 
      0.0,0.0,1.0,0.0, 
      0.0,0.0,0.0,1.0);
    var newTentacles = new THREE.Mesh(newTentacle,normalMaterial);

    newTentacles.setMatrix(tentacle01_Link01Matrix);

    arr.push(newTentacles);

   }

}

//Add Set of Joints to the Array
function addJoints(arr, radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength){
  var i = 0;

  for (; i < NumberofJoints; i++){

    var newJoints = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
    var joint01_Link01Matrix = new THREE.Matrix4().set(
      1.0,0.0,0.0,0.0, 
      0.0,1.0,0.0,0.0, 
      0.0,0.0,1.0,0.0, 
      0.0,0.0,0.0,1.0);
    var newJoints = new THREE.Mesh(newJoints, normalMaterial);

    newJoints.setMatrix(joint01_Link01Matrix);

    arr.push(newJoints);
  }

}


//Rotate Set of Tentacles on their own Axis
function rotateSet(arr, xRot, yRot, zRot, xTrans, yTrans, zTrans, NumberofJoints){
  var i = 0;
  cosThetaRotX = Math.cos(Math.PI * (xRot/180.0));
  sinThetaRotX = Math.sin(Math.PI * (xRot/180.0));

  cosThetaRotY = Math.cos(Math.PI * (yRot/180.0));
  sinThetaRotY = Math.sin(Math.PI * (yRot/180.0));

  cosThetaRotZ = Math.cos(Math.PI * (zRot/180.0));
  sinThetaRotZ = Math.sin(Math.PI * (zRot/180.0));

  var FirstRotXMatrix = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.0, 
    0.0,cosThetaRotX,sinThetaRotX,0.0, 
    0.0,-sinThetaRotX,cosThetaRotX,0.0,
    0.0,0.0,0.0,1.0);

  var FirstRotYMatrix = new THREE.Matrix4().set(
    cosThetaRotY,0.0,-sinThetaRotY,0.0, 
    0.0,1.0,0.0,0.0, 
    sinThetaRotY,0.0,cosThetaRotY,0.0,
    0.0,0.0,0.0,1.0);

  var FirstRotZMatrix = new THREE.Matrix4().set(
    cosThetaRotZ,-sinThetaRotZ,0.0,0.0, 
    sinThetaRotZ,cosThetaRotZ,0.0,0.0,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);


  var FirstTranslateMatrix = new THREE.Matrix4().set(
    1.0,0.0,0.0,xTrans, 
    0.0,1.0,0.0,yTrans, 
    0.0,0.0,1.0,zTrans, 
    0.0,0.0,0.0,1.0);


  for (; i < NumberofJoints; i++){
     x = arr[i];

     var newMatrixWithY = identityMatrix;

     if (yRot != 0.0){
      var newMatrixWithY = new THREE.Matrix4().multiplyMatrices(FirstRotYMatrix, newMatrixWithY);
     }

     var rotatedFirstTentacle0 = new THREE.Matrix4().multiplyMatrices(newMatrixWithY, FirstRotZMatrix);
     var rotatedFirstTentacle1 = new THREE.Matrix4().multiplyMatrices(rotatedFirstTentacle0, FirstRotXMatrix);
     var rotatedFirstTentacle2 = new THREE.Matrix4().multiplyMatrices(rotatedFirstTentacle1, FirstTranslateMatrix);
     var rotatedFirstTentacle3 = new THREE.Matrix4().multiplyMatrices(rotatedFirstTentacle2, x.matrix);
     x.setMatrix(rotatedFirstTentacle3);

  }

}



//Contextualize Set of Objects to the Socket
function socketSet(arr, socketValue){
  var i = 0;

  rotatedSocket = socketValue;

  //Rotation Matrix to reach each Socket
  cosThetaRot = Math.cos(Math.PI * (-45.0/180.0));
  sinThetaRot = Math.sin(Math.PI * (-45.0/180.0));
  var socketRotMatrix = new THREE.Matrix4().set(
    cosThetaRot,0.0,-sinThetaRot,0.0, 
    0.0,1.0,0.0,0.0, 
    sinThetaRot,0.0,cosThetaRot,0.0, 
    0.0,0.0,0.0,1.0);

  for (; i < NumberofJoints; i++){
    x = arr[i];
    var tentacleAttach = new THREE.Matrix4().multiplyMatrices(rotatedSocket, x.matrix);
    x.setMatrix(tentacleAttach);

    rotatedSocket = new THREE.Matrix4().multiplyMatrices(socketRotMatrix, rotatedSocket);

  }

}



//Contextualize Set of Tentacles to the Joints (or Joints to Tentacles)
function jointSet(tentacleSet, jointSet){
  var i = 0;

  for (; i < NumberofJoints; i++){
    x = tentacleSet[i];
    y = jointSet[i];
    var jointAttach = new THREE.Matrix4().multiplyMatrices(y.matrix, x.matrix);
    x.setMatrix(jointAttach);
  }

}


//Main Array iteration for Scene Addition
function sceneArray(arr){
  var i = 0;

  for (; i < NumberofJoints; i++){
    x = arr[i];
    scene.add(x);
  }

}


//Reset Matrix to Identity
function resetArray(arr){
  var i = 0;

  for (; i < NumberofJoints; i++){
    x = arr[i];
    x.setMatrix(identityMatrix);
  }
}



//Reset Matrix set for Swimming octopus to Static
function resetoctopus(){
  octopusEye_RMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, eyeTSMatrix_R);
  eye_R.setMatrix(octopusEye_RMatrix);
  var eyePupilMatrix_R = new THREE.Matrix4().multiplyMatrices(octopusEye_RMatrix, pupilTSRMatrix_R);
  pupil_R.setMatrix(eyePupilMatrix_R);

  octopusEye_LMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, eyeTSMatrix_L);
  eye_L.setMatrix(octopusEye_LMatrix);
  var eyePupilMatrix_L = new THREE.Matrix4().multiplyMatrices(octopusEye_LMatrix, pupilTSRMatrix_L);
  pupil_L.setMatrix(eyePupilMatrix_L);

  var octopusSocketMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, tentacleSRM);
  tentacleSocket.setMatrix(octopusSocketMatrix);

  resetArray(jointsFirstSet);
  socketSet(jointsFirstSet, octopusSocketMatrix);

  resetArray(tentacleFirstSet);
  rotateSet(tentacleFirstSet, -140.0, 0.0, -60.0, 0.0, 1.5, 0.0, NumberofJoints);
  socketSet(tentacleFirstSet, octopusSocketMatrix);

  resetArray(jointsSecondSet);
  rotateSet(jointsSecondSet, 0.0, 0.0, 0.0, 0.0, 1.6, 0.0, NumberofJoints);
  jointSet(jointsSecondSet, tentacleFirstSet);

  resetArray(tentacleSecondSet);
  rotateSet(tentacleSecondSet, 5.0, 0.0, 18.0, 0.0, 1.3, 0.0, NumberofJoints);
  jointSet(tentacleSecondSet, jointsSecondSet);

  resetArray(jointsThirdSet);
  rotateSet(jointsThirdSet, 0.0, 0.0, 0.0, 0.0, 1.6, 0.0, NumberofJoints);
  jointSet(jointsThirdSet, tentacleSecondSet);

  resetArray(tentacleThirdSet);
  rotateSet(tentacleThirdSet, -7.0, 0.0, -19.8, 0.0, 0.9, 0.0, NumberofJoints);
  jointSet(tentacleThirdSet, jointsThirdSet);
}


function caseTwoMatrix() {

  squidMatrix.value = new THREE.Matrix4().set(
          1.0,0.0,0.0,0.0, 
          0.0,1.0,0.0,9.0,
          0.0,0.0,1.0,0.0, 
          0.0,0.0,0.0,1.0
  );

  octopusEye_RMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, eyeTSMatrix_R);
  eye_R.setMatrix(octopusEye_RMatrix);
  var eyePupilMatrix_R = new THREE.Matrix4().multiplyMatrices(octopusEye_RMatrix, pupilTSRMatrix_R);
  pupil_R.setMatrix(eyePupilMatrix_R);

  octopusEye_LMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, eyeTSMatrix_L);
  eye_L.setMatrix(octopusEye_LMatrix);
  var eyePupilMatrix_L = new THREE.Matrix4().multiplyMatrices(octopusEye_LMatrix, pupilTSRMatrix_L);
  pupil_L.setMatrix(eyePupilMatrix_L);

  var octopusSocketMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, tentacleSRM);
  tentacleSocket.setMatrix(octopusSocketMatrix);
  

  resetArray(jointsFirstSet);
  socketSet(jointsFirstSet, octopusSocketMatrix);

  resetArray(tentacleFirstSet);
  rotateSet(tentacleFirstSet, -180.0, 0.0, 0.0, 0.0, 1.5, 0.0, NumberofJoints);
  socketSet(tentacleFirstSet, octopusSocketMatrix);

  resetArray(jointsSecondSet);
  rotateSet(jointsSecondSet, 0.0, 0.0, 0.0, 0.0, 1.6, 0.0, NumberofJoints);
  jointSet(jointsSecondSet, tentacleFirstSet);

  resetArray(tentacleSecondSet);
  rotateSet(tentacleSecondSet, 5.0, 0.0, 18.0, 0.0, 1.3, 0.0, NumberofJoints);
  jointSet(tentacleSecondSet, jointsSecondSet);

  resetArray(jointsThirdSet);
  rotateSet(jointsThirdSet, 0.0, 0.0, 0.0, 0.0, 1.6, 0.0, NumberofJoints);
  jointSet(jointsThirdSet, tentacleSecondSet);

  resetArray(tentacleThirdSet);
  rotateSet(tentacleThirdSet, -7.0, 0.0, -19.8, 0.0, 0.9, 0.0, NumberofJoints);
  jointSet(tentacleThirdSet, jointsThirdSet);
}




//------------------------------------------------------------------------------



//Establish initial octopus Pose





//Initiate First Joints
addJoints(jointsFirstSet, 0.5, 32, 32, 0, 6.3, 6, 3.7);
socketSet(jointsFirstSet, octopusSocketMatrix);
sceneArray(jointsFirstSet);

//Initiate First Set
addSet(tentacleFirstSet, 0.35, 0.45, 3, 64);
rotateSet(tentacleFirstSet, -140.0, 0.0, -60.0, 0.0, 1.5, 0.0, NumberofJoints);
jointSet(tentacleFirstSet, jointsFirstSet);
sceneArray(tentacleFirstSet);




//Initiate Second Joints
addJoints(jointsSecondSet, 0.39, 32, 32, 0, 6.3, 6, 3.7);
rotateSet(jointsSecondSet, 0.0, 0.0, 0.0, 0.0, 1.6, 0.0, NumberofJoints);
jointSet(jointsSecondSet, tentacleFirstSet);
sceneArray(jointsSecondSet);


//Initiate Second Set
addSet(tentacleSecondSet, 0.15, 0.30, 3, 64);
rotateSet(tentacleSecondSet, 5.0, 0.0, 18.0, 0.0, 1.3, 0.0, NumberofJoints);
jointSet(tentacleSecondSet, jointsSecondSet);
sceneArray(tentacleSecondSet);




//Initiate Third Joints
addJoints(jointsThirdSet, 0.20, 32, 32, 0, 6.3, 6, 3.7);
rotateSet(jointsThirdSet, 0.0, 0.0, 0.0, 0.0, 1.6, 0.0, NumberofJoints);
jointSet(jointsThirdSet, tentacleSecondSet);
sceneArray(jointsThirdSet);


//Initiate Third Set
addSet(tentacleThirdSet, 0.10, 0.15, 2.1, 64);
rotateSet(tentacleThirdSet, -7.0, 0.0, -19.8, 0.0, 0.9, 0.0, NumberofJoints);
jointSet(tentacleThirdSet, jointsThirdSet);
sceneArray(tentacleThirdSet);



//---------------------------------------------------------------------------



//APPLY DIFFERENT EFFECTS TO DIFFERNET CHANNELS




//Reset Variable
var resetMatrix_30 = squidMatrix.value;





//Matrix for Case 0
cosThetaRotZCase00 = Math.cos(Math.PI * (45/180.0));
sinThetaRotZCase00 = Math.sin(Math.PI * (45/180.0));

var static_00 = new THREE.Matrix4().set(
    cosThetaRotZCase00,-sinThetaRotZCase00,0.0,0.0, 
    sinThetaRotZCase00,cosThetaRotZCase00,0.0,0.0,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
static_00 = new THREE.Matrix4().multiplyMatrices(tentacleFirstSet[0].matrix, static_00);
var static_01 = new THREE.Matrix4().set(
    1.0,0.0,0.0,-0.35, 
    0.0,1.0,0.0,1.1,
    0.0,0.0,1.0,-0.1, 
    0.0,0.0,0.0,1.0);
static_00 = new THREE.Matrix4().multiplyMatrices(static_01, static_00);
var static_02 = new THREE.Matrix4().set(
    1.0,0.0,0.0,-0.60, 
    0.0,1.0,0.0,2.2,
    0.0,0.0,1.0,-0.42, 
    0.0,0.0,0.0,1.0);
var static_02 = new THREE.Matrix4().multiplyMatrices(static_02, jointsSecondSet[0].matrix);

cosThetaRotZCase01 = Math.cos(Math.PI * (130/180.0));
sinThetaRotZCase01 = Math.sin(Math.PI * (130/180.0));

var static_03 = new THREE.Matrix4().set(
    cosThetaRotZCase01,-sinThetaRotZCase01,0.0,0.0, 
    sinThetaRotZCase01,cosThetaRotZCase01,0.0,0.0,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
static_03 = new THREE.Matrix4().multiplyMatrices(tentacleSecondSet[0].matrix, static_03);
var static_04 = new THREE.Matrix4().set(
    1.0,0.0,0.0,-0.08, 
    0.0,1.0,0.0,3.45,
    0.0,0.0,1.0,-2.5, 
    0.0,0.0,0.0,1.0);
static_04 = new THREE.Matrix4().multiplyMatrices(static_04, static_03);
var static_05 = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.6, 
    0.0,1.0,0.0,4.77,
    0.0,0.0,1.0,-4.95, 
    0.0,0.0,0.0,1.0);
var static_05 = new THREE.Matrix4().multiplyMatrices(static_05, jointsThirdSet[0].matrix);


cosThetaRotZCase02 = Math.cos(Math.PI * (180/180.0));
sinThetaRotZCase02 = Math.sin(Math.PI * (180/180.0));

var static_06 = new THREE.Matrix4().set(
    cosThetaRotZCase02,-sinThetaRotZCase02,0.0,0.0, 
    sinThetaRotZCase02,cosThetaRotZCase02,0.0,0.0,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
static_06 = new THREE.Matrix4().multiplyMatrices(tentacleThirdSet[0].matrix, static_06);
var static_07 = new THREE.Matrix4().set(
    1.0,0.0,0.0,1.4, 
    0.0,1.0,0.0,5.65,
    0.0,0.0,1.0,-6.66, 
    0.0,0.0,0.0,1.0);
var static_07 = new THREE.Matrix4().multiplyMatrices(static_07, static_06);




//Matrix for Case 1
cosThetaRotZCase10 = Math.cos(Math.PI * (-75/180.0));
sinThetaRotZCase10 = Math.sin(Math.PI * (-75/180.0));

var static_10 = new THREE.Matrix4().set(
    cosThetaRotZCase10,-sinThetaRotZCase10,0.0,0.0, 
    sinThetaRotZCase10,cosThetaRotZCase10,0.0,0.0,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
var static_11 = new THREE.Matrix4().multiplyMatrices(static_10, tentacleFirstSet[6].matrix);
var static_12 = new THREE.Matrix4().multiplyMatrices(static_10, tentacleFirstSet[7].matrix);
var static_13 = new THREE.Matrix4().set(
    1.0,0.0,0.0,-4.9, 
    0.0,1.0,0.0,-1.0,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
static_11 = new THREE.Matrix4().multiplyMatrices(static_13, static_11);
static_12 = new THREE.Matrix4().multiplyMatrices(static_13, static_12);
var static_14 = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.8, 
    0.0,1.0,0.0,3.5,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
static_15 = new THREE.Matrix4().multiplyMatrices(static_14, jointsSecondSet[6].matrix);
static_16 = new THREE.Matrix4().multiplyMatrices(static_14, jointsSecondSet[7].matrix);

cosThetaRotZCase11 = Math.cos(Math.PI * (-75/180.0));
sinThetaRotZCase11 = Math.sin(Math.PI * (-75/180.0));

var static_17 = new THREE.Matrix4().set(
    cosThetaRotZCase11,-sinThetaRotZCase11,0.0,0.0, 
    sinThetaRotZCase11,cosThetaRotZCase11,0.0,0.0,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
var static_18 = new THREE.Matrix4().multiplyMatrices(static_17, tentacleSecondSet[6].matrix);
var static_19 = new THREE.Matrix4().multiplyMatrices(static_17, tentacleSecondSet[7].matrix);
var static_100 = new THREE.Matrix4().set(
    1.0,0.0,0.0,-5.0, 
    0.0,1.0,0.0,-0.7,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
static_18 = new THREE.Matrix4().multiplyMatrices(static_100, static_18);
static_19 = new THREE.Matrix4().multiplyMatrices(static_100, static_19);
var static_101 = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.0, 
    0.0,1.0,0.0,0.0,
    0.0,0.0,1.0,-0.15, 
    0.0,0.0,0.0,1.0);
var static_102 = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.0, 
    0.0,1.0,0.0,0.0,
    0.0,0.0,1.0,0.15, 
    0.0,0.0,0.0,1.0);
static_18 = new THREE.Matrix4().multiplyMatrices(static_101, static_18);
static_19 = new THREE.Matrix4().multiplyMatrices(static_102, static_19);
var static_103 = new THREE.Matrix4().set(
    1.0,0.0,0.0,2.5, 
    0.0,1.0,0.0,6.4,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
var static_104 = new THREE.Matrix4().multiplyMatrices(static_103, jointsThirdSet[6].matrix);
var static_105 = new THREE.Matrix4().multiplyMatrices(static_103, jointsThirdSet[7].matrix);
var static_106 = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.0, 
    0.0,1.0,0.0,0.0,
    0.0,0.0,1.0,-0.10, 
    0.0,0.0,0.0,1.0);
var static_107 = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.1, 
    0.0,1.0,0.0,0.0,
    0.0,0.0,1.0,0.1, 
    0.0,0.0,0.0,1.0);
static_104 = new THREE.Matrix4().multiplyMatrices(static_106, static_104);
static_105 = new THREE.Matrix4().multiplyMatrices(static_107, static_105);

cosThetaRotZCase12 = Math.cos(Math.PI * (-105/180.0));
sinThetaRotZCase12 = Math.sin(Math.PI * (-105/180.0));

var static_108 = new THREE.Matrix4().set(
    cosThetaRotZCase12,-sinThetaRotZCase12,0.0,0.0, 
    sinThetaRotZCase12,cosThetaRotZCase12,0.0,0.0,
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0);
var static_109 = new THREE.Matrix4().multiplyMatrices(static_108, tentacleSecondSet[6].matrix);
var static_110 = new THREE.Matrix4().multiplyMatrices(static_108, tentacleSecondSet[7].matrix);
var static_111 = new THREE.Matrix4().set(
    1.0,0.0,0.0,-9.0, 
    0.0,1.0,0.0,2.5,
    0.0,0.0,1.0,0.1, 
    0.0,0.0,0.0,1.0);
static_109 = new THREE.Matrix4().multiplyMatrices(static_111, static_109);
static_110 = new THREE.Matrix4().multiplyMatrices(static_111, static_110);
var static_112 = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.15, 
    0.0,1.0,0.0,-0.2,
    0.0,0.0,1.0,-1.3, 
    0.0,0.0,0.0,1.0);
var static_113 = new THREE.Matrix4().set(
    1.0,0.0,0.0,0.15, 
    0.0,1.0,0.0,-0.2,
    0.0,0.0,1.0,0.95, 
    0.0,0.0,0.0,1.0);
static_109 = new THREE.Matrix4().multiplyMatrices(static_112, static_109);
static_110 = new THREE.Matrix4().multiplyMatrices(static_113, static_110);



//Clock for Swim Animation
this.clock = new THREE.Clock(true);




//Reset Counter Gates
var resetCounter_00 = 0;
var resetCounter_10 = 0;
var resetCounter_20 = 0;
var resetCounter_30 = 0;

//------------------------------------------------------------------------










function updateBody() {
  switch(channel)
  {
    //add poses here:
    case 0:

      //Stop Case 1
      resetCounter_10++;
      if (resetCounter_10 == 1){
        resetoctopus();
      }


      //Stop Case 2
      if (resetCounter_20 > 0){
        resetCounter_20 = 0;
        squidMatrix.value = resetMatrix_30;
        resetoctopus();
      }


      //Stop Case 3
      resetCounter_30++;
      if (resetCounter_30 == 1){
        squidMatrix.value = resetMatrix_30;
        resetoctopus();
      }

      //Reset Case 0 Counter
      resetCounter_00 = 0;


      //Case 0 Pose
      tentacleFirstSet[0].setMatrix(static_00);
      jointsSecondSet[0].setMatrix(static_02);
      tentacleSecondSet[0].setMatrix(static_04);
      jointsThirdSet[0].setMatrix(static_05);
      tentacleThirdSet[0].setMatrix(static_07);

      
      break;

    case 1:

      //Stop Case 0
      resetCounter_00++;
      if (resetCounter_00 == 1){
        resetoctopus();
      }


      //Stop Case 2
      if (resetCounter_20 > 0){
        resetCounter_20 = 0;
        squidMatrix.value = resetMatrix_30;
        resetoctopus();
        
      }


      //Stop Case 3
      resetCounter_30++;
      if (resetCounter_30 == 1){
        squidMatrix.value = resetMatrix_30;
        resetoctopus();

      }

      //Reset Case 1 Counter
      resetCounter_10 = 0;
    
      
      //Case 1 Pose
      tentacleFirstSet[6].setMatrix(static_11);
      tentacleFirstSet[7].setMatrix(static_12);
      jointsSecondSet[6].setMatrix(static_15);
      jointsSecondSet[7].setMatrix(static_16);
      tentacleSecondSet[6].setMatrix(static_18);
      tentacleSecondSet[7].setMatrix(static_19);
      jointsThirdSet[6].setMatrix(static_104);
      jointsThirdSet[7].setMatrix(static_105);
      tentacleThirdSet[6].setMatrix(static_109);
      tentacleThirdSet[7].setMatrix(static_110);


  
    
      break;


    case 4: //Reset back to Two


      //Stop Case 0
      resetCounter_00++;
      if (resetCounter_00 == 1){
        resetoctopus();
      }

      //Stop Case 1
      resetCounter_10++;
      if (resetCounter_10 == 1){
        resetoctopus();
      }

      //Stop Case 3
      resetCounter_30++;
      if (resetCounter_30 == 1){
        squidMatrix.value = resetMatrix_30;
        resetoctopus();

      }
      
      //Stop Case 2
      resetCounter_20++;
      if (resetCounter_20 == 1) {
        caseTwoMatrix();
      }



      break;

    //animation
    case 3:
      {

        
        //Stop Case 0
        resetCounter_00++;
        if (resetCounter_00 == 1){
          resetoctopus();
        }

        //Stop Case1
        resetCounter_10++;
        if (resetCounter_10 == 1){
        resetoctopus();
        }

      //Stop Case 2
      if (resetCounter_20 > 0){
        resetCounter_20 = 0;
        squidMatrix.value = resetMatrix_30;
        resetoctopus();
        
      }



        //Reset Case 3 Counter
        resetCounter_30 = 0;

        //Initialize the Clock
        var t = clock.getElapsedTime();

        //New octopus Matrx
        squidMatrix.value = new THREE.Matrix4().set(
          1.0,0.0,0.0,0.0, 
          0.0,1.0,0.0,(7.0 + Math.cos(t/2.0) * 2.0), 
          0.0,0.0,1.0,0.0, 
          0.0,0.0,0.0,1.0
        );

        //Alignment of all other octopus Objects to moving Matrix
        octopusEye_RMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, eyeTSMatrix_R);
        eye_R.setMatrix(octopusEye_RMatrix);
        var eyePupilMatrix_R = new THREE.Matrix4().multiplyMatrices(octopusEye_RMatrix, pupilTSRMatrix_R);
        pupil_R.setMatrix(eyePupilMatrix_R);

        octopusEye_LMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, eyeTSMatrix_L);
        eye_L.setMatrix(octopusEye_LMatrix);
        var eyePupilMatrix_L = new THREE.Matrix4().multiplyMatrices(octopusEye_LMatrix, pupilTSRMatrix_L);
        pupil_L.setMatrix(eyePupilMatrix_L);

        var octopusSocketMatrix = new THREE.Matrix4().multiplyMatrices(squidMatrix.value, tentacleSRM);
        tentacleSocket.setMatrix(octopusSocketMatrix);

        resetArray(jointsFirstSet);
        socketSet(jointsFirstSet, octopusSocketMatrix);

        resetArray(tentacleFirstSet);
        rotateSet(tentacleFirstSet, -140.0, 0.0, (-80.0 + Math.sin(t/2.0) * 30), 0.0, 1.5, 0.0, NumberofJoints);
        socketSet(tentacleFirstSet, octopusSocketMatrix);

        resetArray(jointsSecondSet);
        rotateSet(jointsSecondSet, 0.0, 0.0, 0.0, 0.0, 1.6, 0.0, NumberofJoints);
        jointSet(jointsSecondSet, tentacleFirstSet);

        resetArray(tentacleSecondSet);
        rotateSet(tentacleSecondSet, 5.0, 0.0, (0.0 + Math.cos(t/2.0) * 35), 0.0, 1.3, 0.0, NumberofJoints);
        jointSet(tentacleSecondSet, jointsSecondSet);

        resetArray(jointsThirdSet);
        rotateSet(jointsThirdSet, 0.0, 0.0, 0.0, 0.0, 1.6, 0.0, NumberofJoints);
        jointSet(jointsThirdSet, tentacleSecondSet);

        resetArray(tentacleThirdSet);
        rotateSet(tentacleThirdSet, -7.0, 0.0, (0.0 + Math.sin(t/2.0) * 30), 0.0, 1.0, 0.0, NumberofJoints);
        jointSet(tentacleThirdSet, jointsThirdSet);


      }

      break;
    default:
      break;
  }
}


// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();
var channel = 5;
function checkKeyboard() {
  for (var i=0; i<6; i++)
  {
    if (keyboard.pressed(i.toString()))
    {
      channel = i;
      break;
    }
  }
}


// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  updateBody();
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();