/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

	uniforms: {
		"mRefractionRatio": { value: 1.02 },
		"mFresnelBias": { value: 0.1 },
		"mFresnelPower": { value: 2.0 },
		"mFresnelScale": { value: 1.0 },
		"rimColor": { value: new THREE.Vector4(1, 1, 1, 0.9)},
		"baseColor": { value: new THREE.Vector4(0, 1, 1, 0.1)},
	},

	vertexShader: [
		"uniform vec4 rimColor;",
		"uniform vec4 baseColor;",
		"uniform float mRefractionRatio;",
		"uniform float mFresnelBias;",
		"uniform float mFresnelScale;",
		"uniform float mFresnelPower;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

			"vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

			"vec3 I = worldPosition.xyz - cameraPosition;",

			"vReflect = reflect( I, worldNormal );",
			"vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
			"vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );",
			"vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );",
			"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
		"uniform vec4 rimColor;",
		"uniform vec4 baseColor;",
		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",
			"gl_FragColor = mix( baseColor, rimColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",
		"}"

	].join( "\n" )

};