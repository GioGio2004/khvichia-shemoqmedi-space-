/**
 * One panel of the work gallery: a picture of a website on a screen, set in a
 * larger, dim, blurred copy of the same picture.
 *
 * Every panel is a flat sheet that the vertex shader wraps onto the inside of
 * a cylinder and then pulls out towards the screen's corners, so the row
 * curves towards the viewer at both ends. Opening a panel undoes all of that
 * for it: uFlat takes it from its bent place to a plain flat rectangle.
 */
export const vertexShader = /* glsl */ `
  uniform vec2 uSize;        // the panel's width and height while it is in the row
  uniform float uOffset;     // how far along the row the panel's centre is (0 = middle of the screen)
  uniform float uRadius;     // radius of the cylinder the row is wrapped onto
  uniform float uPush;       // how far the row is pushed back while it moves
  uniform float uLift;       // the row sits a little off the middle
  uniform float uEnd;        // the angle at which the row reaches the end of the screen
  uniform float uLens;       // how hard the picture is pulled out towards the screen's corners
  uniform float uFlat;       // 0 = bent, in the row; 1 = flat, opened
  uniform vec2 uFlatSize;    // the opened rectangle's width and height
  uniform vec2 uFlatCenter;  // and where its middle is

  varying vec2 vUv;
  varying float vSide;       // -1 at the left end of the screen, 1 at the right

  void main() {
    vUv = uv;
    vec2 p = position.xy * uSize;
    float along = p.x + uOffset;
    float angle = clamp(along / uRadius, -1.45, 1.45);
    vec3 bent = vec3(sin(angle) * uRadius, p.y + uLift, (1.0 - cos(angle)) * uRadius - uPush);
    vSide = clamp(angle / uEnd, -1.0, 1.0) * (1.0 - uFlat);
    vec4 clip = projectionMatrix * viewMatrix * vec4(bent, 1.0);

    // A lens over the whole row: the further a point is from the middle of the
    // screen, the further out it is pushed, so panels stretch into the corners.
    vec2 curved = clip.xy / clip.w;
    curved *= 1.0 + uLens * dot(curved, curved);

    // The same sheet, simply flat and facing the viewer.
    vec4 plain = projectionMatrix * viewMatrix * vec4(position.xy * uFlatSize + uFlatCenter, 0.0, 1.0);

    gl_Position = vec4(mix(curved, plain.xy / plain.w, uFlat), 0.0, 1.0);
  }
`

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uShot;
  uniform float uShotAspect;   // the picture's width / height
  uniform vec2 uShape;         // the panel's width and height as it is drawn right now
  uniform vec2 uInset;         // the screen's width and height as a share of the panel
  uniform float uCorner;       // corner radius, in the same units as uShape
  uniform float uSplit;        // how far red and blue drift apart (grows with speed)
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vSide;

  float roundedBox(vec2 p, vec2 extent, float r) {
    vec2 q = abs(p) - extent + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  // Red, green and blue read a little apart, like a cheap lens.
  vec3 apart(vec2 uv, float split, float blur) {
    return vec3(texture2D(uShot, uv + vec2(split, 0.0), blur).r, texture2D(uShot, uv, blur).g, texture2D(uShot, uv - vec2(split, 0.0), blur).b);
  }

  // The picture well out of focus: a coarse copy of it, read at five nearby points and averaged.
  vec3 blurred(vec2 uv) {
    vec2 o = vec2(0.014, 0.014 * uShotAspect);
    vec3 sum = texture2D(uShot, uv, 3.0).rgb * 2.0;
    sum += texture2D(uShot, uv + o, 3.0).rgb + texture2D(uShot, uv - o, 3.0).rgb;
    sum += texture2D(uShot, uv + vec2(o.x, -o.y), 3.0).rgb + texture2D(uShot, uv + vec2(-o.x, o.y), 3.0).rgb;
    return sum / 6.0;
  }

  // Fits the picture into a box of another shape without squeezing it: the top stays, the rest is cut.
  vec2 fit(vec2 uv, float box) {
    if (box > uShotAspect) return vec2(uv.x, 1.0 - (1.0 - uv.y) * (uShotAspect / box));
    return vec2((uv.x - 0.5) * (box / uShotAspect) + 0.5, uv.y);
  }

  void main() {
    float d = roundedBox((vUv - 0.5) * uShape, uShape * 0.5, uCorner);
    // Never zero: right on the panel's centre line the distance stops changing from pixel to pixel.
    float soft = max(fwidth(d), uShape.y * 0.0004);
    float shape = 1.0 - smoothstep(-soft, soft, d);
    float split = uSplit * (0.35 + abs(vSide));

    // Behind: the same picture, larger, out of focus, nearly colourless and dim. It slides against the panel as the row moves.
    vec2 behind = fit((vUv - 0.5) * 0.7 + 0.5 + vec2(vSide * 0.035, 0.0), uShape.x / uShape.y);
    vec3 back = blurred(behind);
    vec3 color = mix(vec3(dot(back, vec3(0.299, 0.587, 0.114))), back, 0.2) * 0.5;

    // The screen in the middle, sharp, with a soft shadow around it.
    vec2 p = vUv - 0.5;
    vec2 away = (abs(p) - uInset * 0.5) * uShape;
    float edge = max(away.x, away.y);
    float thin = max(fwidth(edge), uShape.y * 0.0004);
    float inScreen = 1.0 - smoothstep(-thin, thin, edge);
    color *= 1.0 - 0.45 * (1.0 - smoothstep(0.0, uShape.y * 0.07, edge)) * (1.0 - inScreen);
    vec2 onScreen = fit(p / uInset + 0.5, (uInset.x * uShape.x) / (uInset.y * uShape.y));
    color = mix(color, apart(onScreen, split, 0.0), inScreen);

    // Panels at the ends of the screen sit a little in shade.
    color *= 1.0 - 0.22 * smoothstep(0.5, 1.0, abs(vSide));

    gl_FragColor = vec4(color, shape * uOpacity);
  }
`
