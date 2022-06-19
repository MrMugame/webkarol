import { LineSegments, LineBasicMaterial, Float32BufferAttribute, BufferGeometry, Color } from 'three'

class CustomGrid extends LineSegments {

	constructor( sizeX = 10, sizeY = 10, divisionsX = 10, divisionsY = 10, color = 0x444444) {

		color = new Color( color );

		const stepX = sizeX / divisionsX;
        const stepY = sizeY / divisionsY;

		const vertices = [], colors = [];

        let j = 0;

        for (let i = 0, k = 0; i <= divisionsX; k += stepX, i++) {
            vertices.push( 0, 0, k, sizeY, 0, k );
            color.toArray( colors, j ); j += 3;
            color.toArray( colors, j ); j += 3;
        }

        for (let i = 0, k = 0; i <= divisionsY; k += stepY, i++) {
            vertices.push( k, 0, 0, k, 0, sizeX );
            color.toArray( colors, j ); j += 3;
            color.toArray( colors, j ); j += 3;
        }

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );

		this.type = 'CustomGrid';

	}

}


export { CustomGrid };