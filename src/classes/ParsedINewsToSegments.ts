import { RundownSegment } from './datastructures/Segment'
import { IRawStory } from './RundownManager'
import * as _ from 'underscore'

export interface IParsedElement {
	data: {
		id?: string
		name?: string
		type?: string
		float: string
		script?: string
		objectType?: string
		duration?: string
		clipName?: string
	}
}
export class ParsedINewsIntoSegments {

	static parse (sheetId: string, inewsRaw: IRawStory[]): RundownSegment[] {
		let segments: RundownSegment[] = []

		inewsRaw.forEach(story => {
			let segment = new RundownSegment(
				sheetId, 
				story.story,
				story.modified,
				story.story.id || '', 
				segments.length, 
				story.storyName || '', 
				false
			)
			segments.push(segment)
		})
		return segments
	}

}