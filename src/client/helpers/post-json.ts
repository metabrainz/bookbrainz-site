/*
 * Copyright (C) 2026  Ansh Goyal
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

// The outcome of a POST to one of the Express handlers; error is the server's message, null when there is none
export type PostResult = {ok: true} | {error: string | null, ok: false};

// Posts data as JSON and turns every failure, of the network or of the server, into a result instead of a thrown error
export async function postJSON(url: string, data: unknown): Promise<PostResult> {
	let response: Response;
	try {
		response = await fetch(url, {
			body: JSON.stringify(data),
			headers: {'Content-Type': 'application/json; charset=utf-8'},
			method: 'POST'
		});
	}
	catch {
		return {error: null, ok: false};
	}
	if (response.ok) {
		return {ok: true};
	}
	// TODO: move the Express handlers to RFC 9457 problem details (application/problem+json) and remove this
	// defensive parsing. Today some handlers reply with HTML or without a JSON body, so the message is optional.
	const body: unknown = await response.json().catch(() => null);
	const error = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string' ? body.error : null;
	return {error, ok: false};
}
