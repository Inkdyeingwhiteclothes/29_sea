uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uTime;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/pointLight.glsl

void main()
{

    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    
    //Base color
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    mixStrength = smoothstep(0.0,1.0,mixStrength);
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    //Light
    vec3 light =vec3(0.0);

    light += pointLight(
        vec3(1.0),
        10.0,
        normal,
        vec3(0.0, 0.25, 0.0),
        viewDirection,
        30.0,
        vPosition,
        0.95
    );

    color *= light;

    // Eerie Green Light (Visible movement around the box)
    vec3 ghostLightColor = vec3(0.0, 1.0, 0.4);
    float ghostAngle = uTime * 0.6;
    float ghostRadius = 0.3 + sin(uTime * 0.3) * 0.15;
    vec3 ghostLightPosition = vec3(
        cos(ghostAngle) * ghostRadius + sin(uTime * 0.4) * 0.1,
        -0.1, // Near surface to be visible
        sin(ghostAngle) * ghostRadius + cos(uTime * 0.5) * 0.1
    );

    float ghostDistance = distance(vPosition, ghostLightPosition);
    // Use a smoother glow effect
    float ghostGlow = exp(-ghostDistance * 10.0); // Sharper decay (8.0 -> 10.0)
    color = mix(color, ghostLightColor, ghostGlow * 0.4); // Reduced intensity (0.6 -> 0.4)
    
    //Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}