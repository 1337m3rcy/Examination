function main() {
  const canvas = document.querySelector(".screen");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  document.body.appendChild(renderer.domElement);

  const fov = 120;
  const aspect = 2; // холст по умолчанию
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 15;
  camera.position.y = 5;
  camera.lookAt(0, 5, 0);

  const scene = new THREE.Scene();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  //тусклое освещение
  pointLight = new THREE.PointLight(0xffffff, 0.1, 100);
  pointLight.position.set(0, 0, 15);
  pointLight.castShadow = true;
  scene.add(pointLight);

  //источник света - фонарик
  light = new THREE.SpotLight(0xf4a460, 1, 1000);
  light.angle = Math.PI / 12;
  light.penumbra = 0.05;
  light.castShadow = true;
  scene.add(light);

  //тени
  light.shadow.mapSize.width = 1920; // default
  light.shadow.mapSize.height = 1080; // default
  light.shadow.camera.near = 2; // default
  light.shadow.camera.far = 500; // default

  //стена
  const geometryBackground = new THREE.PlaneGeometry(
    window.innerWidth,
    window.innerHeight
  );
  const loaderWall = new THREE.TextureLoader();
  const textureWall = loaderWall.load("https://i.imgur.com/rd8pVrv.jpeg");
  textureWall.wrapS = THREE.RepeatWrapping;
  textureWall.wrapT = THREE.RepeatWrapping;
  textureWall.repeat.set(15, 15);

  const materialBackground = new THREE.MeshPhongMaterial({ map: textureWall });

  const background = new THREE.Mesh(geometryBackground, materialBackground);
  background.receiveShadow = true;
  background.position.z = -10;

  scene.add(background);

  //пол
  const geometryPlaneFloor = new THREE.PlaneGeometry(
    window.innerHeight,
    window.innerWidth
  );
  const loaderFloor = new THREE.TextureLoader();
  const textureFloor = loaderFloor.load("https://i.imgur.com/rMMfPt5.jpeg");
  textureFloor.wrapS = THREE.RepeatWrapping;
  textureFloor.wrapT = THREE.RepeatWrapping;
  textureFloor.repeat.set(10, 30);

  const materialPlaneFloor = new THREE.MeshPhysicalMaterial({
    map: textureFloor,
  });

  const planeFloor = new THREE.Mesh(geometryPlaneFloor, materialPlaneFloor);
  planeFloor.rotation.x = -Math.PI / 2;
  planeFloor.position.y = -15;
  planeFloor.receiveShadow = true;

  scene.add(planeFloor);

  //потолок
  const geometryPlaneСeiling = new THREE.PlaneGeometry(
    window.innerHeight,
    window.innerWidth
  );
  const loaderCeiling = new THREE.TextureLoader();
  {
    const textureCeiling = loaderCeiling.load(
      "https://i.imgur.com/seP6Gbi.jpeg"
    );
    textureCeiling.wrapS = THREE.RepeatWrapping;
    textureCeiling.wrapT = THREE.RepeatWrapping;
    textureCeiling.repeat.set(10, 30);
    const materialPlaneСeiling = new THREE.MeshPhysicalMaterial({
      map: textureCeiling,
    });
    const planeСeiling = new THREE.Mesh(
      geometryPlaneСeiling,
      materialPlaneСeiling
    );
    planeСeiling.rotation.x = Math.PI / 2;
    planeСeiling.position.y = 22.5;
    planeСeiling.receiveShadow = true;
    scene.add(planeСeiling);
  }

  const canvasWidth = 15;
  const canvasHeight = 7.5;
  const spacingX = canvasWidth + 5; // Отступ между картинами по оси X
  const spacingY = canvasHeight + 5; // Отступ между картинами по оси Y

  // Позиция первой картинки
  let initialX = -50;
  let initialY = 10;

  //список текстур для картин
  const imagesUrl = [
    "https://i.imgur.com/bBEwI9m.png",
    "https://i.imgur.com/vTqGDdo.png",
    "https://i.imgur.com/wWLwadR.png",
    "https://i.imgur.com/hO6QsF9.png",
    "https://i.imgur.com/JrN2ckQ.png",
    "https://i.imgur.com/BQin38Z.png",
    "https://i.imgur.com/MtRI3BT.png",
    "https://i.imgur.com/5y6AXZq.png",
    "https://i.imgur.com/W2jwgBp.png",
    "https://i.imgur.com/XXRB0Y0.png",
  ];

  const paintings = [];

  // Создание и размещение картинок
  const isPictureExpanded = new Array(10).fill(false);

  // Создание и размещение картинок
  imagesUrl.forEach((imageUrl, i) => {
    const geometry = new THREE.PlaneGeometry(canvasWidth, canvasHeight);
    const loaderTexture = new THREE.TextureLoader();
    const texturePictures = loaderTexture.load(imageUrl);
    texturePictures.wrapS = THREE.RepeatWrapping;
    texturePictures.wrapT = THREE.RepeatWrapping;
    texturePictures.repeat.set(1, 1);
    const material = new THREE.MeshPhysicalMaterial({ map: texturePictures });
    const painting = new THREE.Mesh(geometry, material);
    let positionX, positionY;
    if (i % 2 === 0) {
      positionX = initialX + (i / 2) * spacingX + 5;
      positionY = initialY - spacingY;
    } else {
      positionX = initialX + ((i - 1) / 2) * spacingX + 5;
      positionY = initialY;
    }
    painting.position.set(positionX, positionY, -9.9);
    painting.castShadow = true; //default is false
    painting.receiveShadow = false; //default
    scene.add(painting);

    paintings.push(painting);
  });

  window.addEventListener("click", onClick);

  function onClick(event) {
    // Рассчитываем позицию клика мыши
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Обновляем Raycaster
    raycaster.setFromCamera(mouse, camera);

    // Проверяем пересечение с объектами
    const intersects = raycaster.intersectObjects(paintings, true);

    if (intersects.length > 0) {
      // Если есть пересечение с объектами
      const painting = intersects[0].object;
      const index = paintings.indexOf(painting);

      onPictureClick(index); // Вызываем функцию обработки клика на картине
    }
  }

  function onPictureClick(index) {
    console.log("Clicked", " ", index);
    const painting = paintings[index]; // Получаем объект картинки по индексу
    if (!isPictureExpanded[index]) {
      // Если картинка не развернута, разворачиваем ее на весь экран
      pointLightPictures = new THREE.PointLight(0xffffff, 1, 100);
      pointLightPictures.position.set(0, 5, 20);
      pointLightPictures.castShadow = true;
      scene.add(pointLightPictures);
      scene.remove(light);
      painting.scale.set(2, 2, 1);
      painting.position.set(0, 5, 10);
    } else {
      let positionX, positionY;
      if (index % 2 === 0) {
        positionX = initialX + (index / 2) * spacingX + 5;
        positionY = initialY - spacingY;
      } else {
        positionX = initialX + ((index - 1) / 2) * spacingX + 5;
        positionY = initialY;
      }
      scene.remove(pointLightPictures);
      scene.add(light);
      painting.scale.set(1, 1, 1);
      painting.position.set(positionX, positionY, -9.9);
    }

    isPictureExpanded[index] = !isPictureExpanded[index]; // Инвертируем состояние развернутости
  }

  const targetPosition = new THREE.Object3D();
  scene.add(targetPosition);

  light.target = targetPosition;
  window.addEventListener("mousemove", onMouseMove, false);

  function onMouseMove(event) {
    event.preventDefault();

    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Создаем вектор, который будет направлен из позиции камеры в точку, где находится указатель мыши
    const mouseVector = new THREE.Vector3(mouseX, mouseY, 1);
    mouseVector.unproject(camera);

    light.position.set(0, 5, 15);

    // Вычисляем направление вектора от камеры к позиции мыши
    const dir = mouseVector.sub(camera.position).normalize();

    // Устанавливаем направление света в направлении, куда смотрит камера
    light.target.position
      .copy(camera.position)
      .add(new THREE.Vector3(dir.x * 20, dir.y * 20, -10));
  }

  function resizeRendererToDisplaySize(renderer) {
    // const renderer = new THREE.WebGLRenderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
