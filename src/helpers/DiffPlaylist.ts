import { literal } from '../helpers'
import { GetMovedSegments } from './GetMovedSegments'
import { RundownId, SegmentId } from './id'
import { ResolvedPlaylist } from './ResolveRundownIntoPlaylist'

export enum PlaylistChangeType {
	PlaylistChangeSegmentDeleted,
	PlaylistChangeSegmentCreated,
	PlaylistChangeSegmentChanged,
	PlaylistChangeSegmentMoved,
	PlaylistChangeRundownDeleted,
	PlaylistChangeRundownCreated,
}

export interface PlaylistChangeBase {
	type: PlaylistChangeType
}

export interface PlaylistChangeSegmentDeleted extends PlaylistChangeBase {
	type: PlaylistChangeType.PlaylistChangeSegmentDeleted
	rundownExternalId: string
	segmentExternalId: string
}

export interface PlaylistChangeSegmentCreated extends PlaylistChangeBase {
	type: PlaylistChangeType.PlaylistChangeSegmentCreated
	rundownExternalId: string
	segmentExternalId: string
}

export interface PlaylistChangeSegmentChanged extends PlaylistChangeBase {
	type: PlaylistChangeType.PlaylistChangeSegmentChanged
	rundownExternalId: string
	segmentExternalId: string
}

export interface PlaylistChangeSegmentMoved extends PlaylistChangeBase {
	type: PlaylistChangeType.PlaylistChangeSegmentMoved
	rundownExternalId: string
	segmentExternalId: string
}

export interface PlaylistChangeRundownDeleted extends PlaylistChangeBase {
	type: PlaylistChangeType.PlaylistChangeRundownDeleted
	rundownExternalId: string
}

export interface PlaylistChangeRundownCreated extends PlaylistChangeBase {
	type: PlaylistChangeType.PlaylistChangeRundownCreated
	rundownExternalId: string
}

export type PlaylistChange =
	| PlaylistChangeSegmentCreated
	| PlaylistChangeSegmentDeleted
	| PlaylistChangeSegmentChanged
	| PlaylistChangeSegmentMoved
	| PlaylistChangeRundownCreated
	| PlaylistChangeRundownDeleted

export function DiffPlaylist(
	playlist: ResolvedPlaylist,
	previous: ResolvedPlaylist
): {
	changes: PlaylistChange[]
	segmentChanges: Map<
		RundownId,
		{
			// rundownId: changes
			movedSegments: SegmentId[]
			notMovedSegments: SegmentId[]
			insertedSegments: SegmentId[]
			deletedSegments: SegmentId[]
		}
	>
} {
	let changes: PlaylistChange[] = []
	let segmentChanges: Map<
		RundownId,
		{
			// rundownId: changes
			movedSegments: SegmentId[]
			notMovedSegments: SegmentId[]
			insertedSegments: SegmentId[]
			deletedSegments: SegmentId[]
		}
	> = new Map()

	for (let rundown of previous) {
		let newRundown = playlist.find((p) => p.rundownId === rundown.rundownId)
		if (!newRundown) {
			changes.push(
				literal<PlaylistChangeRundownDeleted>({
					type: PlaylistChangeType.PlaylistChangeRundownDeleted,
					rundownExternalId: rundown.rundownId,
				})
			)
			segmentChanges.set(rundown.rundownId, {
				movedSegments: [],
				notMovedSegments: [],
				insertedSegments: [],
				deletedSegments: [],
			})
			continue
		}
	}

	for (let rundown of playlist) {
		const prevRundown = previous.find((p) => p.rundownId === rundown.rundownId)
		if (!prevRundown) {
			changes.push(
				literal<PlaylistChangeRundownCreated>({
					type: PlaylistChangeType.PlaylistChangeRundownCreated,
					rundownExternalId: rundown.rundownId,
				})
			)
			segmentChanges.set(rundown.rundownId, {
				movedSegments: [],
				notMovedSegments: [],
				insertedSegments: [],
				deletedSegments: [],
			})
			continue
		}

		const { movedSegments, notMovedSegments, insertedSegments, deletedSegments } = GetMovedSegments(
			prevRundown.segments,
			rundown.segments
		)

		movedSegments.forEach((s) =>
			changes.push(
				literal<PlaylistChangeSegmentMoved>({
					type: PlaylistChangeType.PlaylistChangeSegmentMoved,
					rundownExternalId: rundown.rundownId,
					segmentExternalId: s,
				})
			)
		)

		insertedSegments.forEach((s) =>
			changes.push(
				literal<PlaylistChangeSegmentCreated>({
					type: PlaylistChangeType.PlaylistChangeSegmentCreated,
					rundownExternalId: rundown.rundownId,
					segmentExternalId: s,
				})
			)
		)

		deletedSegments.forEach((s) =>
			changes.push(
				literal<PlaylistChangeSegmentDeleted>({
					type: PlaylistChangeType.PlaylistChangeSegmentDeleted,
					rundownExternalId: rundown.rundownId,
					segmentExternalId: s,
				})
			)
		)

		segmentChanges.set(rundown.rundownId, {
			movedSegments,
			notMovedSegments,
			insertedSegments,
			deletedSegments,
		})
	}

	return { changes, segmentChanges }
}
