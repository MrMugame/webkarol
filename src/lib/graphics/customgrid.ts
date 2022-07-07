import { LineSegments, LineBasicMaterial, Float32BufferAttribute, BufferGeometry, Color } from 'three'

export class CustomGrid extends LineSegments {
	constructor( sizeX: number = 10, sizeY: number = 10, divisionsX: number = 10, divisionsY: number = 10, hexColor: number = 0x444444) {

		const color = new Color( hexColor );

		const stepX = sizeX / divisionsX;
        const stepY = sizeY / divisionsY;

		const vertices:number[] = [], colors: number[] = [];

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