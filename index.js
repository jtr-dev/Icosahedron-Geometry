var noise = new SimplexNoise();

var renderer,
    scene,
    camera,
    composer,
    lights,
    circle,
    skelet,
    particle,
    planet,
    planet2,
    audioArray,
    user_audio_amp,
    audio_wireframe = true,
    primaryColor = null,
    secondaryColor = null,
    thirdColor = null,
    bg_file,
    move_bg,
    bass_wireframe;

window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
        _properties = properties
        function getRgb(prop) {
            var customColor = prop.value.split(' ');
            customColor = customColor.map(function (c) {
                return Math.ceil(c * 255);
            });
            return 'rgb(' + customColor + ')';
        }

        if (primaryColor === null) {
            primaryColor = getRgb(properties.primary_color)
        }

        if (secondaryColor === null) {
            secondaryColor = getRgb(properties.secondary_color)
        }

        if (thirdColor === null) {
            thirdColor = getRgb(properties.third_color)
        }

        if (properties.primary_color) {
            primaryColor = getRgb(properties.primary_color)
            setBackground()
        }

        if (properties.secondary_color) {
            secondaryColor = getRgb(properties.secondary_color)
            setBackground()
        }

        if (properties.third_color) {
            thirdColor = getRgb(properties.third_color)
            setBackground()
        }

        if (properties.user_audio_amp) {
            var n = properties.user_audio_amp.value;
            if (n <= 10) {
                n = "0" + n
            }
            user_audio_amp = n
        }

        if (properties.audio_wireframe) {
            audio_wireframe = properties.audio_wireframe.value
        }

        if (properties.move_background_bass) {
            move_bg = properties.move_background_bass.value
        }

        if (properties.bass_wireframe) {
            bass_wireframe = properties.bass_wireframe.value
        }

        if (properties.custom_image) {
            bg_file = properties.custom_image.value
            setBackground()
        }

        if (properties.cube_x) {
            circle.position.x = skelet.position.x = properties.cube_x.value
        }

        if (properties.cube_y) {
            circle.position.y = skelet.position.y = properties.cube_y.value
        }

        if (properties.cube_z) {
            circle.position.z = skelet.position.z = properties.cube_z.value
        }

    }
}

window.onload = function () {
    init();
    animate();
    window.wallpaperRegisterAudioListener(wallpaperAudioListener);
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

function setBackground() {
    var pC = primaryColor, sC = secondaryColor, tC = thirdColor;

    lights[0].color.setHex("0x".concat(rgb2hex(tC)))
    lights[1].color.setHex("0x".concat(rgb2hex(pC)))
    lights[2].color.setHex("0x".concat(rgb2hex(sC)))

    var el = document.body
    var currentStyle = el.getAttribute('style');

    if (bg_file && bg_file !== "") {
        img = {};
        img.value = bg_file;
        document.body.style.backgroundImage = "url('" + "file:///".concat(img.value) + "')";
    }

    if (bg_file === "" || bg_file === undefined || bg_file === null) {
        var styleText = 'background: -webkit-linear-gradient(top, ' + pC + ' 0%, ' + sC + ' 100%);' +
            'background: -o-linear-gradient(top, ' + pC + ' 0%, ' + sC + ' 100%); ' +
            'background: -ms-linear-gradient(top, ' + pC + ' 0%,  ' + sC + ' 100%);' +
            'background: linear-gradient(to bottom, ' + pC + ' 0%,  ' + sC + ' 100%);';

        el.setAttribute('style', styleText);
    }
}

function wallpaperAudioListener(audioArr) {
    audioArray = audioArr;
}

function debug(write) {
    if (write === undefined) {
        write = 'undefined'
    } else if (write === "") {
        write = '""'
    }
    var debug = document.getElementById('info')
    debug.innerHTML = write
}

function fractionate(val, minVal, maxVal) {
    return (val - minVal) / (maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio((window.devicePixelRatio)
        ? window.devicePixelRatio
        : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    document
        .getElementById('canvas')
        .appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;
    scene.add(camera);

    circle = new THREE.Object3D();
    skelet = new THREE.Object3D();
    particle = new THREE.Object3D();

    scene.add(circle);
    scene.add(skelet);
    scene.add(particle);

    var geometry = new THREE.TetrahedronGeometry(2, 0); // random particles
    var geom = new THREE.IcosahedronGeometry(7, 1); // center planet
    geom.verticesNeedUpdate = true;
    var geom2 = new THREE.IcosahedronGeometry(15, 1); // wireframe

    var material = new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading });

    for (var i = 0; i < 1000; i++) {
        var mesh = new THREE.Mesh(geometry, material);
        mesh
            .position
            .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            .normalize();
        mesh
            .position
            .multiplyScalar(90 + (Math.random() * 700));
        mesh
            .rotation
            .set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        particle.add(mesh);
    }

    var mat = new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading });

    var mat2 = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: true, side: THREE.DoubleSide });

    planet = new THREE.Mesh(geom, mat);
    planet.verticesNeedUpdate = true;
    planet.scale.x = planet.scale.y = planet.scale.z = 16;

    circle.add(planet);

    planet2 = new THREE.Mesh(geom2, mat2);
    planet2.scale.x = planet2.scale.y = planet2.scale.z = 10;

    skelet.add(planet2);

    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    lights = [];
    lights[0] = new THREE.DirectionalLight(0xffffff, 1);
    lights[0]
        .position
        .set(1, 0, 0);
    lights[1] = new THREE.DirectionalLight(0x01183c, 1);
    lights[1]
        .position
        .set(0.75, 1, 0.5);
    lights[2] = new THREE.DirectionalLight(0x00436f, 1);
    lights[2]
        .position
        .set(-0.75, -1, 0.5);
    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    window.addEventListener('resize', onWindowResize, false);

};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate)

    if (audio_wireframe) {
        var planets = [planet, planet2]
    } else {
        var planets = [planet]
    }

    if (audioArray !== undefined) {
        var random = Math.floor(Math.random() * audioArray.length - 100)
        // planet
        planets.map(planet => {
            planet
                .geometry
                .vertices
                .forEach(function (vertex, i) {
                    var offset = planet.geometry.parameters.radius;
                    var amp = 1.1;
                    var time = Date.now();
                    vertex.normalize();
                    var noiseX = vertex.x + time * 0.0002
                    var noiseY = vertex.y + time * 0.0005
                    var noiseZ = vertex.z + time * 0.0008
                    var planetNoise = noise.noise3D(noiseX, noiseY, noiseZ)
                    var user_amp = eval("1.".concat(user_audio_amp || "50"))
                    var distance = offset + audioArray[i]
                    if (audioArray[i] > 1) {
                        if (audio_wireframe === false && bass_wireframe) {
                            audio_wireframe = true
                            setTimeout(() => {
                                audio_wireframe = false
                            }, 250)
                        }
                        var distance = offset + planetNoise * amp * audioArray[i];
                        if (move_bg) {
                            particle.rotation.x += Math.random() * 0.0005;
                            particle.rotation.y -= Math.random() * 0.0040;
                            circle.rotation.x += 0.0020;
                            circle.rotation.y -= 0.0040;
                        }
                    }
                    vertex.multiplyScalar(distance <= 0 ? 1 : distance)
                });
            planet.geometry.verticesNeedUpdate = true;
            planet.geometry.normalsNeedUpdate = true;
            planet
                .geometry
                .computeVertexNormals();
            planet
                .geometry
                .computeFaceNormals();
        })
    }

    particle.rotation.x += 0.0000;
    particle.rotation.y -= 0.0010;
    circle.rotation.x -= 0.0020;
    circle.rotation.y -= 0.0030;
    skelet.rotation.x -= 0.0010;
    skelet.rotation.y += 0.0020;

    renderer.clear();

    renderer.render(scene, camera)
};
