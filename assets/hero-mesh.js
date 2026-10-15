(function () {
    'use strict';

    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    var hero = canvas.closest('.hero');
    if (!hero) return;

    var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var prefersReduced = reduceQuery.matches;

    var gl = canvas.getContext('webgl', {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power'
    }) || canvas.getContext('experimental-webgl');
    if (!gl) { return; }

    var VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

    var FRAG = [
        'precision highp float;',
        'uniform vec2 u_res;',
        'uniform float u_time;',
        'uniform vec2 u_mouse;',
        'uniform float u_scroll;',
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }',
        'float noise(vec2 p){',
        '  vec2 i = floor(p); vec2 f = fract(p);',
        '  vec2 u = f * f * (3.0 - 2.0 * f);',
        '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
        '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
        '}',
        'float fbm(vec2 p){',
        '  float v = 0.0; float a = 0.5;',
        '  for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }',
        '  return v;',
        '}',
        'void main(){',
        '  vec2 uv = gl_FragCoord.xy / u_res.xy;',
        '  float aspect = u_res.x / u_res.y;',
        '  vec2 p = vec2(uv.x * aspect, uv.y);',
        '  vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);',
        '  float t = u_time * 0.06;',
        '  float n = fbm(p * 2.3 + t * 1.4);',
        '  vec2 q = p + vec2(n - 0.5) * 0.55;',
        '  q.y += u_scroll * 0.35;',
        '  float d1 = length(q - vec2(0.34 * aspect + 0.16 * sin(t * 1.1), 0.42 + 0.10 * cos(t * 0.9)));',
        '  float d2 = length(q - vec2(0.82 * aspect + 0.10 * cos(t * 0.8), 0.68 + 0.12 * sin(t * 1.3)));',
        '  float d3 = length(q - vec2(0.60 * aspect + 0.12 * sin(t * 0.7), 0.18 + 0.10 * cos(t * 1.2)));',
        '  float d4 = length(q - m);',
        '  vec3 c1 = vec3(0.486, 0.416, 1.000);',
        '  vec3 c2 = vec3(0.133, 0.827, 0.933);',
        '  vec3 c3 = vec3(0.310, 0.550, 1.000);',
        '  vec3 col = vec3(0.0);',
        '  col += c1 * smoothstep(0.78, 0.0, d1) * 0.52;',
        '  col += c2 * smoothstep(0.72, 0.0, d2) * 0.30;',
        '  col += c3 * smoothstep(0.82, 0.0, d3) * 0.26;',
        '  col += c1 * smoothstep(0.55, 0.0, d4) * 0.30;',
        '  col += c2 * smoothstep(0.28, 0.0, d4) * 0.10;',
        '  float vig = smoothstep(1.25, 0.15, length(uv - 0.5));',
        '  col *= 0.62 * (0.55 + 0.45 * vig);',
        '  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.018;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
    ].join('\n');

    function compile(type, src) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uMouse = gl.getUniformLocation(prog, 'u_mouse');
    var uScroll = gl.getUniformLocation(prog, 'u_scroll');

    var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    var mouse = [0.5, 0.5];
    var mouseTarget = [0.5, 0.5];
    var running = false;
    var rafId = 0;
    var heroVisible = true;
    var start = performance.now();

    function resize() {
        var rect = canvas.getBoundingClientRect();
        var w = Math.max(1, Math.round(rect.width * DPR));
        var h = Math.max(1, Math.round(rect.height * DPR));
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
        }
    }

    function draw(now) {
        var t = (now - start) / 1000;
        mouse[0] += (mouseTarget[0] - mouse[0]) * 0.055;
        mouse[1] += (mouseTarget[1] - mouse[1]) * 0.055;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, t);
        gl.uniform2f(uMouse, mouse[0], mouse[1]);
        gl.uniform1f(uScroll, window.scrollY / Math.max(1, canvas.clientHeight));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now) {
        rafId = requestAnimationFrame(loop);
        if (document.hidden || !heroVisible) return;
        resize();
        draw(now);
    }

    function startLoop() {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(loop);
    }

    function stopLoop() {
        running = false;
        cancelAnimationFrame(rafId);
    }

    window.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        mouseTarget[0] = (e.clientX - rect.left) / rect.width;
        mouseTarget[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    }, { passive: true });

    var resizeTick = false;
    window.addEventListener('resize', function () {
        if (resizeTick) return;
        resizeTick = true;
        requestAnimationFrame(function () { resizeTick = false; resize(); });
    }, { passive: true });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            heroVisible = entries[0].isIntersecting;
        }, { threshold: 0 }).observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stopLoop(); } else { startLoop(); }
    });

    resize();
    hero.classList.add('webgl-on');

    if (prefersReduced || !running) {
        if (prefersReduced) {
            draw(performance.now());
        } else {
            startLoop();
        }
    }

    reduceQuery.addEventListener('change', function (e) {
        if (e.matches) { stopLoop(); draw(performance.now()); } else { startLoop(); }
    });
})();
