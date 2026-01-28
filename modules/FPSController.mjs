import * as THREE from 'https://cdn.skypack.dev/three@0.136.0'

// Based on examples/jsm/controls/FirstPersonControls

class FPSController {
	constructor(camera, domElement) {

		this.camera = camera;
		this.target = new THREE.Vector3(0, 0, 0);

		this.domElement = (domElement !== undefined) ? domElement : document;

		this.enabled = true;
		this.enableCollisions = false;

		this.raycaster = null;
		this.raycasterDirection = new THREE.Vector3(0, 0, 0);
		this.raycasterOrigin = new THREE.Vector3(0, 0, 0);

		// Hauteur du regard de l'observateur
		this.lookHeight = 1.5;
		this.setLookHeight = function (lookHeight) {
			this.lookHeight = lookHeight;
		};

		// Données pour la gestion des déplacements
		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.moveSpeed = 2.0;
		this.setMoveSpeed = function (moveSpeed) {
			this.moveSpeed = moveSpeed;
		};

		// Độ nhạy chuột (ngang, dọc) — thấp hơn = ít chóng mặt
		this.mouseSensitivityX = 0.2;
		this.mouseSensitivityY = 0.1;
		this.setMouseSensitivity = function (sx, sy) {
			this.mouseSensitivityX = sx != null ? sx : this.mouseSensitivityX;
			this.mouseSensitivityY = sy != null ? sy : this.mouseSensitivityY;
		};

		// Làm mượt xoay camera (số càng thấp càng mượt, càng cao càng phản hồi nhanh)
		this.rotationSmoothFactor = 10;
		this.setRotationSmoothFactor = function (factor) {
			this.rotationSmoothFactor = Math.max(0.5, Math.min(20, factor));
		};

		// Giới hạn ngước/nhìn xuống (độ) — tránh xoay quá đứng gây chóng mặt
		this.verticalLookLimit = 85;
		this.setVerticalLookLimit = function (degrees) {
			this.verticalLookLimit = Math.max(30, Math.min(85, degrees));
		};

		// Giá trị hiển thị (được lerp) dùng cho hướng nhìn
		this.lonDisplay = 0;
		this.latDisplay = 0;

		// Giới hạn di chuyển trong phòng (minX, maxX, minZ, maxZ)
		this.bounds = null;
		this.setBounds = function (minX, maxX, minZ, maxZ) {
			this.bounds = { minX, maxX, minZ, maxZ };
		};

		// Données pour la gestion de la direction du regard
		this.mouseX = 0;
		this.mouseY = 0;

		this.prevMouseX = 0;
		this.prevMouseY = 0;

		this.moveX = 0;
		this.moveY = 0;

		this.mouseDown = false;

		this.lat = 0;
		this.phi = THREE.Math.degToRad(90 - this.lat);
		var viewDir = new THREE.Vector2(this.camera.position.x, this.camera.position.z);
		viewDir.multiplyScalar(-1);
		viewDir.normalize();
		this.theta = Math.acos(viewDir.dot(new THREE.Vector2(0, -1)));
		if (this.camera.position.x > 0)
			this.theta *= -1;
		this.lon = THREE.Math.radToDeg(this.theta);
		this.lonDisplay = this.lon;
		this.latDisplay = this.lat;

		this.onMouseDown = function (event) {
			if (event.button == 0) {
				this.mouseDown = true;
				this.mouseX = event.clientX;
				this.mouseY = event.clientY;
			}
		};

		this.onMouseUp = function (event) {
			if (event.button == 0)
				this.mouseDown = false;
		};

		this.onMouseMove = function (event) {
			if (this.mouseDown) {
				this.prevMouseX = this.mouseX;
				this.prevMouseY = this.mouseY;

				this.mouseX = event.clientX;
				this.mouseY = event.clientY;

				// Calcul de la direction du regard (dùng độ nhạy và giới hạn dọc)
				this.lon += (this.mouseX - this.prevMouseX) * this.mouseSensitivityX;
				this.lat -= (this.mouseY - this.prevMouseY) * this.mouseSensitivityY;
				this.lat = Math.max(-this.verticalLookLimit, Math.min(this.verticalLookLimit, this.lat));
				// phi/theta cập nhật trong update() từ lonDisplay/latDisplay (làm mượt)
			}
		};

		this.onKeyDown = function (event) {
			switch (event.code) {
				case "KeyW":
				case "ArrowUp":
					// Forward
					this.moveForward = true;
					break;
				case "KeyA":
				case "ArrowLeft":
					// Left
					this.moveLeft = true;
					break;
				case "KeyS":
				case "ArrowDown":
					// Down
					this.moveBackward = true;
					break;
				case "KeyD":
				case "ArrowRight":
					// Right
					this.moveRight = true;
					break;
			}

		};

		this.onKeyUp = function (event) {
			switch (event.code) {
				case "KeyW":
				case "ArrowUp":
					// Forward
					this.moveForward = false;
					break;
				case "KeyA":
				case "ArrowLeft":
					// Left
					this.moveLeft = false;
					break;
				case "KeyS":
				case "ArrowDown":
					// Down
					this.moveBackward = false;
					break;
				case "KeyD":
				case "ArrowRight":
					// Right
					this.moveRight = false;
					break;
			}
		};

		this.collisions = function(colliders, scene){

			if(!this.raycaster) this.raycaster = new THREE.Raycaster(this.raycasterOrigin, this.raycasterDirection, 0, 3);

			const {x, z} = this.camera.position;
			this.raycasterOrigin.set(x, 0.5, z);
			var vector = new THREE.Vector3(0, 0, -1);
			vector = this.camera.localToWorld(vector);
			vector.sub(this.camera.position); // Now vector is a unit vector with the same direction as the camera

			this.raycasterDirection = this.getTargetPosition(1)
			this.raycasterDirection.y = 0.5;
			this.raycaster.set(
				this.raycasterOrigin, 
				vector
			);
			const intersects = this.raycaster.intersectObjects(colliders);

			this.enabled = intersects.length === 0;
		};

		this.update = function (delta) {

			// Làm mượt xoay camera — lerp hướng nhìn hiển thị về hướng đích
			const t = Math.min(1, this.rotationSmoothFactor * delta);
			this.lonDisplay += (this.lon - this.lonDisplay) * t;
			this.latDisplay += (this.lat - this.latDisplay) * t;
			this.phi = THREE.Math.degToRad(90 - this.latDisplay);
			this.theta = THREE.Math.degToRad(this.lonDisplay);

			const targetPosition = this.getTargetPosition(10)

			this.camera.lookAt(targetPosition);

			if (this.enabled === false && this.moveForward)
			return;

			// Déplacement
			if (this.moveForward)
				this.camera.translateZ(-this.moveSpeed * delta);

			if (this.moveBackward)
				this.camera.translateZ(this.moveSpeed * delta);

			if (this.moveLeft)
				this.camera.translateX(-this.moveSpeed * delta);

			if (this.moveRight)
				this.camera.translateX(this.moveSpeed * delta);

			this.camera.position.y = this.lookHeight;

			// Chặn người chơi trong phòng — clamp theo bounds
			if (this.bounds) {
				const b = this.bounds;
				this.camera.position.x = Math.max(b.minX, Math.min(b.maxX, this.camera.position.x));
				this.camera.position.z = Math.max(b.minZ, Math.min(b.maxZ, this.camera.position.z));
			}
		};

		this.getTargetPosition = function (offset) {
			const targetPosition = this.target;
			const position = this.camera.position;

			targetPosition.x = position.x + offset * Math.sin(this.phi) * Math.sin(this.theta);
			targetPosition.y = position.y + offset * Math.cos(this.phi);
			targetPosition.z = position.z - offset * Math.sin(this.phi) * Math.cos(this.theta);

			return targetPosition;
		}

		this.dispose = function () {
			this.domElement.addEventListener('mousedown', _onMouseDown, false);
			this.domElement.addEventListener('mouseup', _onMouseUp, false);
			this.domElement.removeEventListener('mousemove', _onMouseMove, false);
			window.removeEventListener('keydown', _onKeyDown, false);
			window.removeEventListener('keyup', _onKeyUp, false);
		};

		var _onMouseMove = bind(this, this.onMouseMove);
		var _onMouseDown = bind(this, this.onMouseDown);
		var _onMouseUp = bind(this, this.onMouseUp);
		var _onKeyDown = bind(this, this.onKeyDown);
		var _onKeyUp = bind(this, this.onKeyUp);

		this.domElement.addEventListener('mousedown', _onMouseDown, false);
		this.domElement.addEventListener('mouseup', _onMouseUp, false);
		this.domElement.addEventListener('mousemove', _onMouseMove, false);
		window.addEventListener('keydown', _onKeyDown, false);
		window.addEventListener('keyup', _onKeyUp, false);

		function bind(scope, fn) {
			return function () {
				fn.apply(scope, arguments);
			};
		}
	}
}

export { FPSController };
