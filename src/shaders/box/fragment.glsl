uniform vec3 uColor;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDirection;

#include ../includes/pointLight.glsl

void main()
{
    // Simple wood-like procedural pattern
    float pattern = sin(vUv.y * 20.0 + sin(vUv.x * 10.0) * 2.0);
    pattern = step(0.5, pattern);
    
    vec3 woodColor = mix(uColor, uColor * 0.5, pattern);

    // Basic lighting
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewDirection);
    vec3 lightDirection = normalize(vec3(1.0, 2.0, 3.0));
    float lightness = max(0.2, dot(normal, lightDirection));
    
    vec3 color = woodColor * lightness;

    // Reflection (Fresnel effect) - Increased power for more noticeable edge reflection
    float fresnel = pow(1.0 + dot(viewDirection, normal), 2.0);
    
    // Use water colors for reflection to match the environment
    vec3 skyColor = vec3(0.7, 0.8, 1.0);
    vec3 reflectionColor = mix(uDepthColor, skyColor, normal.y * 0.5 + 0.5);
    
    // Apply reflection based on fresnel
    color = mix(color, reflectionColor, fresnel * 0.6);

    // Specular highlight
    vec3 reflectionVec = reflect(-lightDirection, normal);
    float specular = pow(max(0.0, dot(reflectionVec, -viewDirection)), 64.0);

    color += specular * 0.8;

    // Eerie Green Light (Synced with water)
    vec3 ghostLightColor = vec3(0.0, 1.0, 0.4);
    float ghostAngle = uTime * 0.6;
    float ghostRadius = 0.3 + sin(uTime * 0.3) * 0.15;
    vec3 ghostLightPosition = vec3(
        cos(ghostAngle) * ghostRadius + sin(uTime * 0.4) * 0.1,
        -0.1,
        sin(ghostAngle) * ghostRadius + cos(uTime * 0.5) * 0.1
    );

    float ghostDistance = distance(vPosition, ghostLightPosition);
    float ghostGlow = exp(-ghostDistance * 12.0); // Sharper decay (10.0 -> 12.0)
    color = mix(color, ghostLightColor, ghostGlow * 0.3 * max(0.0, dot(normal, normalize(ghostLightPosition - vPosition)))); // Reduced intensity (0.5 -> 0.3)

    gl_FragColor = vec4(color, 1.0);
}
